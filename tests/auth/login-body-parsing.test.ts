import { describe, it } from 'node:test';
import assert from 'node:assert';
import serverlessExpress from '@codegenie/serverless-express';
import app from '../../src/app';

describe('Production Login API Request-Body Parsing', () => {
  const handler = serverlessExpress({ app });

  it('should parse JSON POST body and reach validation middleware without undefined field errors', async () => {
    const event = {
      version: '2.0',
      routeKey: 'ANY /{proxy+}',
      rawPath: '/api/v1/auth/login',
      rawQueryString: '',
      headers: {
        'content-type': 'application/json',
        host: 'ysednaazx8.execute-api.ap-south-1.amazonaws.com',
      },
      requestContext: {
        http: {
          method: 'POST',
          path: '/api/v1/auth/login',
          protocol: 'HTTP/1.1',
          sourceIp: '127.0.0.1',
        },
      },
      body: JSON.stringify({ email: 'admin@example.com', password: 'TestPassword123!' }),
      isBase64Encoded: false,
    };

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const response: any = await (handler as any)(event, {});

    assert.ok(response, 'Handler should return a response');
    const parsedBody = JSON.parse(response.body);

    // If body parsing failed, response code would be 400 VALIDATION_ERROR with undefined email/password
    if (response.statusCode === 400 && parsedBody?.error?.code === 'VALIDATION_ERROR') {
      const details = parsedBody.error.details || [];
      const hasUndefinedEmail = details.some(
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        (d: any) => d.path?.includes('email') && d.message?.includes('received undefined')
      );
      assert.strictEqual(
        hasUndefinedEmail,
        false,
        'Request body was not parsed: body.email received undefined'
      );
    }

    // Since admin@example.com does not exist in DB or has invalid credentials,
    // reaching authentication logic returns 401 UNAUTHORIZED_ACCESS or 200 (if existing),
    // proving the body was successfully parsed and passed validation!
    assert.notStrictEqual(
      response.statusCode,
      400,
      `Request should not fail with 400 validation error. Body was: ${response.body}`
    );
  });

  it('should parse base64-encoded JSON POST body correctly', async () => {
    const rawJson = JSON.stringify({ email: 'admin@example.com', password: 'TestPassword123!' });
    const event = {
      version: '2.0',
      routeKey: 'ANY /{proxy+}',
      rawPath: '/api/v1/auth/login',
      rawQueryString: '',
      headers: {
        'content-type': 'application/json',
        host: 'ysednaazx8.execute-api.ap-south-1.amazonaws.com',
      },
      requestContext: {
        http: {
          method: 'POST',
          path: '/api/v1/auth/login',
          protocol: 'HTTP/1.1',
          sourceIp: '127.0.0.1',
        },
      },
      body: Buffer.from(rawJson).toString('base64'),
      isBase64Encoded: true,
    };

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const response: any = await (handler as any)(event, {});

    assert.ok(response, 'Handler should return a response');
    assert.notStrictEqual(
      response.statusCode,
      400,
      `Base64-encoded body should not fail validation with 400. Body: ${response.body}`
    );
  });

  it('should still reject genuinely invalid payload with 400 VALIDATION_ERROR', async () => {
    const event = {
      version: '2.0',
      routeKey: 'ANY /{proxy+}',
      rawPath: '/api/v1/auth/login',
      rawQueryString: '',
      headers: {
        'content-type': 'application/json',
        host: 'ysednaazx8.execute-api.ap-south-1.amazonaws.com',
      },
      requestContext: {
        http: {
          method: 'POST',
          path: '/api/v1/auth/login',
          protocol: 'HTTP/1.1',
          sourceIp: '127.0.0.1',
        },
      },
      body: JSON.stringify({ notAnEmail: 'invalid' }),
      isBase64Encoded: false,
    };

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const response: any = await (handler as any)(event, {});

    assert.strictEqual(response.statusCode, 400);
    const parsedBody = JSON.parse(response.body);
    assert.strictEqual(parsedBody?.error?.code, 'VALIDATION_ERROR');
  });
});
