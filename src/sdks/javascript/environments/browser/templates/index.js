import { {{serviceClient}}, {{operation}}Command } from '{{service}}';
import { fromCognitoIdentityPool } from "@aws-sdk/credential-provider-cognito-identity";
import { CognitoIdentityClient } from "@aws-sdk/client-cognito-identity";

// Browser-safe UI rendering
const displayResults = (data) => {
  const output = document.getElementById('aws-output');
  output.textContent = JSON.stringify(data, null, 2);
};

const displayError = (message) => {
  const errorElement = document.getElementById('error');
  errorElement.textContent = message;
  console.error(message);
};

// AWS Client Configuration
// TODO: Replace with your actual Cognito identity pool ID and region
const REGION = "{{region}}"; // TODO: Replace with your AWS region if different
const IDENTITY_POOL_ID = "{{region}}:EXAMPLE-0000-0000-0000-EXAMPLE00000"; // TODO: Replace with your Amazon Cognito identity pool ID

// Validate configuration before initializing client
if (REGION === "{{region}}" && IDENTITY_POOL_ID === "{{region}}:EXAMPLE-0000-0000-0000-EXAMPLE00000") {
  displayError(
    "Configuration Error: Please update REGION and IDENTITY_POOL_ID in index.js.\n\n" +
    "Refer to COGNITO_SETUP.md for detailed setup instructions."
  );
  throw new Error("Missing Cognito configuration. See COGNITO_SETUP.md for setup instructions.");
}

const client = new {{serviceClient}}({
  region: REGION,
  credentials: fromCognitoIdentityPool({
    client: new CognitoIdentityClient({ region: REGION }),
    identityPoolId: IDENTITY_POOL_ID,
  }),
});

// Main execution flow
(async () => {
  try {
    const response = await client.send(new {{operation}}Command({}));
    displayResults(response);
  } catch (error) {
    console.error('Operation failed:', error);
    
    let errorMessage = `Operation failed: ${error.message}`;
    
    // Provide helpful error messages for common issues
    if (error.name === 'NotAuthorizedException' || error.name === 'AccessDeniedException') {
      errorMessage += '\n\nThis may be due to insufficient IAM permissions. ' +
        'Check the IAM role attached to your Cognito identity pool. ' +
        'Refer to COGNITO_SETUP.md for permission setup.';
    } else if (error.name === 'InvalidIdentityPoolConfigurationException') {
      errorMessage += '\n\nInvalid Cognito identity pool configuration. ' +
        'Verify your IDENTITY_POOL_ID and REGION are correct. ' +
        'Refer to COGNITO_SETUP.md for setup instructions.';
    }
    
    displayError(errorMessage);
  }
})();
