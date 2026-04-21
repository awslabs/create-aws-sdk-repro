# Changelog

## 1.0.0

### Major Changes

- First stable release. Remove dotenv and credential-provider-node from generated projects. Add input sanitization for project names and package names. Simplify generated code with TLA. ([6ad27fe43e74313796626f2ed259638c3d143988](https://github.com/awslabs/create-aws-sdk-repro/commit/6ad27fe43e74313796626f2ed259638c3d143988))

## 0.1.1

### Patch Changes

- Populate region in generated Node.js code and use top-level await ([9d2a8f14fe8a04cb1f0e56d3140f2201ba4caf53](https://github.com/awslabs/create-aws-sdk-repro/commit/9d2a8f14fe8a04cb1f0e56d3140f2201ba4caf53))

## [0.1.0] - 2026-03-26

### Added

- Interactive CLI with prompt-driven project generation
- Node.js environment support with default credential chain
- Browser environment support with Vite and Amazon Cognito Identity Pool
- React Native environment support with polyfills and Cognito authentication
- Service autocomplete across 300+ @aws-sdk/client-\* packages
- Dynamic operation discovery via temporary SDK package installation
- Typo detection using Levenshtein distance for services and regions
- Region validation with display names and format correction
- Kebab-case operation input with automatic PascalCase conversion
- Generated COGNITO_SETUP.md for Browser and React Native projects
