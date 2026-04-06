# Changelog

## 0.1.1

### Patch Changes

- Populate region in generated Node.js code and use top-level await ([6c710826f7c14d184d26c8e3a6c81f9bd15582b0](https://github.com/awslabs/create-aws-sdk-repro/commit/6c710826f7c14d184d26c8e3a6c81f9bd15582b0))

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
- Java SDK v2 support (hidden from CLI, pending further testing)
