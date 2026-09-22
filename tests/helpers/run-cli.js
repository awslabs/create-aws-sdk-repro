/**
 * Test helper: spawns the CLI process and feeds scripted stdin responses
 * to answer interactive prompts.
 *
 * The prompts library uses raw TTY mode when available, but falls back to
 * line-based stdin. We use a pseudo-TTY approach: write responses as the
 * process outputs prompt markers.
 */
import { spawn } from "child_process";
import { fileURLToPath } from "url";
import { dirname, join, resolve } from "path";

const __dirname = dirname(fileURLToPath(import.meta.url));
const CLI_PATH = resolve(__dirname, "../../src/cli.js");

// Key codes for prompts interaction
const KEYS = {
  ENTER: "\r",
  DOWN: "\x1B[B",
  UP: "\x1B[A",
  TAB: "\t",
};

/**
 * Run the CLI with scripted answers.
 *
 * @param {Object} options
 * @param {string} options.cwd - Working directory for the spawned process
 * @param {Array<{match: string|RegExp, respond: string|Function}>} options.steps
 *   Each step waits for `match` in stdout, then writes `respond` to stdin.
 *   If respond is a function, it receives the matched output and returns a string.
 * @param {number} [options.timeout=60000] - Max time to wait for process to exit
 * @param {Record<string, string>} [options.env] - Extra env vars
 * @returns {Promise<{code: number, stdout: string, stderr: string}>}
 */
export function runCli({ cwd, steps = [], timeout = 60000, env = {} }) {
  return new Promise((resolve, reject) => {
    const stdout = [];
    const stderr = [];
    let stepIndex = 0;
    let lastMatchOffset = 0;
    let timer;

    const proc = spawn("node", [CLI_PATH], {
      cwd,
      env: { ...process.env, ...env, NODE_NO_WARNINGS: "1" },
      stdio: ["pipe", "pipe", "pipe"],
    });

    timer = setTimeout(() => {
      proc.kill("SIGTERM");
      reject(
        new Error(
          `CLI timed out after ${timeout}ms.\n` +
            `Completed ${stepIndex}/${steps.length} steps.\n` +
            `stdout so far:\n${stdout.join("")}\n` +
            `stderr so far:\n${stderr.join("")}`
        )
      );
    }, timeout);

    proc.stdout.on("data", (chunk) => {
      const text = chunk.toString();
      stdout.push(text);
      tryNextStep(stdout.join(""));
    });

    proc.stderr.on("data", (chunk) => {
      stderr.push(chunk.toString());
    });

    proc.on("close", (code) => {
      clearTimeout(timer);
      resolve({
        code,
        stdout: stdout.join(""),
        stderr: stderr.join(""),
      });
    });

    proc.on("error", (err) => {
      clearTimeout(timer);
      reject(err);
    });

    function tryNextStep(fullOutput) {
      if (stepIndex >= steps.length) return;

      const step = steps[stepIndex];
      // Only search in output after the last match to avoid re-triggering on old text
      const searchable = fullOutput.slice(lastMatchOffset);
      const match =
        step.match instanceof RegExp
          ? step.match.test(searchable)
          : searchable.includes(step.match);

      if (match) {
        lastMatchOffset = fullOutput.length;
        stepIndex++;
        const response =
          typeof step.respond === "function"
            ? step.respond(fullOutput)
            : step.respond;

        // Small delay to let the prompt fully render before responding
        setTimeout(() => {
          proc.stdin.write(response);
          // Close stdin after the last step to let the process exit
          if (stepIndex >= steps.length) {
            setTimeout(() => {
              proc.stdin.end();
            }, 500);
          }
        }, step.delay || 100);
      }
    }
  });
}

export { KEYS };
