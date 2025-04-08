# Create minimal reproduction for AWS SDKs
[![Apache 2 licensed][apache-badge]][apache-url]

[apache-badge]: https://img.shields.io/badge/license-APACHE2-blue.svg
[apache-url]: https://github.com/awslabs/aws-sdk-python/blob/main/LICENSE

The `create-aws-sdk-repro` is a command-line interface (CLI) tool designed to help developers create reproducible environments for troubleshooting AWS SDK for JavaScript v3 issues. It streamlines the setup process by automatically configuring a project with your specified AWS service, operation, and target environment (Node.js, Browser, or React Native), including all necessary dependencies and boilerplate code.

## Prerequisites

- Install [Node.js](https://nodejs.org/)
- AWS credentials configured on your machine (credentials can also be entered during setup)

## Installation & Usage:

- Fork and clone this repository
- Install dependencies
  - `cd create-aws-sdk-repro/ && npm install`
- Change directory into src and run the setup script
  - `cd src/ && ./create-aws-sdk-env.js`
- Follow the interactive prompts
```console
? Enter a name for your project: my-s3-project
? Select the environment type: Node
? Select the AWS service you want to work with: S3
? Enter the service operation you want an example for: ListBuckets
? Enter the AWS region (leave blank for us-west-1): us-east-1
? Include AWS SDK examples? Yes
Project "my-s3-project" has been created successfully!
To run the project, navigate to the project directory and run:
  cd my-s3-project
  npm install
  npm start
```

## Additional Configuration
- For operations requiring input parameters, modify the `index.js` file before running `npm start` (For example: client parameters, credential provdiers etc.) 
- If AWS credentials aren't configured globally, add them to `index.js`
- Simple operations (like S3 ListBuckets) can be run immediately as the example code is pre-configured


## Security

See [CONTRIBUTING](CONTRIBUTING.md#security-issue-notifications) for more information.

## License

This project is licensed under the Apache-2.0 License.

