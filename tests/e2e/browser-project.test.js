import { describe, it, expect, beforeEach, afterEach } from "vitest";
import { runCli, KEYS } from "../helpers/run-cli.js";
import fs from "fs";
import path from "path";
import os from "os";

const PROJECT_NAME = "test-browser-repro";
const TEST_ENV = { npm_config_registry: "https://registry.npmjs.org" };

describe("Browser project generation", () => {
  let tmpDir;

  beforeEach(() => {
    tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), "repro-test-"));
  });

  afterEach(() => {
    if (tmpDir && fs.existsSync(tmpDir)) {
      fs.rmSync(tmpDir, { recursive: true, force: true });
    }
  });

  it("generates a valid browser project with correct files", async () => {
    const result = await runCli({
      cwd: tmpDir,
      env: TEST_ENV,
      steps: [
        // Select "Browser" (second option → Down + Enter)
        {
          match: "Select JavaScript environment",
          respond: `${KEYS.DOWN}${KEYS.ENTER}`,
        },
        {
          match: "Enter project name",
          respond: `${PROJECT_NAME}${KEYS.ENTER}`,
          delay: 150,
        },
        // S3 is first in the list, just Enter
        {
          match: "Select or search for AWS service",
          respond: KEYS.ENTER,
          delay: 200,
        },
        // Type operation and wait for filter
        {
          match: "Select or search for operation",
          respond: "put-object",
          delay: 200,
        },
        { match: "put-object", respond: KEYS.ENTER, delay: 300 },
        // Region → default
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

    const projectDir = path.join(tmpDir, PROJECT_NAME);
    expect(fs.existsSync(projectDir)).toBe(true);

    // Browser projects have: index.js, index.html, package.json, COGNITO_SETUP.md
    expect(fs.existsSync(path.join(projectDir, "index.js"))).toBe(true);
    expect(fs.existsSync(path.join(projectDir, "index.html"))).toBe(true);
    expect(fs.existsSync(path.join(projectDir, "package.json"))).toBe(true);
    expect(fs.existsSync(path.join(projectDir, "COGNITO_SETUP.md"))).toBe(
      true
    );

    // Check index.js has correct service and operation
    const indexJs = fs.readFileSync(
      path.join(projectDir, "index.js"),
      "utf-8"
    );
    expect(indexJs).toContain("S3Client");
    expect(indexJs).toContain("PutObject");
    expect(indexJs).toContain("@aws-sdk/client-s3");

    // Check package.json has browser-specific deps
    const pkg = JSON.parse(
      fs.readFileSync(path.join(projectDir, "package.json"), "utf-8")
    );
    expect(pkg.dependencies["@aws-sdk/client-s3"]).toBe("latest");
    expect(
      pkg.dependencies["@aws-sdk/credential-provider-cognito-identity"]
    ).toBe("latest");
    expect(pkg.devDependencies.vite).toBeDefined();
    expect(pkg.scripts.start).toBe("vite --open");
  });
});
