# AWS Service and Operation Management

## Overview

The CLI now supports 200+ AWS services with autocomplete and validation, plus intelligent operation validation with typo detection.

## How It Works

### Service List (`src/services.js`)
- Contains comprehensive list of `@aws-sdk/client-*` packages
- Provides validation and autocomplete functionality
- Includes helper functions for service name formatting

### Operation Validation (`src/operations.js`)
- Dynamically fetches available operations for selected service
- Validates operation names with intelligent typo detection
- Provides autocomplete suggestions for operations
- Falls back to format validation if operations can't be fetched

### Autocomplete Features

**Services:**
- Type to search for services (e.g., typing "s3" shows S3-related services)
- Use arrow keys to navigate suggestions
- See formatted service names (e.g., "DYNAMO DB" instead of package name)

**Operations:**
- After selecting a service, available operations are fetched automatically
- Type to filter operations (e.g., "list" shows list-buckets, list-objects-v2)
- Typo detection suggests corrections (e.g., "list-bucketss" → "Did you mean: list-buckets?")
- Format validation ensures kebab-case (e.g., list-buckets, get-object)

### Service Validation (`src/services.js`)
- Ensures entered service exists in the AWS SDK
- Provides clear error messages for invalid services
- Accepts full package names: `@aws-sdk/client-<service>`
- **Typo detection**: Uses Levenshtein distance to suggest similar services
- **Missing prefix detection**: Automatically suggests adding `@aws-sdk/client-` prefix
- **Smart suggestions**: Shows up to 5 similar services when typos are detected

**Operation Validation:**
- Fetches real operations from the selected service package
- Validates against actual available operations
- Uses Levenshtein distance algorithm to detect typos (up to 2 character differences)
- Falls back to format validation if operations can't be fetched
- Ensures kebab-case format (lowercase with hyphens)

## Adding New Services

To add a new AWS service:

1. Open `src/services.js`
2. Add the package name to the `AWS_SERVICES` array:
   ```javascript
   "@aws-sdk/client-new-service",
   ```
3. Keep alphabetical order for easier maintenance

## Updating the Service List

To get the latest services from AWS SDK:

```bash
# List all available AWS SDK v3 client packages
npm search @aws-sdk/client- --json | jq '.[].name' | sort
```

Or check the official repository:
https://github.com/aws/aws-sdk-js-v3/tree/main/clients

## Service Name Format

- **Input format**: `@aws-sdk/client-service-name`
- **Display format**: Uppercase words (e.g., "S3", "DYNAMO DB")
- **Client name**: PascalCase + "Client" (e.g., "S3Client", "DynamoDbClient")

## Operation Name Format

- **Input format**: kebab-case (e.g., "list-buckets", "get-object")
- **Command format**: PascalCase + "Command" (e.g., "ListBucketsCommand", "GetObjectCommand")
- **Validation**: Must start with lowercase letter, contain only lowercase letters, numbers, and hyphens

## How Operation Fetching Works

When you select a service, the CLI:

1. Creates a temporary directory in your system's temp folder
2. Installs the selected AWS SDK service package (e.g., `@aws-sdk/client-s3`)
3. Scans the package using three methods:
   - **Method 1**: Parses the `exports` field in package.json for command paths
   - **Method 2**: Scans the `dist-cjs/commands/` directory for `*Command.js` files
   - **Method 3**: Scans the `dist-es/commands/` directory for `*Command.js` files
4. Extracts all command names and converts them to kebab-case
5. Provides autocomplete with the full list of operations
6. Cleans up the temporary directory

**Timing**: Takes approximately 10-30 seconds depending on:
- Network speed (downloading the package)
- Package size (S3 has 107 operations, Lambda has fewer)
- System performance

If fetching fails (network issues, timeout, etc.), the CLI falls back to format-only validation, allowing you to continue with manual operation entry.

## Examples

### Valid Operation Names
- `list-buckets`
- `get-object`
- `put-bucket-policy`
- `describe-instances`
- `create-function`

### Invalid Operation Names
- `ListBuckets` (PascalCase - should be kebab-case)
- `list_buckets` (snake_case - should use hyphens)
- `list-` (trailing hyphen)
- `-list` (leading hyphen)

### Typo Detection Examples

**Service Typos:**
- Input: `@aws-sdk/client-s4` → Suggestion: "Did you mean: S3, SNS, SQS, SSM, STS?"
- Input: `@aws-sdk/client-dynamod` → Suggestion: "Did you mean: DYNAMODB?"
- Input: `@aws-sdk/client-lambdaa` → Suggestion: "Did you mean: LAMBDA?"
- Input: `s3` → Suggestion: "Did you mean: @aws-sdk/client-s3?"

**Operation Typos:**
- Input: `list-bucketss` → Suggestion: "Did you mean: list-buckets?"
- Input: `get-objct` → Suggestion: "Did you mean: get-object?"
- Input: `dlete-bucket` → Suggestion: "Did you mean: delete-bucket?"


## User Flow

```
1. Select SDK (JavaScript/Java)
   ↓
2. Select Environment (Node.js/Browser/React Native) [JS only]
   ↓
3. Enter Project Name
   ↓
4. Select Service (autocomplete with 200+ services)
   ↓
5. Fetch Operations (automatic, ~5-10 seconds)
   ↓
6. Select Operation (autocomplete with validation)
   ↓  - Format validation (kebab-case)
   ↓  - Existence validation (if operations fetched)
   ↓  - Typo detection (Levenshtein distance ≤ 2)
   ↓
7. Enter Region
   ↓
8. Generate Project
```

## Performance Considerations

- **Operation fetching**: Takes 10-30 seconds per service (one-time per CLI run)
- **Package installation**: Downloads ~5-15MB depending on service
- **Caching**: Currently not implemented (each run fetches fresh)
- **Timeout**: 60 seconds for package installation
- **Fallback**: If fetching fails, format validation still works
- **Cleanup**: Temporary files are automatically removed after fetching

## Future Improvements

- Cache operation lists locally to avoid repeated fetching
- Pre-generate operation lists for common services
- Add operation descriptions/documentation
- Support for operation parameter validation
