import fs from "fs";
import { readFileSync } from "fs";
import { fileURLToPath } from "url";
import { dirname, join } from "path";
import { getServiceDisplayName } from "../../../../services.js";

const __dirname = dirname(fileURLToPath(import.meta.url));

export const generateBrowserProject = (answers, projectDir) => {
	// Extract service name and create client name
	const serviceName = answers.service.replace("@aws-sdk/client-", "");
	const clientName = getServiceDisplayName(answers.service)
		.split(" ")
		.map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
		.join("") + "Client";
	
	// 1. Generate main JavaScript file
	const jsTemplate = readFileSync(
		join(__dirname, "templates/index.js"),
		"utf-8"
	);
	
	// Extract operation name without "Command" suffix for template
	const operationName = answers.operationCommand 
		? answers.operationCommand.replace(/Command$/, '')
		: answers.operation;
	
	const populatedJs = jsTemplate
		.replace(/{{serviceClient}}/g, clientName)
		.replace(/{{service}}/g, answers.service)
		.replace(/{{operation}}/g, operationName);
	
	// 2. Generate HTML file
	const htmlTemplate = readFileSync(
		join(__dirname, "templates/index.html"),
		"utf-8"
	);
	
	// 3. Create package.json
	const pkg = {
		name: answers.projectName.toLowerCase().replace(/ /g, "-"),
		version: "1.0.0",
		private: true,
		type: "module",
		scripts: {
			start: "vite --open",
			build: "vite build",
		},
		devDependencies: {
			vite: "^5.0.0",
		},
		dependencies: {
			[answers.service]: "latest",
			"@aws-sdk/client-cognito-identity": "latest",
			"@aws-sdk/credential-provider-cognito-identity": "latest",
		},
	};
	
	// 4. Write files
	fs.writeFileSync(join(projectDir, "index.js"), populatedJs);
	fs.writeFileSync(join(projectDir, "index.html"), htmlTemplate);
	fs.writeFileSync(
		join(projectDir, "package.json"),
		JSON.stringify(pkg, null, 2)
	);
	
	// 5. Add security documentation
	const cognitoSetup = `# Cognito Setup for Browser Authentication

This browser-based AWS SDK project requires authentication via Amazon Cognito Identity Pool.

## Why Cognito?

Browser applications cannot securely store AWS credentials. Cognito Identity Pool provides:
- Temporary, scoped credentials for browser clients
- No long-term credentials in client code
- Fine-grained access control via IAM roles

## Quick Setup Steps

### 1. Create a Cognito Identity Pool for Testing

1. Go to [AWS Console > Cognito > Identity Pools](https://console.aws.amazon.com/cognito/v2/identity)
2. Click "Create identity pool"
3. Enter a pool name (e.g., "test-${serviceName}-pool")
4. Enable "Unauthenticated identities" for testing
5. Click "Create pool"
6. **Note down the Identity Pool ID** (format: \`region:xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx\`)

### 2. Add a Policy to the Unauthenticated IAM Role

The policy should be specific to the operations you want to test.

1. In the Cognito Identity Pool page, go to the "User access" tab
2. Click on the "Unauthenticated role" link (opens IAM console)
3. Click "Add permissions" > "Create inline policy"
4. Use the JSON editor and add a policy for ${serviceName}:

**Example policy for ${serviceName} (adjust based on your operation):**

\`\`\`json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Action": [
        "${serviceName}:List*",
        "${serviceName}:Describe*",
        "${serviceName}:Get*"
      ],
      "Resource": "*"
    }
  ]
}
\`\`\`

**For specific operations**, be more restrictive:
\`\`\`json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Action": [
        "${serviceName}:${answers.operation.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join('')}"
      ],
      "Resource": "*"
    }
  ]
}
\`\`\`

5. Name the policy (e.g., "test-${serviceName}-policy")
6. Click "Create policy"

### 3. Update index.js Configuration

Open \`index.js\` and update these constants:

\`\`\`javascript
const REGION = "${answers.region}"; // Your AWS region
const IDENTITY_POOL_ID = "YOUR_IDENTITY_POOL_ID"; // From step 1
\`\`\`

## Testing Your Setup

1. Install dependencies:
   \`\`\`bash
   npm install
   \`\`\`

2. Start the development server:
   \`\`\`bash
   npm start
   \`\`\`

3. Open your browser (should open automatically)
4. Check the browser console for any errors
5. If successful, you should see the API response displayed

## Common Errors and Solutions

### "Configuration Error: Please update REGION and IDENTITY_POOL_ID"
- You haven't updated the placeholders in \`index.js\`
- Update \`REGION\` and \`IDENTITY_POOL_ID\` with your actual values

### "NotAuthorizedException" or "AccessDeniedException"
- The IAM role doesn't have sufficient permissions
- Review and update the IAM policy attached to your Cognito unauthenticated role
- Ensure the policy includes the specific ${serviceName} actions you're testing

### "InvalidIdentityPoolConfigurationException"
- The Identity Pool ID or region is incorrect
- Verify the Identity Pool ID format: \`region:xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx\`
- Ensure the region matches where you created the Identity Pool

## Security Best Practices

- **Use unauthenticated access only for testing**
- **Implement authenticated access for production** using Cognito User Pools
- **Apply least-privilege IAM policies** - only grant necessary permissions
- **Monitor Cognito usage** in CloudWatch
- **Set up CloudTrail** to audit API calls
- **Consider using Cognito User Pools** for user authentication in production

## Reference Links

- [Create a Cognito Identity Pool](https://docs.aws.amazon.com/cognito/latest/developerguide/tutorial-create-identity-pool.html)
- [Cognito Identity Pools Documentation](https://docs.aws.amazon.com/cognito/latest/developerguide/cognito-identity.html)
- [AWS SDK for JavaScript v3 - Browser](https://docs.aws.amazon.com/sdk-for-javascript/v3/developer-guide/getting-started-browser.html)
- [IAM Policies for ${serviceName}](https://docs.aws.amazon.com/service-authorization/latest/reference/list_${serviceName.toLowerCase()}.html)

## Production Considerations

For production applications:

1. **Use Cognito User Pools** for user authentication
2. **Implement authenticated identities** instead of unauthenticated
3. **Use fine-grained IAM policies** based on user attributes
4. **Enable MFA** for sensitive operations
5. **Implement proper error handling** and user feedback
6. **Use environment variables** for configuration (not hardcoded values)
7. **Monitor and log** all authentication and authorization events
`;
	
	fs.writeFileSync(join(projectDir, "COGNITO_SETUP.md"), cognitoSetup);
};
