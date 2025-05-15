import { readFileSync } from "fs";
import { fileURLToPath } from "url";
import { dirname, join } from "path";
import { getCognitoCredentials } from "../../../../common/cognito-config";
const __dirname = dirname(fileURLToPath(import.meta.url));
export const generateNodeProject = (answers, projectDir) => {
	const template = readFileSync(join(__dirname, "templates/index.js"), "utf-8");

	const populated = template
		.replace(/{{serviceClient}}/g, answers.serviceClient)
		.replace(/{{service}}/g, answers.service)
		.replace(/{{operation}}/g, answers.operation)
		.replace(/{{credentials}}/g, getCognitoCredentials(answers.region));
	fs.writeFileSync(join(projectDir, "index.js"), populated);

	// Generate Node-specific package.json
	const pkg = {
		type: "module",
		dependencies: {
			[answers.service]: "^3.535.0",
			"@aws-sdk/credential-provider-node": "^3.535.0",
			dotenv: "^16.0.0",
		},
		scripts: {
			start: "node -r dotenv/config index.js",
		},
	};

	fs.writeFileSync(
		join(projectDir, "package.json"),
		JSON.stringify(pkg, null, 2)
	);
};
