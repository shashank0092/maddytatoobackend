import { CognitoIdentityClient, GetOpenIdTokenForDeveloperIdentityCommand } from '@aws-sdk/client-cognito-identity';
import { env } from '../config/env';
import { AppError } from '../core/errors/AppError';

export interface AwsIdentityResponse {
  identityId: string;
  token: string;
}

class CognitoService {
  private client: CognitoIdentityClient;

  constructor() {
    this.client = new CognitoIdentityClient({
      region: env.AWS_REGION,
    });
  }

  async getDeveloperIdentity(userId: string): Promise<AwsIdentityResponse> {
    try {
      const command = new GetOpenIdTokenForDeveloperIdentityCommand({
        IdentityPoolId: env.AWS_IDENTITY_POOL_ID,
        Logins: {
          [env.AWS_DEVELOPER_PROVIDER_NAME]: userId,
        },
        TokenDuration: 3600, // Token valid for 1 hour
      });

      const response = await this.client.send(command);

      if (!response.IdentityId || !response.Token) {
        throw new Error('Invalid response from Cognito: Missing IdentityId or Token');
      }

      return {
        identityId: response.IdentityId,
        token: response.Token,
      };
    } catch (error) {
      console.error('[CognitoService] Failed to get developer identity:', error);
      throw new AppError('Unable to initialize AWS identity', 500, 'AWS_IDENTITY_ERROR');
    }
  }
}

export const cognitoService = new CognitoService();
