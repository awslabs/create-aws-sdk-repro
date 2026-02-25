// Comprehensive list of AWS regions
// Source: https://docs.aws.amazon.com/general/latest/gr/rande.html

export const AWS_REGIONS = [
	// US Regions
	"us-east-1",      // US East (N. Virginia)
	"us-east-2",      // US East (Ohio)
	"us-west-1",      // US West (N. California)
	"us-west-2",      // US West (Oregon)
	
	// Africa
	"af-south-1",     // Africa (Cape Town)
	
	// Asia Pacific
	"ap-east-1",      // Asia Pacific (Hong Kong)
	"ap-south-1",     // Asia Pacific (Mumbai)
	"ap-south-2",     // Asia Pacific (Hyderabad)
	"ap-northeast-1", // Asia Pacific (Tokyo)
	"ap-northeast-2", // Asia Pacific (Seoul)
	"ap-northeast-3", // Asia Pacific (Osaka)
	"ap-southeast-1", // Asia Pacific (Singapore)
	"ap-southeast-2", // Asia Pacific (Sydney)
	"ap-southeast-3", // Asia Pacific (Jakarta)
	"ap-southeast-4", // Asia Pacific (Melbourne)
	
	// Canada
	"ca-central-1",   // Canada (Central)
	"ca-west-1",      // Canada (Calgary)
	
	// Europe
	"eu-central-1",   // Europe (Frankfurt)
	"eu-central-2",   // Europe (Zurich)
	"eu-west-1",      // Europe (Ireland)
	"eu-west-2",      // Europe (London)
	"eu-west-3",      // Europe (Paris)
	"eu-south-1",     // Europe (Milan)
	"eu-south-2",     // Europe (Spain)
	"eu-north-1",     // Europe (Stockholm)
	
	// Middle East
	"me-south-1",     // Middle East (Bahrain)
	"me-central-1",   // Middle East (UAE)
	
	// South America
	"sa-east-1",      // South America (São Paulo)
	
	// AWS GovCloud (US)
	"us-gov-east-1",  // AWS GovCloud (US-East)
	"us-gov-west-1",  // AWS GovCloud (US-West)
	
	// China (requires separate account)
	"cn-north-1",     // China (Beijing)
	"cn-northwest-1", // China (Ningxia)
];

// Region display names for better UX
const REGION_NAMES = {
	"us-east-1": "US East (N. Virginia)",
	"us-east-2": "US East (Ohio)",
	"us-west-1": "US West (N. California)",
	"us-west-2": "US West (Oregon)",
	"af-south-1": "Africa (Cape Town)",
	"ap-east-1": "Asia Pacific (Hong Kong)",
	"ap-south-1": "Asia Pacific (Mumbai)",
	"ap-south-2": "Asia Pacific (Hyderabad)",
	"ap-northeast-1": "Asia Pacific (Tokyo)",
	"ap-northeast-2": "Asia Pacific (Seoul)",
	"ap-northeast-3": "Asia Pacific (Osaka)",
	"ap-southeast-1": "Asia Pacific (Singapore)",
	"ap-southeast-2": "Asia Pacific (Sydney)",
	"ap-southeast-3": "Asia Pacific (Jakarta)",
	"ap-southeast-4": "Asia Pacific (Melbourne)",
	"ca-central-1": "Canada (Central)",
	"ca-west-1": "Canada (Calgary)",
	"eu-central-1": "Europe (Frankfurt)",
	"eu-central-2": "Europe (Zurich)",
	"eu-west-1": "Europe (Ireland)",
	"eu-west-2": "Europe (London)",
	"eu-west-3": "Europe (Paris)",
	"eu-south-1": "Europe (Milan)",
	"eu-south-2": "Europe (Spain)",
	"eu-north-1": "Europe (Stockholm)",
	"me-south-1": "Middle East (Bahrain)",
	"me-central-1": "Middle East (UAE)",
	"sa-east-1": "South America (São Paulo)",
	"us-gov-east-1": "AWS GovCloud (US-East)",
	"us-gov-west-1": "AWS GovCloud (US-West)",
	"cn-north-1": "China (Beijing)",
	"cn-northwest-1": "China (Ningxia)",
};

