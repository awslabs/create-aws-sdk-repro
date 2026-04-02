# Create minimal reproduction for AWS SDKs

[![Apache 2 licensed][apache-badge]][apache-url]

[apache-badge]: https://img.shields.io/badge/license-APACHE2-blue.svg
[apache-url]: https://github.com/awslabs/create-aws-sdk-repro/blob/main/LICENSE

`@aws-sdk/create-repro` is a CLI tool that generates ready-to-run project environments for AWS SDK for JavaScript v3. It supports Node.js, Browser (Vite + Cognito), and React Native environments across AWS services with autocomplete, operation validation, and typo detection.

## Prerequisites

- [Node.js](https://nodejs.org/)
- AWS credentials configured on your machine (for Node.js projects)
  - See [Configuring the AWS SDK for JavaScript](https://docs.aws.amazon.com/sdk-for-javascript/v3/developer-guide/configuring-the-jssdk.html)

## Usage

```bash
npm create @aws-sdk/repro
```

After running `npm start` in the generated project, you should see the API response printed to the console. If you see a credentials error, verify your AWS credentials are configured correctly by running `aws sts get-caller-identity`.

> **Note:** Running the generated projects makes API calls to AWS services, which may incur charges based on standard [AWS pricing](https://aws.amazon.com/pricing/). Review pricing for the services you use and clean up resources when finished.

## Interactive Prompts

The CLI guides you through the following steps:

```console
AWS SDK Reproduction Project Generator

? Select JavaScript environment: (Node.js / Browser / React Native)
? Enter project name: aws-sdk-repro-a1b2c3d4
? Select or search for AWS service: (autocomplete)

Fetching available operations for S3...
Found 128 operations

? Select or search for operation (kebab-case): list-buckets
? Select or enter AWS region: us-east-1 - US East (N. Virginia)

Successfully created JS project at:
/path/to/aws-sdk-repro-a1b2c3d4

  To get started:
  cd aws-sdk-repro-a1b2c3d4
  npm install
  npm start
```

## Environments

### Node.js

Generates a project using the default AWS credential chain. Run with `npm start`.

### Browser

Generates a Vite-based project with Amazon Cognito Identity Pool for browser-safe credentials. A `COGNITO_SETUP.md` guide is included with setup instructions. Run with `npm start` (opens browser via Vite dev server).

### React Native

Generates a full React Native project via `@react-native-community/cli` (pinned to RN 0.76.6 for Xcode 15 compatibility). Includes required polyfills (`react-native-get-random-values`, `react-native-url-polyfill`, `web-streams-polyfill`) and Cognito authentication.

## Features

- **Service autocomplete**: Search across `@aws-sdk/client-*` packages with fuzzy matching
- **Typo detection**: Levenshtein distance (max 2 edits) suggests corrections for mistyped services and regions
- **Dynamic operation discovery**: Temporarily installs the selected SDK package to discover available operations and extract the correct client name (e.g., `DynamoDBClient` not `DynamodbClient`)
- **Region validation**: AWS regions with display names, format validation, and underscore-to-hyphen correction
- **Kebab-case input**: Operations entered as `list-buckets` are automatically converted to `ListBucketsCommand`

## Development

```bash
# Clone the repository
git clone https://github.com/awslabs/create-aws-sdk-repro.git
cd create-aws-sdk-repro
npm install

# Run the CLI
node src/cli.js

# Navigate to the generated project
cd <your-project-name>
npm install
npm start
```

For Node.js projects, ensure your AWS credentials are configured (`aws configure` or environment variables). For Browser and React Native projects, follow the generated `COGNITO_SETUP.md` to configure an Identity Pool before running.

### Quick smoke test

```bash
# Generate a Node.js project for S3 ListBuckets
node src/cli.js
# Select: Node.js → any project name → @aws-sdk/client-s3 → list-buckets → us-east-1

# Verify the generated project runs
cd <project-name>
npm install
npm start
```

Operations like `ListBuckets`, `DescribeInstances`, and `ListTables` work with an empty input object, so the generated project runs out of the box. For operations that require parameters, modify the `input` object in the generated `index.js`:

```javascript
const input = {
  // Add your input parameters here
  // IDE autocomplete will show available fields since types are already imported
};
```

## Cleanup

The generated projects are standalone directories on your local machine. To clean up, delete the project directory.

If you created a Cognito Identity Pool for Browser or React Native testing, delete the Identity Pool and any associated IAM roles that are no longer needed.

## Security

See [CONTRIBUTING](CONTRIBUTING.md#security-issue-notifications) for more information.

## License

This project is licensed under the Apache-2.0 License.
