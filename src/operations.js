import { execSync } from "child_process";
import fs from "fs";
import path from "path";
import os from "os";

/**
 * Attempts to get available operations for a service by installing and inspecting the package
 * @param {string} servicePackage - The service package name (e.g., "@aws-sdk/client-s3")
 * @returns {Promise<string[]>} - Array of operation names in kebab-case, or empty array if unavailable
 */
export async function getServiceOperations(servicePackage) {
	let tempDir = null;
	try {
		// Create a temporary directory
		tempDir = path.join(os.tmpdir(), `aws-sdk-inspect-${Date.now()}`);
		fs.mkdirSync(tempDir, { recursive: true });
		
		// Create a minimal package.json
		fs.writeFileSync(
			path.join(tempDir, "package.json"),
			JSON.stringify({ 
				name: "temp-inspector",
				version: "1.0.0",
				type: "module"
			})
		);
		
		// Install the package
		console.log(`  Installing ${servicePackage}...`);
		execSync(`npm install ${servicePackage}@latest --no-save --silent --no-audit --no-fund --loglevel=error`, {
			cwd: tempDir,
			stdio: "pipe",
			timeout: 60000, // 60 second timeout
		});
		
		// Find the package directory
		const packagePath = path.join(tempDir, "node_modules", ...servicePackage.split('/'));
		
		if (!fs.existsSync(packagePath)) {
			throw new Error(`Package not found at ${packagePath}`);
		}
		
		// Read package.json to find exports
		const packageJsonPath = path.join(packagePath, "package.json");
		const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, "utf-8"));
		
		const operations = new Set();
		
		// Method 1: Parse exports field from package.json
		if (packageJson.exports) {
			for (const key of Object.keys(packageJson.exports)) {
				// Look for command exports like "./commands/ListBucketsCommand"
				const commandMatch = key.match(/\/commands\/([A-Z][a-zA-Z0-9]+Command)/);
				if (commandMatch) {
					const commandName = commandMatch[1];
					const operationName = commandName
						.replace(/Command$/, '')
						.replace(/([A-Z])/g, (match, p1, offset) => 
							offset > 0 ? `-${p1.toLowerCase()}` : p1.toLowerCase()
						);
					operations.add(operationName);
				}
			}
		}
		
		// Method 2: Scan the commands directory if it exists
		const commandsDir = path.join(packagePath, "dist-cjs", "commands");
		if (fs.existsSync(commandsDir)) {
			const files = fs.readdirSync(commandsDir);
			for (const file of files) {
				if (file.endsWith('Command.js')) {
					const commandName = file.replace('.js', '');
					const operationName = commandName
						.replace(/Command$/, '')
						.replace(/([A-Z])/g, (match, p1, offset) => 
							offset > 0 ? `-${p1.toLowerCase()}` : p1.toLowerCase()
						);
					operations.add(operationName);
				}
			}
		}
		
		// Method 3: Try dist-es directory
		const commandsDirES = path.join(packagePath, "dist-es", "commands");
		if (fs.existsSync(commandsDirES)) {
			const files = fs.readdirSync(commandsDirES);
			for (const file of files) {
				if (file.endsWith('Command.js') || file.endsWith('Command.mjs')) {
					const commandName = file.replace(/\.(m)?js$/, '');
					const operationName = commandName
						.replace(/Command$/, '')
						.replace(/([A-Z])/g, (match, p1, offset) => 
							offset > 0 ? `-${p1.toLowerCase()}` : p1.toLowerCase()
						);
					operations.add(operationName);
				}
			}
		}
		
		// Cleanup
		if (tempDir && fs.existsSync(tempDir)) {
			fs.rmSync(tempDir, { recursive: true, force: true });
		}
		
		const result = Array.from(operations).sort();
		console.log(`  Found ${result.length} operations`);
		return result;
		
	} catch (error) {
		// Cleanup on error
		if (tempDir && fs.existsSync(tempDir)) {
			try {
				fs.rmSync(tempDir, { recursive: true, force: true });
			} catch (cleanupError) {
				// Ignore cleanup errors
			}
		}
		
		// If we can't fetch operations, return empty array
		console.warn(`  Could not fetch operations: ${error.message}`);
		return [];
	}
}

/**
 * Validates operation name format (kebab-case)
 * @param {string} operation - Operation name to validate
 * @returns {boolean} - True if valid kebab-case format
 */
export function isValidOperationFormat(operation) {
	// Must be kebab-case: lowercase letters, numbers, and hyphens only
	// Must start with a letter
	const kebabCasePattern = /^[a-z][a-z0-9]*(-[a-z0-9]+)*$/;
	return kebabCasePattern.test(operation);
}

/**
 * Validates if an operation exists for a given service
 * @param {string} operation - Operation name in kebab-case
 * @param {string[]} availableOperations - List of available operations
 * @returns {boolean} - True if operation exists
 */
export function isValidOperation(operation, availableOperations) {
	if (availableOperations.length === 0) {
		// If we don't have the list, just validate format
		return isValidOperationFormat(operation);
	}
	return availableOperations.includes(operation);
}

/**
 * Gets operation suggestions based on partial input
 * @param {string} input - Partial operation name
 * @param {string[]} availableOperations - List of available operations
 * @returns {string[]} - Array of matching operation names
 */
export function getOperationSuggestions(input, availableOperations) {
	if (availableOperations.length === 0) return [];
	
	const lowerInput = input.toLowerCase();
	return availableOperations.filter(op => 
		op.toLowerCase().includes(lowerInput)
	).slice(0, 20); // Limit to 20 suggestions
}

/**
 * Provides helpful error message for invalid operations
 * @param {string} operation - The invalid operation name
 * @param {string[]} availableOperations - List of available operations
 * @returns {string} - Error message with suggestions
 */
export function getOperationErrorMessage(operation, availableOperations) {
	if (!isValidOperationFormat(operation)) {
		return "Operation must be in kebab-case format (e.g., list-buckets, get-object)";
	}
	
	if (availableOperations.length === 0) {
		return "Could not validate operation. Please ensure the operation name is correct.";
	}
	
	// Find similar operations (Levenshtein distance or simple substring match)
	const similar = availableOperations.filter(op => {
		const distance = levenshteinDistance(operation, op);
		return distance <= 2; // Allow up to 2 character differences
	});
	
	if (similar.length > 0) {
		return `Operation not found. Did you mean: ${similar.slice(0, 3).join(", ")}?`;
	}
	
	return `Operation not found. Available operations: ${availableOperations.slice(0, 5).join(", ")}...`;
}

/**
 * Calculate Levenshtein distance between two strings
 * @param {string} a - First string
 * @param {string} b - Second string
 * @returns {number} - Edit distance
 */
function levenshteinDistance(a, b) {
	const matrix = [];
	
	for (let i = 0; i <= b.length; i++) {
		matrix[i] = [i];
	}
	
	for (let j = 0; j <= a.length; j++) {
		matrix[0][j] = j;
	}
	
	for (let i = 1; i <= b.length; i++) {
		for (let j = 1; j <= a.length; j++) {
			if (b.charAt(i - 1) === a.charAt(j - 1)) {
				matrix[i][j] = matrix[i - 1][j - 1];
			} else {
				matrix[i][j] = Math.min(
					matrix[i - 1][j - 1] + 1, // substitution
					matrix[i][j - 1] + 1,     // insertion
					matrix[i - 1][j] + 1      // deletion
				);
			}
		}
	}
	
	return matrix[b.length][a.length];
}
