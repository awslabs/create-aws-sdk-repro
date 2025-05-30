import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
// import { generateMavenWrapper } from "./utils/maven.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// Template cache to avoid repeated file reads
const TEMPLATES = {
	mainJava: fs.readFileSync(
		path.join(__dirname, "templates/Main.java"),
		"utf-8"
	),
	pomXml: fs.readFileSync(path.join(__dirname, "templates/pom.xml"), "utf-8"),
	readme: fs.readFileSync(path.join(__dirname, "templates/README.md"), "utf-8"),
};

export const generateJavaProject = (answers, projectDir) => {
	// Create Maven project structure
	const paths = {
		mainJava: path.join(projectDir, "src/main/java/com/aws/repro"),
		testJava: path.join(projectDir, "src/test/java/com/aws/repro"),
		resources: path.join(projectDir, "src/main/resources"),
	};

	// Create directories
	Object.values(paths).forEach((p) => {
		fs.mkdirSync(p, { recursive: true });
	});

	// Process service name for Java SDK
	const javaService = answers.service.toLowerCase();
	const operationPascal =
		answers.operation.charAt(0).toUpperCase() + answers.operation.slice(1);

	// Generate Main.java
	const mainJavaContent = TEMPLATES.mainJava
		.replace(/{{service}}/g, javaService)
		.replace(
			/{{Service}}/g,
			javaService.charAt(0).toUpperCase() + javaService.slice(1)
		)
		.replace(/{{operation}}/g, answers.operation)
		.replace(/{{Operation}}/g, operationPascal)
		.replace(/{{region}}/g, answers.region.toUpperCase());

	// Generate pom.xml
	const pomXmlContent = TEMPLATES.pomXml
		.replace(/{{service}}/g, javaService)
		.replace(/{{aws-sdk-version}}/g, "2.20.136");

	// Generate README
	const readmeContent = TEMPLATES.readme
		.replace(/{{service}}/g, javaService)
		.replace(/{{operation}}/g, answers.operation)
		.replace(/{{region}}/g, answers.region);

	// Write core files
	fs.writeFileSync(path.join(paths.mainJava, "Main.java"), mainJavaContent);
	fs.writeFileSync(path.join(projectDir, "pom.xml"), pomXmlContent);
	fs.writeFileSync(path.join(projectDir, "README.md"), readmeContent);

	// // Add Maven wrapper
	// generateMavenWrapper(projectDir);

	// Add .gitignore
	fs.writeFileSync(
		path.join(projectDir, ".gitignore"),
		"target/\n.classpath\n.project\n.settings/\nbin/\n"
	);
};

// Helper to render templates with replacements
function renderTemplate(template, variables) {
	return Object.entries(variables).reduce(
		(acc, [key, value]) => acc.replace(new RegExp(`{{${key}}}`, "g"), value),
		template
	);
}
