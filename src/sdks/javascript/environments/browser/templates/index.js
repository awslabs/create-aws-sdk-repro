// import { {{serviceClient}} } from '{{service}}';
// import { fromCognitoIdentityPool } from "@aws-sdk/credential-provider-cognito-identity";
// // Browser-safe UI rendering
// const displayResults = (data) => {
//   const output = document.getElementById('aws-output');
//   output.textContent = JSON.stringify(data, null, 2);
// };
// // AWS Client Configuration
// {{cognitoConfig}}
// // Main execution flow
// (async () => {
//   try {
//     const response = await client.send(new {{operation}}Command({}));
//     displayResults(response);
//   } catch (error) {
//     console.error('Operation failed:', error);
//     document.getElementById('error').textContent = error.message;
//   }
// })();
