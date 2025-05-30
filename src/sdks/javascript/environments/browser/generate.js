import fs from "fs";
import { readFileSync } from "fs";
import { fileURLToPath } from "url";
import { dirname, join } from "path";
// import {
// 	cognitoTemplate,
// 	cognitoSetupInstructions,
// } from "../../../../common/cognito-config.js";
const __dirname = dirname(fileURLToPath(import.meta.url));
export const generateBrowserProject = (answers, projectDir) => {
	// 1. Generate main JavaScript file
	const jsTemplate = readFileSync(
		join(__dirname, "templates/index.js"),
		"utf-8"
	);
	const populatedJs = jsTemplate
		.replace(/{{serviceClient}}/g, answers.serviceClient)
		.replace(/{{service}}/g, answers.service)
		.replace(/{{operation}}/g, answers.operation);
	// .replace(
	// 	/{{cognitoConfig}}/g,
	// 	cognitoTemplate(answers.region, answers.serviceClient)
	// );
	// 2. Generate HTML file
	const htmlTemplate = readFileSync(
		join(__dirname, "templates/index.html"),
		"utf-8"
	);
	// 3. Create package.json
	const pkg = {
		name: answers.projectName,
		version: "1.0.0",
		private: true,
		scripts: {
			start: "vite --open",
			build: "vite build",
		},
		devDependencies: {
			vite: "^4.4.0",
		},
		dependencies: {
			[answers.service]: "^3.535.0",
			"@aws-sdk/credential-provider-cognito-identity": "^3.535.0",
		},
	};
	// 4. Write files
	fs.writeFileSync(join(projectDir, "index.js"), populatedJs);
	fs.writeFileSync(join(projectDir, "index.html"), htmlTemplate);
	fs.writeFileSync(
		join(projectDir, "package.json"),
		JSON.stringify(pkg, null, 2)
	);
	// 5. Add security documentation
	fs.writeFileSync(
		join(projectDir, "COGNITO_SETUP.md")
		// cognitoSetupInstructions(answers.service, answers.operation)
	);
};
