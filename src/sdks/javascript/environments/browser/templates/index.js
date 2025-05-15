// import { {{serviceClient}}, {{operation}}Command } from '{{service}}';
// import { fromCognitoIdentityPool } from "@aws-sdk/credential-provider-cognito-identity";
// const getHTMLElement = (title, content) => {
//   const element = document.createElement("div");
//   element.style.margin = "30px";
//   const titleDiv = document.createElement("div");
//   titleDiv.innerHTML = title;
//   const contentDiv = document.createElement("textarea");
//   contentDiv.rows = 20;
//   contentDiv.cols = 50;
//   contentDiv.innerHTML = content;
//   element.appendChild(titleDiv);
//   element.appendChild(contentDiv);
//   return element;
// };
// const component = async () => {
//   const client = new {{serviceClient}}({
//     region: '{{region}}',
//     credentials: fromCognitoIdentityPool({
//       identityPoolId: "REPLACE_WITH_YOUR_IDENTITY_POOL_ID",
//       clientConfig: { region: '{{region}}' }
//     }),
//   });
//   const input = {
//     // {{operation}}Input
//   };
//   const command = new {{operation}}Command(input);
//   const response = await client.send(command);

//   return getHTMLElement(
//     "Data returned by v3:",
//     JSON.stringify(response, null, 2)
//   );
// };
// (async () => {
//   document.body.appendChild(await component());
// })();
