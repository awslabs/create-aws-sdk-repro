export const getCognitoCredentials = (region) => `
  credentials: fromCognitoIdentityPool({
    identityPoolId: process.env.COGNITO_IDENTITY_POOL_ID,
    clientConfig: { region: '${region}' }
  }),`;
export const cognitoSetupInstructions = () => `
// AWS Cognito Setup Required:
Create Identity Pool in AWS Console
Set up IAM roles with least privilege
Add these permissions to your identity pool:
${service}:${operation}
Set COGNITO_IDENTITY_POOL_ID in .env file
`;
