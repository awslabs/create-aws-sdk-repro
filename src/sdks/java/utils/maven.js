// import fs from "fs";
// import path from "path";
// import { fileURLToPath } from "url";

// const __dirname = path.dirname(fileURLToPath(import.meta.url));

// export const generateMavenWrapper = (projectDir) => {
// 	// Copy Maven wrapper files from template directory
// 	const wrapperFiles = [
// 		"mvnw",
// 		"mvnw.cmd",
// 		".mvn/wrapper/maven-wrapper.jar",
// 		".mvn/wrapper/maven-wrapper.properties",
// 	];
// 	wrapperFiles.forEach((file) => {
// 		const source = path.join(__dirname, "templates/maven", file);
// 		const dest = path.join(projectDir, file);
// 		fs.copyFileSync(source, dest);
// 	});
// 	// Make mvnw executable
// 	if (process.platform !== "win32") {
// 		fs.chmodSync(path.join(projectDir, "mvnw"), 0o755);
// 	}
// };
