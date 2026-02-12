#!/usr/bin/env node

import prompts from "prompts";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { generateBrowserProject } from "./sdks/javascript/environments/browser/generate.js";
import { generateNodeProject } from "./sdks/javascript/environments/node/generate.js";
import { generateJavaProject } from "./sdks/java/generate.js";
import { AWS_SERVICES, isValidService, getServiceSuggestions, getServiceDisplayName } from "./services.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// Utility functions for operation name conversion
function kebabToPascalCase(str) {
	return str
		.split("-")
		.map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
		.join("");
}

function kebabToCamelCase(str) {
	const pascal = kebabToPascalCase(str);
	return pascal.charAt(0).toLowerCase() + pascal.slice(1);
}

// Service lists for different SDKs
export const JS_SERVICES = AWS_SERVICES.map(service => ({
	title: getServiceDisplayName(service),
	value: service
}));

const JAVA_SERVICES = [
	{ title: "S3", value: "s3" },
	{ title: "DynamoDB", value: "dynamodb" },
	{ title: "EC2", value: "ec2" },
	{ title: "IAM", value: "iam" },
	{ title: "Lambda", value: "lambda" },
];

const QUESTIONS = [
	{
		type: "select",
		name: "sdk",
		message: "Select AWS SDK language:",
		choices: [
			{ title: "JavaScript", value: "js" },
			{ title: "Java", value: "java" },
		],
		initial: 0,
	},
	{
		type: (prev) => (prev === "java" ? null : "select"),
		name: "environment",
		message: "Select JavaScript environment:",
		choices: [
			{ title: "Node.js", value: "node" },
			{ title: "Browser", value: "browser" },
			{ title: "React Native", value: "react-native" },
		],
	},
	{
		type: "text",
		name: "projectName",
		message: "Enter project name:",
		validate: (value) => !!value.trim() || "Project name is required",
		initial: `aws-sdk-repro${Date.now()}`,
	},
	{
		type: (prev) => (prev === "java" ? null : "autocomplete"),
		name: "service",
		message: "Select or search for AWS service:",
		choices: JS_SERVICES,
		suggest: (input, choices) => {
			const suggestions = getServiceSuggestions(input);
			return choices.filter(choice => suggestions.includes(choice.value));
		},
		validate: (value) => {
			if (!value) return "Service is required";
			if (!isValidService(value)) {
				return `Invalid service. Use format: @aws-sdk/client-<service-name>`;
			}
			return true;
		},
		initial: 0,
	},
	{
		type: "text",
		name: "operation",
		message: "Enter AWS service operation (kebab-case, e.g., list-buckets):",
		validate: (value) => !!value.trim() || "Operation is required",
		initial: "list-buckets",
	},
	{
		type: "text",
		name: "region",
		message: "Enter AWS region:",
		initial: (prev) => (prev?.sdk === "java" ? "US_WEST_1" : "us-west-1"),
		validate: (value, prev) => {
			const sdkType = prev?.sdk || "js";
			return !!value.trim() || "Region is required";
		},
	},
];

async function main() {
	const answers = await prompts(QUESTIONS, {
		onCancel: () => {
			console.log("Operation cancelled");
			process.exit(0);
		},
	});

	if (!answers.sdk) process.exit(0);

	const projectDir = path.join(process.cwd(), answers.projectName);

	try {
		if (fs.existsSync(projectDir)) {
			console.error(`Error: Directory ${projectDir} already exists`);
			process.exit(1);
		}

		fs.mkdirSync(projectDir, { recursive: true });

		switch (answers.sdk) {
			case "js":
				await handleJavascriptProject(answers, projectDir);
				break;
			case "java":
				await handleJavaProject(answers, projectDir);
				break;
			default:
				throw new Error(`Unsupported SDK: ${answers.sdk}`);
		}

		showSuccessMessage(answers, projectDir);
	} catch (error) {
		console.error(`❌ Error creating project: ${error.message}`);
		cleanupOnError(projectDir);
		process.exit(1);
	}
}

async function handleJavascriptProject(answers, projectDir) {
	// Convert kebab-case operation to PascalCase + Command suffix for JS SDK
	const operationPascal = kebabToPascalCase(answers.operation);
	answers.operationCommand = `${operationPascal}Command`;
	
	switch (answers.environment) {
		case "node":
			await generateNodeProject(answers, projectDir);
			break;
		case "browser":
			await generateBrowserProject(answers, projectDir);
			break;
		case "react-native":
			throw new Error("React Native support not implemented yet");
		default:
			throw new Error(`Invalid environment: ${answers.environment}`);
	}
}

async function handleJavaProject(answers, projectDir) {
	// Convert service name to Java format
	answers.service = answers.service
		.replace(/@aws-sdk\/client-/i, "")
		.toLowerCase();
	// Convert kebab-case operation to camelCase for Java
	answers.operation = kebabToCamelCase(answers.operation);
	answers.region = answers.region.toUpperCase().replace(/-/g, "_");
	await generateJavaProject(answers, projectDir);
}

function showSuccessMessage(answers, projectDir) {
	const instructions = {
		js: `
  To get started:
  cd ${answers.projectName}
  npm install
  npm start
    `,
		java: `
  To build and run:
  cd ${answers.projectName}
  mvn clean package
  java -jar target/*.jar
  
  First-time setup:
  chmod +x mvnw  # Make Maven wrapper executable
    `,
	};

	console.log(`
✅ Successfully created ${answers.sdk.toUpperCase()} project at:
${path.resolve(projectDir)}
${instructions[answers.sdk]}`);
}

function cleanupOnError(projectDir) {
	if (fs.existsSync(projectDir)) {
		fs.rmSync(projectDir, { recursive: true, force: true });
	}
}

main().catch((error) => {
	console.error("Unexpected error:", error);
	process.exit(1);
});
