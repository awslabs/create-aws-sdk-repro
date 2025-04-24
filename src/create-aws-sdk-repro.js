#!/usr/bin/env node

const prompts = require("prompts");
const fs = require("fs");
const path = require("path");

const awsServices = [
	{ title: "S3", value: "@aws-sdk/client-s3" },
	{ title: "DynamoDB", value: "@aws-sdk/client-dynamodb" },
	{ title: "EC2", value: "@aws-sdk/client-ec2" },
	{ title: "IAM", value: "@aws-sdk/client-iam" },
	{ title: "Lambda", value: "@aws-sdk/client-lambda" },
	// Add more services here
];

const questions = [
	{
		type: "text",
		name: "projectName",
		message: "Enter a name for your project:",
		validate: (value) => (value !== "" ? true : "Please enter a project name"),
		initial: `sdk-repro${Date.now()}`,
	},
	{
		type: "select",
		name: "environment",
		message: "Select the environment type:",
		choices: [
			{ title: "Node", value: "node" },
			{ title: "Browser", value: "browser" },
			{ title: "React Native", value: "react-native" },
		],
		initial: 0,
	},
	{
		type: "select",
		name: "service",
		message: "Select the AWS service you want to work with:",
		choices: awsServices,
		initial: 0,
	},
	{
		type: "text",
		name: "operation",
		message: "Enter the service operation you want an example for:",
		validate: (value) =>
			value !== "" ? true : "Please enter a service operation",
		initial: "ListBuckets",
	},
	{
		type: "text",
		name: "region",
		message: "Enter the AWS region (leave blank for us-west-1):",
		initial: "us-west-1",
	},
	{
		type: "confirm",
		name: "includeExamples",
		message: "Include AWS SDK examples?",
		initial: true,
	},
];

(async () => {
	const answers = await prompts(questions).catch((err) => {
		console.error("Aborted:", err.message);
		process.exit(1);
	});
	if (!answers) process.exit(1);

	const projectDir = path.join(process.cwd(), answers.projectName);

	try {
		if (!fs.existsSync(projectDir)) {
			fs.mkdirSync(projectDir, { recursive: true });
		} else {
			console.error(`Error: Directory ${projectDir} already exists`);
			process.exit(1);
		}
	} catch (err) {
		console.error(`Error creating directory: ${err.message}`);
		process.exit(1);
	}

	const selectedService = awsServices.find(
		(service) => service.value === answers.service
	);
	const serviceClient = `${selectedService.title}Client`;

	let indexJs;
	const operationName = answers.operation
		.replace(/([a-z])([A-Z])/g, "$1$2")
		.toLowerCase();
	const defaultExampleCode = `import { ${serviceClient}, ${answers.operation}Command } from '${answers.service}';
const client = new ${serviceClient}({
  region: '${answers.region}',
//  credentials: { // replace with AWS credentials
    // accessKeyId: '', 
    // secretAccessKey: '',
//  },
});
const input = { // ${answers.operation}Input

};
const command = new ${answers.operation}Command(input); // check SDK docs for command name casing
const response = await client.send(command);
console.log(response);
`;

	if (answers.environment === "node") {
		indexJs = defaultExampleCode;
		const packageJson = {
			name: answers.projectName,
			version: "1.0.0",
			description: `AWS SDK for JavaScript v3 project for ${answers.service}`,
			main: "index.js",
			type: "module",
			dependencies: {
				[answers.service]: "latest",
			},
			scripts: {
				start: "node index.js",
			},
		};
		fs.writeFileSync(
			path.join(projectDir, "package.json"),
			JSON.stringify(packageJson, null, 2)
		);
	} else if (answers.environment === "browser") {
		indexJs = `import { ${serviceClient}, ${answers.operation}Command } from '${answers.service}';

const getHTMLElement = (title, content) => {
const element = document.createElement("div");
element.style.margin = "30px";

const titleDiv = document.createElement("div");
titleDiv.innerHTML = title;
const contentDiv = document.createElement("textarea");
contentDiv.rows = 20;
contentDiv.cols = 50;
contentDiv.innerHTML = content;

element.appendChild(titleDiv);
element.appendChild(contentDiv);

return element;
};

const component = async () => {
const client = new ${serviceClient}({
  region: '${answers.region}',
  credentials: { // replace with AWS credentials
    // accessKeyId: '', 
    // secretAccessKey: '',
  },
});
const input = { // ${answers.operation}Input

};
const command = new ${answers.operation}Command(input); // check SDK docs for command name casing
const response = await client.send(command);
console.log(response);

return getHTMLElement(
  "Data returned by v3:",
  JSON.stringify(response, null, 2)
);
};

(async () => {
document.body.appendChild(await component());
})();`;

		const packageJson = {
			name: answers.projectName,
			version: "1.0.0",
			description: `AWS SDK for JavaScript v3 project for ${answers.service}`,
			private: true,
			main: "index.js",
			scripts: {
				start: "vite --open",
			},
			devDependencies: {
				vite: "latest",
			},
			dependencies: {
				[answers.service]: "latest",
			},
		};
		fs.writeFileSync(
			path.join(projectDir, "package.json"),
			JSON.stringify(packageJson, null, 2)
		);
	} else if (answers.environment === "react-native") {
		indexJs = defaultExampleCode;
	}
	fs.writeFileSync(path.join(projectDir, "index.js"), indexJs);

	console.log(
		`Project "${answers.projectName}" has been created successfully!`
	);
	console.log("To run the project, navigate to the project directory and run:");
	console.log(`  cd ${answers.projectName}`);

	if (answers.environment === "node") {
		console.log("  npm install");
		console.log("  npm start");
	} else if (answers.environment === "browser") {
		console.log("  npm install");
		console.log("  npm run start");
	} else if (answers.environment === "react-native") {
		console.log(
			"  Follow the React Native setup instructions to run the project"
		);
	}
})();
