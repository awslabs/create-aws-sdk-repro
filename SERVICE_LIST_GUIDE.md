# AWS Service List Management

## Overview

The CLI now supports 200+ AWS services with autocomplete and validation.

## How It Works

### Service List (`src/services.js`)
- Contains comprehensive list of `@aws-sdk/client-*` packages
- Provides validation and autocomplete functionality
- Includes helper functions for service name formatting

### Autocomplete Feature
Users can now:
- Type to search for services (e.g., typing "s3" shows S3-related services)
- Use arrow keys to navigate suggestions
- See formatted service names (e.g., "DYNAMO DB" instead of package name)

### Validation
- Ensures entered service exists in the AWS SDK
- Provides clear error messages for invalid services
- Accepts full package names: `@aws-sdk/client-<service>`

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
