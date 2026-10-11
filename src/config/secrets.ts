import { SecretsManagerClient, GetSecretValueCommand } from '@aws-sdk/client-secrets-manager';

let secretsLoaded = false;

/**
 * Fetches runtime configuration from AWS Secrets Manager and injects it into process.env.
 * This should be called exactly once during the Lambda cold start BEFORE any application
 * modules (like env.ts or app.ts) are imported, ensuring synchronous validators see the values.
 */
export const loadSecrets = async (): Promise<void> => {
  if (secretsLoaded) return;

  const isLambda = !!process.env.AWS_LAMBDA_FUNCTION_NAME;

  // In local development, we skip Secrets Manager and rely on the local .env file.
  if (!isLambda && process.env.NODE_ENV !== 'production') {
    secretsLoaded = true;
    return;
  }

  // Use the region provided by the Lambda environment or fallback to ap-south-1
  const region = process.env.AWS_REGION || 'ap-south-1';
  const secretId = process.env.SECRET_ID || 'maddytattobackend';

  const client = new SecretsManagerClient({ region });

  try {
    const command = new GetSecretValueCommand({
      SecretId: secretId,
      VersionStage: 'AWSCURRENT',
    });
    
    const response = await client.send(command);

    if (response.SecretString) {
      const parsed = JSON.parse(response.SecretString);
      
      if (typeof parsed !== 'object' || parsed === null) {
        throw new Error('SecretString is not a valid JSON object');
      }

      // Safely inject secrets into process.env so that env.ts can validate them
      for (const [key, value] of Object.entries(parsed)) {
        if (value !== undefined && value !== null) {
          process.env[key] = String(value);
        }
      }
      
      secretsLoaded = true;
      console.log('✅ Successfully loaded configuration from AWS Secrets Manager');
    } else {
      throw new Error('SecretString is empty');
    }
  } catch {
    // We sanitize the error output so that we do not expose sensitive AWS details
    // or the exact failure reason in CloudWatch logs publicly.
    console.error('❌ Failed to load configuration from AWS Secrets Manager.');
    throw new Error('Application startup failed due to missing configuration.');
  }
};
