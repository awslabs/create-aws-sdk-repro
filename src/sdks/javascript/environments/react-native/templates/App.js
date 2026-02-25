import React, { useState } from 'react';
import { Button, StyleSheet, View, Text, TextInput, ScrollView } from 'react-native';

// React Native polyfills required for AWS SDK for JavaScript
import 'react-native-get-random-values';
import 'react-native-url-polyfill/auto';
import 'web-streams-polyfill/polyfill';

import { {{serviceClient}}, {{operationCommand}} } from '{{service}}';
import { fromCognitoIdentityPool } from '@aws-sdk/credential-provider-cognito-identity';
import { CognitoIdentityClient } from '@aws-sdk/client-cognito-identity';

// Configuration - Update these values
const REGION = 'REGION'; // e.g., 'us-east-1'
const IDENTITY_POOL_ID = 'IDENTITY_POOL_ID'; // e.g., 'us-east-1:xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx'

// Validate configuration
const isConfigured = REGION !== 'REGION' && IDENTITY_POOL_ID !== 'IDENTITY_POOL_ID';

const App = () => {
  const [response, setResponse] = useState('');
  const [loading, setLoading] = useState(false);

  const makeAwsCall = async () => {
    if (!isConfigured) {
      setResponse(
        'Configuration Error: Please update REGION and IDENTITY_POOL_ID in App.js\n\n' +
        'See COGNITO_SETUP.md for detailed setup instructions.'
      );
      return;
    }

    setLoading(true);
    setResponse('Making AWS SDK call...');

    try {
      const client = new {{serviceClient}}({
        region: REGION,
        credentials: fromCognitoIdentityPool({
          client: new CognitoIdentityClient({
            region: REGION,
          }),
          identityPoolId: IDENTITY_POOL_ID,
        }),
      });

      const input = {}; // Add your input parameters here
      const command = new {{operationCommand}}(input);
      const result = await client.send(command);
      
      setResponse(JSON.stringify(result, null, 2));
    } catch (err) {
      console.error(err);
      
      // Provide helpful error messages
      let errorMessage = `Error: ${err.message || err}\n\n`;
      
      if (err.name === 'NotAuthorizedException' || err.name === 'AccessDeniedException') {
        errorMessage += 'This error usually means the IAM role attached to your Cognito Identity Pool ' +
          'does not have sufficient permissions.\n\n' +
          'See COGNITO_SETUP.md for instructions on adding the required IAM policy.';
      } else if (err.name === 'InvalidIdentityPoolConfigurationException') {
        errorMessage += 'This error usually means the IDENTITY_POOL_ID or REGION is incorrect.\n\n' +
          'See COGNITO_SETUP.md for setup instructions.';
      } else {
        errorMessage += 'Check the console for more details.';
      }
      
      setResponse(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.sectionContainer}>
        <Text style={styles.sectionTitle}>AWS SDK for JavaScript v3</Text>
        <Text style={styles.serviceInfo}>Service: {{service}}</Text>
        <Text style={styles.serviceInfo}>Operation: {{operation}}</Text>
        
        <View style={styles.buttonContainer}>
          <Button 
            title={loading ? "Loading..." : "Click to make a call"} 
            onPress={makeAwsCall}
            disabled={loading}
          />
        </View>
        
        <Text style={styles.responseLabel}>Response:</Text>
        <TextInput
          style={styles.sectionDescription}
          multiline={true}
          editable={false}
          placeholder="Response will be populated here"
          value={response}
        />
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ffffff',
  },
  sectionContainer: {
    flex: 1,
    padding: 16,
    paddingTop: 50,
  },
  sectionTitle: {
    fontSize: 20,
    textAlign: 'center',
    fontWeight: '600',
    color: '#000000',
    marginBottom: 8,
  },
  serviceInfo: {
    fontSize: 14,
    textAlign: 'center',
    color: '#666666',
    marginBottom: 4,
  },
  buttonContainer: {
    marginVertical: 16,
  },
  responseLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#000000',
    marginBottom: 8,
  },
  sectionDescription: {
    minHeight: 300,
    fontSize: 12,
    fontWeight: '400',
    color: '#4c4c4c',
    backgroundColor: '#f0f0f0',
    padding: 12,
    borderRadius: 4,
    fontFamily: 'Courier',
  },
});

export default App;
