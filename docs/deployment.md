# Deployment

The site is live at **https://kommugurisuryateja.com** (API at
**https://api.kommugurisuryateja.com**), hosted in AWS account `626635433373`,
region `us-east-1`.

- **Frontend**: static Next.js export → private S3 bucket → CloudFront (OAC).
- **Backend**: FastAPI on Lambda (Mangum) ← API Gateway HTTP API.
- **Data**: single DynamoDB table.
- **Infra**: Terraform (`infra/terraform`), remote state in S3 + DynamoDB lock.
- **CI/CD**: GitHub Actions via OIDC (no long-lived keys).

## Live resource identifiers

| Thing | Value |
| --- | --- |
| Frontend S3 bucket | `surya-portfolio-frontend` |
| CloudFront distribution | `E2L6TNP1MUJTWP` |
| Lambda function | `surya-portfolio-api` |
| DynamoDB table | `surya-portfolio` |
| Deploy role ARN | `arn:aws:iam::626635433373:role/surya-portfolio-gha-deploy` |
| Terraform role ARN | `arn:aws:iam::626635433373:role/surya-portfolio-gha-terraform` |
| TF state bucket | `surya-portfolio-tfstate-626635433373` |
| TF lock table | `surya-portfolio-tflocks` |

## GitHub Actions setup (one-time)

Workflows live in `.github/workflows/`: `ci.yml`, `frontend-deploy.yml`,
`backend-deploy.yml`, `terraform.yml`. They deploy on push to `main` (path-filtered)
and authenticate to AWS via the OIDC roles above. Configure these in the repo:

### Repository **variables** (Settings → Secrets and variables → Actions → Variables)

| Name | Value |
| --- | --- |
| `AWS_DEPLOY_ROLE_ARN` | `arn:aws:iam::626635433373:role/surya-portfolio-gha-deploy` |
| `AWS_TERRAFORM_ROLE_ARN` | `arn:aws:iam::626635433373:role/surya-portfolio-gha-terraform` |
| `FRONTEND_BUCKET` | `surya-portfolio-frontend` |
| `CLOUDFRONT_DISTRIBUTION_ID` | `E2L6TNP1MUJTWP` |
| `LAMBDA_FUNCTION_NAME` | `surya-portfolio-api` |
| `API_BASE_URL` | `https://api.kommugurisuryateja.com` |

### Repository **secrets** (only needed for the `terraform` workflow)

| Name | Value |
| --- | --- |
| `TF_VAR_JWT_SECRET` | the JWT signing secret (32-byte hex) |
| `TF_VAR_ADMIN_PASSWORD_HASH` | bcrypt hash of the admin password |

### `prod` Environment (Settings → Environments → New environment: `prod`)

- Add **required reviewers** (yourself) — this gates `terraform apply` and the
  deploy jobs behind a manual approval.

> The OIDC trust policy is scoped to `repo:suryateja213/Surya-Teja-Portfolio`
> on `main` and the `prod` environment. Deploys from other branches/forks are
> rejected by AWS.

## Manual deploy (fallback / first-time)

Run with the domain-owning profile: `$env:AWS_PROFILE = "suryatejaportfolio"`.

### Backend

```powershell
cd backend
# build/function.zip — install linux wheels, add app/, zip with forward slashes
aws lambda update-function-code --function-name surya-portfolio-api --zip-file fileb://build/function.zip
aws lambda wait function-updated --function-name surya-portfolio-api
curl.exe https://api.kommugurisuryateja.com/v1/health   # {"status":"ok"}
```

### Frontend

```powershell
cd frontend
$env:NEXT_PUBLIC_API_BASE_URL = "https://api.kommugurisuryateja.com"
npm run build
aws s3 sync out/ s3://surya-portfolio-frontend --delete
aws cloudfront create-invalidation --distribution-id E2L6TNP1MUJTWP --paths "/*"
```

## Notes & gotchas

- **`NEXT_PUBLIC_API_BASE_URL` is baked at build time** — changing the API
  domain needs a frontend rebuild + redeploy.
- **Lambda code is owned by CI**, not Terraform (`lifecycle ignore_changes` on
  the artifact). Terraform manages the function's configuration only.
- **`AWS_REGION` must not be set** as a Lambda env var — it's reserved and
  injected automatically.
- **Lambda deps must be Linux x86_64 wheels** (`--platform manylinux2014_x86_64
  --only-binary=:all:`); Windows-built wheels (bcrypt, cryptography) crash on Lambda.
- The bcrypt admin-password hash is the only admin credential; rotate by
  regenerating the hash and re-applying Terraform (updates the Lambda env).
