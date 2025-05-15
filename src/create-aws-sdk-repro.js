#!/usr/bin/env node

import prompts from "prompts";
import { generateBrowserProject } from "./sdks/javascript/environments/browser";
import { generateNodeProject } from "./sdks/javascript/environments/node";
import { cognitoSetupInstructions } from "./src/common/cognito-config.js";
import { fileURLToPath } from "url";
import path from "path";
import fs from "fs";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

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
	const answers = await prompts(questions);
	const projectDir = path.join(process.cwd(), answers.projectName);

	try {
		fs.mkdirSync(projectDir, { recursive: true });

		// Generate environment-specific files
		switch (answers.environment) {
			case "node":
				await generateNodeProject(answers, projectDir);
				break;
			case "browser":
				await generateBrowserProject(answers, projectDir);
				break;
			case "react-native":
				throw new Error("React Native not implemented yet");
			default:
				throw new Error("Invalid environment");
		}

		// Add common files
		fs.writeFileSync(
			path.join(projectDir, "COGNITO_SETUP.md"),
			cognitoSetupInstructions()
		);

		console.log(`Project created successfully in ${projectDir}`);
		console.log("Next steps:");
		console.log("1. Configure Cognito in COGNITO_SETUP.md");
		console.log("2. Run: npm install && npm start");
	} catch (error) {
		console.error("Project creation failed:", error.message);
		process.exit(1);
	}
})();
