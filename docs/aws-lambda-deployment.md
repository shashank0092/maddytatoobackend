# AWS Lambda Deployment Guide & Final Review

## 1. Architectural Decisions & Validations
- **API Gateway Custom Domain**: 
  - **Decision:** Provisionally target `api.maddytattooandart.com`.
  - **Prerequisites:** An AWS ACM Certificate for `api.maddytattooandart.com` must be requested and validated in the *exact same AWS Region* as the HTTP API Gateway (unlike Edge APIs which require `us-east-1`). DNS A/AAAA Alias or CNAME records must map the custom domain to the API Gateway Regional Domain Name.
  - **Status:** Requires manual AWS Console/CLI provisioning of the ACM certificate and Custom Domain Name mapping after the stack is deployed.
- **Authentication & Cookies (`SameSite` configuration)**: 
  - **Decision:** Preserve existing JWT authentication and HTTP-only cookies.
  - **Validation:** Since the backend will be `api.maddytattooandart.com` and the frontend is a sub-domain/root of `maddytattooandart.com` (e.g., `admin.maddytattooandart.com`), the browser recognizes this as a "same-site" context. 
  - **Configuration:** `SameSite: strict` (or `lax`) is perfectly safe. You do **not** need to change `SameSite` to `None`. The Express CORS configuration will remain exactly as is (using the `CORS_ORIGIN` env variable, e.g., `https://admin.maddytattooandart.com`). Ensure the `Domain` attribute in the cookie is unset (defaults to `api.maddytattooandart.com`) or explicitly set to `.maddytattooandart.com` depending on frontend needs.
- **Supabase Connectivity Requirements**: 
  - **Validation:** Prisma (v6.19.3) must connect using Supabase's transaction pooler (Supavisor). 
  - **Configuration:** Do NOT use the default `5432` port for Lambda. Use the pooler URL: port `6543`. Additionally, since Prisma is connecting to Supavisor in transaction mode, the `DATABASE_URL` string MUST end with `?pgbouncer=true`. Example: `postgres://user:password@aws-0-region.pooler.supabase.com:6543/postgres?pgbouncer=true`.

## 2. Verified Configuration and Runtime Details
- **Docker / SAM Build Compatibility**: 
  - **ISSUE DETECTED**: The `sam build --use-container` process hangs indefinitely on macOS (Apple Silicon). Docker gets stuck leaving the `lambda-builders` container in a `Created` state without transitioning to `Running`. This is a known cross-compilation bug with Docker Desktop emulation of x86_64 architecture for SAM. 
  - **Resolution / Workarounds**: To reliably build `argon2` natively without hanging, either:
    1. Deploy to `arm64` architecture (change `Architectures: - x86_64` to `- arm64` in `template.yaml`). This allows Docker to use native ARM virtualization which will not hang.
    2. Alternatively, run the SAM build on an x86_64 Linux machine (like AWS CodeBuild/GitHub Actions).
- **Prisma Client**: `schema.prisma` explicitly targets `binaryTargets = ["native", "rhel-openssl-3.0.x"]`, guaranteeing compatibility with the Amazon Linux 2023 environment running `nodejs24.x`. If migrating to `arm64`, this would need to become `linux-arm64-openssl-3.0.x`.
- **Lambda Configuration**: `src/lambda.ts` securely reuses the Prisma connection on warm starts without stalling the Lambda execution context.

## 3. Required Production Parameters (Names Only)
- `DatabaseUrl`: (Requires port 6543 and `?pgbouncer=true`).
- `JwtAccessSecret`
- `JwtRefreshSecret`
- `CorsOrigin`: (E.g., `https://admin.maddytattooandart.com`).
- `AwsIdentityPoolId`
- `AwsDeveloperProviderName`

## 4. Exact Commands for Deployment
1. **Containerized Build:** (Requires Docker Native Arch, e.g. using `arm64`)
   ```bash
   sam build --use-container
   ```
2. **Deploy the Stack:**
   ```bash
   sam deploy --guided
   ```

## 5. Post-Deployment Smoke Tests
After deployment, retrieve the `HttpApiUrl` from CloudFormation and verify:
1. `GET {HttpApiUrl}/api/v1/health` (Should return 200 OK)
2. `POST {HttpApiUrl}/api/v1/auth/login` (Verify cookie is set and accessible)
3. Try fetching a protected resource (`GET /api/v1/dashboard/overview`) using the auth cookie/token.
4. Try fetching Cognito AWS Credentials (`GET /api/v1/auth/aws-credentials`) to verify Developer Authenticated Identities.

---

### **Status:** BLOCKED 🛑 (Build Hangs)
**Summary:** The `sam build --use-container` process for `x86_64` freezes on Apple Silicon due to virtualization issues. To safely build `argon2` and `Prisma` natively for AWS without relying on an external CI/CD pipeline, the AWS Lambda Architecture should be switched to `arm64` in `template.yaml` and Prisma's `binaryTargets` updated to `linux-arm64-openssl-3.0.x`.

**Next Action:** Awaiting your decision to either switch the AWS architecture to `arm64` (recommended for lower cost and native macOS build support), or handle deployment via CI/CD pipelines (e.g. GitHub Actions).
