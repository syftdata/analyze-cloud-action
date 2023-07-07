const path = require("path");
const fs = require("fs");
const core = require("@actions/core");
const exec = require("@actions/exec");
const github = require("@actions/github");
const utils = require("./utils");
const { compareSchemas } = require("./diff");

async function runAnalysis(
  workspaceDirectory,
  projectDirectory,
  outputDirectory,
  octokit
) {
  const fullProjectDir = path.join(workspaceDirectory, projectDirectory);
  const outputDir = path.join(workspaceDirectory, outputDirectory);
  const outputFilePath = path.join(outputDir, "events.yaml");

  // read the file from the workspace
  let oldYaml = "";
  if (fs.existsSync(outputFilePath)) {
    oldYaml = fs.readFileSync(outputFilePath, "utf8");
  }

  if (octokit !== undefined) {
    const issueNumber = await utils.getIssueNumber(octokit);
    await utils.postComent(octokit, issueNumber, "Running Syft analysis");
  }

  core.info(
    `Running tests and instrumentor in ${projectDirectory} and workspace is: ${workspaceDirectory}`
  );
  await exec.exec("npx", [
    `syft`,
    "analyze",
    "--srcDir",
    fullProjectDir,
    "--output",
    outputDir,
    "--verbose",
  ]);

  // read the file from the workspace
  let newYaml = "";
  if (fs.existsSync(outputFilePath)) {
    newYaml = fs.readFileSync(outputFilePath, "utf8");
  }

  if (octokit !== undefined && oldYaml !== newYaml) {
    const diff = compareSchemas(oldYaml, newYaml);
    const comment = `
Hi there, Syft found changes in event schemas. Please review the changes below:

### Added Events
| Event Name         |
| ------------------ |
${diff.addedEvents.map((e) => `|${e}         |`).join("\n")}

### Removed Events
| Event Name         |
| ------------------ |
${diff.removedEvents.map((e) => `|${e}         |`).join("\n")}

### Changed Events
| Event Name         | Changes  |
| ------------------ | -------- |
${diff.changedEvents
  .map(
    (e) =>
      `|${e.name}       | ${
        e.addedFileds.length + e.removedFields.length + e.changedFields.length
      } `
  )
  .join("\n")}
    `;

    const issueNumber = await utils.getIssueNumber(octokit);
    await utils.postComent(octokit, issueNumber, comment);
  }
}

async function setup() {
  try {
    // Get version of tool to be installed
    const baseDir = path.join(process.cwd(), core.getInput("cwd") || "");
    const projectDirectory = core.getInput("project_directory");
    const outputDirectory = core.getInput("output_directory");

    const githubToken = core.getInput("github_token");
    const octokit = githubToken ? github.getOctokit(githubToken) : undefined;

    core.info(`Syft Analysis starting..`);

    await utils.setupSyftCli();
    await runAnalysis(baseDir, projectDirectory, outputDirectory, octokit);
  } catch (e) {
    core.setFailed(e);
  }
}

module.exports = setup;

if (require.main === module) {
  setup();
}