/**
 * Validates if a region code is valid
 * @param {string} region - The region code (e.g., "us-west-2")
 * @returns {boolean} - True if valid, false otherwise
 */
export function isValidRegion(region) {
	return AWS_REGIONS.includes(region.toLowerCase());
}

/**
 * Gets the display name for a region
 * @param {string} region - The region code
 * @returns {string} - Display name or the region code if not found
 */
export function getRegionDisplayName(region) {
	return REGION_NAMES[region] || region;
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

/**
 * Finds similar region codes based on typos
 * @param {string} region - The region code to check
 * @param {number} maxDistance - Maximum edit distance (default: 2)
 * @returns {string[]} - Array of similar region codes
 */
export function findSimilarRegions(region, maxDistance = 2) {
	const lowerRegion = region.toLowerCase();
	
	return AWS_REGIONS.filter(validRegion => {
		const distance = levenshteinDistance(lowerRegion, validRegion);
		return distance > 0 && distance <= maxDistance;
	}).slice(0, 5); // Limit to top 5 suggestions
}

/**
 * Gets region suggestions based on partial input
 * @param {string} input - Partial region code
 * @returns {string[]} - Array of matching region codes
 */
export function getRegionSuggestions(input) {
	if (!input) return AWS_REGIONS;
	
	const lowerInput = input.toLowerCase();
	return AWS_REGIONS.filter(region => 
		region.toLowerCase().includes(lowerInput)
	);
}

/**
 * Validates region format (basic pattern check)
 * @param {string} region - Region code to validate
 * @returns {boolean} - True if format is valid
 */
export function isValidRegionFormat(region) {
	// AWS region format: 2-3 letter prefix, direction, number
	// Examples: us-west-2, ap-southeast-1, eu-central-1
	const regionPattern = /^[a-z]{2,3}-(north|south|east|west|central|northeast|northwest|southeast|southwest)-\d+$/;
	const govCloudPattern = /^us-gov-(east|west)-\d+$/;
	const chinaPattern = /^cn-(north|northwest)-\d+$/;
	
	return regionPattern.test(region) || govCloudPattern.test(region) || chinaPattern.test(region);
}

/**
 * Provides helpful error message for invalid regions
 * @param {string} region - The invalid region code
 * @returns {string} - Error message with suggestions
 */
export function getRegionErrorMessage(region) {
	const lowerRegion = region.toLowerCase();
	
	// Check if it's a valid format but not in our list
	if (!isValidRegionFormat(lowerRegion)) {
		return `Invalid region format. AWS regions follow the pattern: prefix-direction-number (e.g., us-west-2, eu-central-1)`;
	}
	
	// Find similar regions
	const similar = findSimilarRegions(lowerRegion);
	
	if (similar.length > 0) {
		const suggestions = similar.map(r => `${r} (${getRegionDisplayName(r)})`).join(", ");
		return `Region not found. Did you mean: ${suggestions}?`;
	}
	
	// Check for common mistakes
	if (lowerRegion.includes("_")) {
		const corrected = lowerRegion.replace(/_/g, "-");
		if (isValidRegion(corrected)) {
			return `Invalid format. Did you mean: ${corrected}? (use hyphens, not underscores)`;
		}
	}
	
	return `Region not found. Use format: prefix-direction-number (e.g., us-west-2, eu-central-1)`;
}

/**
 * Converts Java-style region format to standard format
 * @param {string} region - Region in Java format (e.g., "US_WEST_1")
 * @returns {string} - Region in standard format (e.g., "us-west-1")
 */
export function javaRegionToStandard(region) {
	return region.toLowerCase().replace(/_/g, "-");
}

/**
 * Converts standard region format to Java-style format
 * @param {string} region - Region in standard format (e.g., "us-west-1")
 * @returns {string} - Region in Java format (e.g., "US_WEST_1")
 */
export function standardRegionToJava(region) {
	return region.toUpperCase().replace(/-/g, "_");
}
