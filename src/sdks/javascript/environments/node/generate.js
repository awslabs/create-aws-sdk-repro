import fs from "fs";
import { readFileSync } from "fs";
import { fileURLToPath } from "url";
import { dirname, join } from "path";
import { JS_SERVICES } from "../../../../cli.js";

const __dirname = dirname(fileURLToPath(import.meta.url));
const generateIndexJs = (answers) => {
	const selectedService = JS_SERVICES.find((s) => s.value === answers.service);
	const serviceClient = `${selectedService}Client`;
	return `
import { S3Client, ${answers.operationCommand} } from '@aws-sdk/client-s3';

const main = async () => {
  try {
    const client = new S3Client();
    const input = {}; // Add your input parameters here
    const command = new ${answers.operationCommand}(input);
    const response = await client.send(command);
    console.log('Success:', response);
  } catch (error) {
    console.error('Error:', error);
  }
};
main();
`;
};
export const generateNodeProject = (answers, projectDir) => {
	// Create index.js with actual values
	const indexContent = generateIndexJs(answers);
	fs.writeFileSync(join(projectDir, "index.js"), indexContent);
	// Create package.json
	const pkg = {
		name: answers.projectName.toLowerCase().replace(/ /g, "-"),
		version: "1.0.0",
		type: "module",
		dependencies: {
			"@aws-sdk/client-s3": "latest",
			"@aws-sdk/credential-provider-node": "latest",
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
