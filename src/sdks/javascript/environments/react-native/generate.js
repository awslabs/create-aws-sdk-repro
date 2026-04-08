import fs from "fs";
import { readFileSync } from "fs";
import { fileURLToPath } from "url";
import { dirname, join } from "path";
import { execSync } from "child_process";
import { getServiceDisplayName } from "../../../../services.js";

const __dirname = dirname(fileURLToPath(import.meta.url));

export const generateReactNativeProject = (answers, projectDir) => {
	console.log("\nInitializing React Native project (this may take a few minutes)...");
	
	// Use actual client name from SDK package, with fallback to derived name
	const serviceName = answers.service.replace("@aws-sdk/client-", "");
	const clientName = answers.clientName || (getServiceDisplayName(answers.service)
		.split(" ")
		.map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
		.join("") + "Client");
	
	// React Native requires alphanumeric project names (no hyphens, underscores, or special chars)
	const projectName = answers.projectName.replace(/[^a-zA-Z0-9]/g, "");
	
	// Validate sanitized project name to prevent command injection
	if (!projectName || !/^[a-zA-Z0-9]+$/.test(projectName)) {
		throw new Error(`Invalid project name: "${answers.projectName}". Project name must contain at least one alphanumeric character.`);
	}
	
	// Update projectDir to match the sanitized name
	const parentDir = dirname(projectDir);
	const actualProjectDir = join(parentDir, projectName);
	
	try {
		// Initialize React Native project using the community CLI
		// Use version 0.76 which is compatible with Xcode 15
		// This creates the ios/ and android/ directories with all necessary files
		execSync(`npx @react-native-community/cli@latest init ${projectName} --version 0.76.6 --skip-install`, {
			stdio: 'inherit',
			cwd: parentDir
		});
		
		console.log("\nReact Native project initialized successfully!");
		console.log("Customizing project files...\n");
		
	} catch (error) {
		throw new Error(`Failed to initialize React Native project: ${error.message}`);
	}
	
	// 1. Generate App.js
	const appTemplate = readFileSync(
		join(__dirname, "templates/App.js"),
		"utf-8"
	);
	
	// Extract operation name without "Command" suffix for template
	const operationName = answers.operationCommand 
		? answers.operationCommand.replace(/Command$/, '')
		: answers.operation;
	
	const populatedApp = appTemplate
		.replace(/{{serviceClient}}/g, clientName)
		.replace(/{{service}}/g, answers.service)
		.replace(/{{operation}}/g, operationName)
		.replace(/{{operationCommand}}/g, answers.operationCommand)
		.replace(/{{region}}/g, answers.region);
	
	// 2. Update package.json with AWS SDK dependencies
	const pkgPath = join(actualProjectDir, "package.json");
	const existingPkg = JSON.parse(fs.readFileSync(pkgPath, 'utf-8'));
	
	existingPkg.dependencies = {
		...existingPkg.dependencies,
		[answers.service]: "latest",
		"@aws-sdk/client-cognito-identity": "latest",
		"@aws-sdk/credential-provider-cognito-identity": "latest",
		"react-native-get-random-values": "^1.11.0",
		"react-native-url-polyfill": "^2.0.0",
		"web-streams-polyfill": "^4.0.0",
	};
	
	fs.writeFileSync(pkgPath, JSON.stringify(existingPkg, null, 2));
	
	// 3. Replace App.js with our custom implementation
	fs.writeFileSync(join(actualProjectDir, "App.js"), populatedApp);
	
	// 4. Add Cognito setup documentation
	const cognitoSetup = `# Amazon Cognito Setup for React Native Authentication

This React Native AWS SDK project requires authentication via Amazon Cognito identity pool.

## Why Amazon Cognito?

Mobile applications should not embed long-term AWS credentials in application code. Amazon Cognito identity pool provides:
- Temporary, scoped credentials for mobile clients
- No long-term credentials in application code
- Fine-grained access control via IAM roles

## Quick Setup Steps

### 1. Install Dependencies

\`\`\`bash
npm install
\`\`\`

### 2. Create a Cognito identity pool for testing

1. To create an identity pool, go to [AWS Console > Amazon Cognito > Identity Pools](https://console.aws.amazon.com/cognito/v2/identity)
2. Choose "Create identity pool"
3. Enter a pool name (such as "example-${serviceName}-pool")
4. Enable "Unauthenticated identities" for testing
5. Choose "Create pool"
6. **Note down the Identity Pool ID** (format: \`your-region:EXAMPLE-xxxx-xxxx-xxxx-xxxxxxxxxxxx\`)

### 3. Add a Policy to the Unauthenticated IAM Role

The policy should be specific to the operations you want to test.

1. To add a policy to the unauthenticated IAM role, go to the "User access" tab in the Cognito identity pool page
2. Choose on the "Unauthenticated role" link (opens IAM console)
3. Choose "Add permissions" > "Create inline policy"
4. Use the JSON editor and add a policy for ${serviceName}:

> **Important:** The examples below use \`"Resource": "*"\` for convenience. For production use, follow the [principle of least privilege](https://docs.aws.amazon.com/IAM/latest/UserGuide/best-practices.html#grant-least-privilege) by replacing \`"*"\` with specific resource ARNs for your use case.

**Recommended: Policy scoped to your specific operation:**

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

**Alternative: Broader permissions for testing multiple operations:**
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

5. Name the policy (such as "example-${serviceName}-policy")
6. Choose "Create policy"

### 4. Update App.js Configuration

Open \`App.js\` and update these constants:

\`\`\`javascript
const REGION = "${answers.region}"; // Your AWS region
const IDENTITY_POOL_ID = "YOUR_IDENTITY_POOL_ID"; // From step 2
\`\`\`

### 5. Install iOS Dependencies (macOS only)

\`\`\`bash
cd ios && pod install && cd ..
\`\`\`

## Running the App

### For iOS (macOS only):
\`\`\`bash
npm run ios
\`\`\`

### For Android:
\`\`\`bash
npm run android
\`\`\`

The app will launch in the simulator/emulator. Tap the "Click to make a call" button to test the AWS SDK operation.

## Setting Up React Native Development Environment

If you haven't set up React Native before:

### iOS Development (macOS only)

1. Install Xcode from the Mac App Store
2. Install Xcode Command Line Tools:
   \`\`\`bash
   xcode-select --install
   \`\`\`
3. Install CocoaPods:
   \`\`\`bash
   sudo gem install cocoapods
   \`\`\`

### Android Development

1. Install Android Studio
2. Install Android SDK (API level 31 or higher)
3. Set up environment variables in \`~/.bash_profile\` or \`~/.zshrc\`:
   \`\`\`bash
   export ANDROID_HOME=$HOME/Library/Android/sdk
   export PATH=$PATH:$ANDROID_HOME/emulator
   export PATH=$PATH:$ANDROID_HOME/platform-tools
   \`\`\`

For detailed setup instructions, see [React Native Environment Setup](https://reactnative.dev/docs/environment-setup)

## Common Errors and Solutions

### "Configuration Error: Update REGION and IDENTITY_POOL_ID"
- You haven't updated the placeholders in \`App.js\`
- Update \`REGION\` and \`IDENTITY_POOL_ID\` with your actual values

### "NotAuthorizedException" or "AccessDeniedException"
- The IAM role doesn't have sufficient permissions
- Review and update the IAM policy attached to your Cognito unauthenticated role
- Ensure the policy includes the specific ${serviceName} actions you're testing

### "InvalidIdentityPoolConfigurationException"
- The Identity Pool ID or region is incorrect
- Verify the Identity Pool ID format: \`your-region:EXAMPLE-xxxx-xxxx-xxxx-xxxxxxxxxxxx\`
- Ensure the region matches where you created the Identity Pool

### Build Errors

**iOS:**
- Run \`cd ios && pod install && cd ..\` to install iOS dependencies
- Clean build folder in Xcode: Product > Clean Build Folder
- Delete \`ios/Pods\` and \`ios/Podfile.lock\`, then run \`pod install\` again

**Android:**
- Clean Gradle cache: \`cd android && ./gradlew clean && cd ..\`
- Ensure Android SDK is properly installed and environment variables are set
- Check that you have an Android emulator running or device connected

## Security Best Practices

- **Use unauthenticated access only for testing**
- **Implement authenticated access for production** using Cognito User Pools
- **Apply least-privilege IAM policies** - only grant necessary permissions
- **Monitor Cognito usage** in CloudWatch
- **Set up CloudTrail** to audit API calls
- **Consider using Cognito User Pools** for user authentication in production

## Reference Links

- [Create a Cognito identity pool](https://docs.aws.amazon.com/cognito/latest/developerguide/tutorial-create-identity-pool.html)
- [Cognito identity pools Documentation](https://docs.aws.amazon.com/cognito/latest/developerguide/cognito-identity.html)
- [AWS SDK for JavaScript v3 - React Native](https://docs.aws.amazon.com/sdk-for-javascript/v3/developer-guide/getting-started-react-native.html)
- [React Native Environment Setup](https://reactnative.dev/docs/environment-setup)
- [IAM Policies](https://docs.aws.amazon.com/service-authorization/latest/reference/reference.html)

## Production Considerations

For production applications:

1. **Use Cognito User Pools** for user authentication
2. **Implement authenticated identities** instead of unauthenticated
3. **Use fine-grained IAM policies** based on user attributes
4. **Enable MFA** for sensitive operations
5. **Implement proper error handling** and user feedback
6. **Use environment variables** for configuration (not hardcoded values)
7. **Monitor and log** all authentication and authorization events
8. **Test on both iOS and Android** platforms
`;
	
	fs.writeFileSync(join(actualProjectDir, "COGNITO_SETUP.md"), cognitoSetup);
	
	console.log(`\nReact Native project created successfully at: ${actualProjectDir}`);
	console.log(`\nNote: The tool sanitized the project directory name to "${projectName}" (alphanumeric only)`);
	console.log("\nNext steps:");
	console.log(`1. cd ${projectName}`);
	console.log("2. npm install");
	console.log("3. Update REGION and IDENTITY_POOL_ID in App.js");
	console.log("4. cd ios && pod install && cd .. (macOS only)");
	console.log("5. npm run ios (or npm run android)");
};
