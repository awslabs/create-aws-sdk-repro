import { readFileSync } from "fs";
import { fileURLToPath } from "url";
import { dirname, join } from "path";
import { getCognitoCredentials } from "../../../../common/cognito-config";
const __dirname = dirname(fileURLToPath(import.meta.url));
export const generateBrowserProject = (answers, projectDir) => {
	// Generate main JS file
	const jsTemplate = readFileSync(
		join(__dirname, "templates/index.js"),
		"utf-8"
	)
		.replace(/{{serviceClient}}/g, answers.serviceClient)
		.replace(/{{credentials}}/g, getCognitoCredentials(answers.region));

	// Generate HTML file
	const htmlTemplate = readFileSync(
		join(__dirname, "templates/index.html"),
		"utf-8"
	);
	// Write project files
	fs.writeFileSync(join(projectDir, "index.js"), jsTemplate);
	fs.writeFileSync(join(projectDir, "index.html"), htmlTemplate);
	// Browser-specific package.json
	const pkg = {
		scripts: {
			start: "vite --open",
		},
		devDependencies: {
			vite: "^4.4.0",
		},
		dependencies: {
			[answers.service]: "^3.535.0",
			"@aws-sdk/credential-provider-cognito-identity": "^3.535.0",
		},
	};

	fs.writeFileSync(
		join(projectDir, "package.json"),
		JSON.stringify(pkg, null, 2)
	);
};
