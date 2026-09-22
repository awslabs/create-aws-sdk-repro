import { describe, it, expect, beforeEach, afterEach } from "vitest";
import { runCli, KEYS } from "../helpers/run-cli.js";
import fs from "fs";
import path from "path";
import os from "os";

const TEST_ENV = { npm_config_registry: "https://registry.npmjs.org" };

describe("Error cases", () => {
  let tmpDir;

  beforeEach(() => {
    tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), "repro-test-"));
  });

  afterEach(() => {
    if (tmpDir && fs.existsSync(tmpDir)) {
      fs.rmSync(tmpDir, { recursive: true, force: true });
    }
  });

  it("exits with error when project directory already exists", async () => {
    const projectName = "existing-dir";
    // Pre-create the directory
    fs.mkdirSync(path.join(tmpDir, projectName));

    const result = await runCli({
      cwd: tmpDir,
      env: TEST_ENV,
      steps: [
        { match: "Select JavaScript environment", respond: KEYS.ENTER },
        {
          match: "Enter project name",
          respond: `${projectName}${KEYS.ENTER}`,
          delay: 150,
        },
        // S3 first, just Enter
        {
          match: "Select or search for AWS service",
          respond: KEYS.ENTER,
          delay: 200,
        },
        // Accept first operation
        {
          match: "Select or search for operation",
          respond: KEYS.ENTER,
          delay: 200,
        },
        // Region default
        {
          match: "Select or enter AWS region",
          respond: KEYS.ENTER,
          delay: 150,
        },
      ],
      timeout: 90000,
    });

    expect(result.code).toBe(1);
    expect(result.stderr).toContain("already exists");
  });

  it("cancels gracefully on ctrl-c during prompts", async () => {
    const result = await runCli({
      cwd: tmpDir,
      env: TEST_ENV,
      steps: [
        // Send ctrl-c at the first prompt
        { match: "Select JavaScript environment", respond: "\x03" },
      ],
      timeout: 10000,
    });

    // Should exit without crashing (exit 0 from process.exit(0) in onCancel)
    expect(result.code).toBe(0);
    // No project directory should be created
    const entries = fs.readdirSync(tmpDir);
    expect(entries).toHaveLength(0);
  });
});
