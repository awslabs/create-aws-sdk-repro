import { describe, it, expect, beforeEach, afterEach } from "vitest";
import { runCli, KEYS } from "../helpers/run-cli.js";
import fs from "fs";
import path from "path";
import os from "os";

const PROJECT_NAME = "test-node-repro";

// Override npm registry since the default codeartifact may have expired auth
const TEST_ENV = { npm_config_registry: "https://registry.npmjs.org" };

describe("Node.js project generation", () => {
  let tmpDir;

  beforeEach(() => {
    tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), "repro-test-"));
  });

  afterEach(() => {
    if (tmpDir && fs.existsSync(tmpDir)) {
      fs.rmSync(tmpDir, { recursive: true, force: true });
    }
  });

  it("generates a valid Node.js project with S3 client", async () => {
    const result = await runCli({
      cwd: tmpDir,
      env: TEST_ENV,
      steps: [
        // Step 1: Select environment → "Node.js" (first option, just Enter)
        { match: "Select JavaScript environment", respond: KEYS.ENTER },
        // Step 2: Enter project name
        {
          match: "Enter project name",
          respond: `${PROJECT_NAME}${KEYS.ENTER}`,
          delay: 150,
        },
        // Step 3: Select service → S3 is already first, just Enter
        {
          match: "Select or search for AWS service",
          respond: KEYS.ENTER,
          delay: 200,
        },
        // Step 4: Wait for operations fetch, type operation with delay for suggest to filter
        {
          match: "Select or search for operation",
          respond: "list-buckets",
          delay: 200,
        },
        // Wait for suggestions to update, then submit
        {
          match: "list-buckets",
          respond: KEYS.ENTER,
          delay: 300,
        },
        // Step 5: Select region → Enter for default
        {
          match: "Select or enter AWS region",
          respond: KEYS.ENTER,
          delay: 150,
        },
      ],
      timeout: 90000,
    });

    expect(result.code).toBe(0);
    expect(result.stdout).toContain("Successfully created project");

    // Verify generated files
    const projectDir = path.join(tmpDir, PROJECT_NAME);
    expect(fs.existsSync(projectDir)).toBe(true);

    // Check index.js
    const indexJs = fs.readFileSync(
      path.join(projectDir, "index.js"),
      "utf-8"
    );
    expect(indexJs).toContain("S3Client");
    expect(indexJs).toContain("ListBucketsCommand");
    expect(indexJs).toContain("@aws-sdk/client-s3");

    // Check package.json
    const pkg = JSON.parse(
      fs.readFileSync(path.join(projectDir, "package.json"), "utf-8")
    );
    expect(pkg.type).toBe("module");
    expect(pkg.dependencies["@aws-sdk/client-s3"]).toBe("latest");
    expect(pkg.scripts.start).toBe("node index.js");
  });

  it("generates correct command names from kebab-case operations", async () => {
    const result = await runCli({
      cwd: tmpDir,
      env: TEST_ENV,
      steps: [
        { match: "Select JavaScript environment", respond: KEYS.ENTER },
        {
          match: "Enter project name",
          respond: `${PROJECT_NAME}${KEYS.ENTER}`,
          delay: 150,
        },
        {
          match: "Select or search for AWS service",
          respond: KEYS.ENTER,
          delay: 200,
        },
        {
          match: "Select or search for operation",
          respond: "get-object",
          delay: 200,
        },
        {
          match: "get-object",
          respond: KEYS.ENTER,
          delay: 300,
        },
        {
          match: "Select or enter AWS region",
          respond: KEYS.ENTER,
          delay: 150,
        },
      ],
      timeout: 90000,
    });

    expect(result.code).toBe(0);

    const projectDir = path.join(tmpDir, PROJECT_NAME);
    const indexJs = fs.readFileSync(
      path.join(projectDir, "index.js"),
      "utf-8"
    );
    // Verify kebab-case "get-object" → PascalCase "GetObjectCommand"
    expect(indexJs).toContain("GetObjectCommand");
    expect(indexJs).toContain("S3Client");
  });
});
