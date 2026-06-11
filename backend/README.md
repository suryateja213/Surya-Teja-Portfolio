# Backend — Portfolio API

FastAPI service that runs on AWS Lambda via [Mangum](https://mangum.io/), behind
an API Gateway HTTP API. Provides contact-form intake, project content, and
single-admin JWT auth, backed by a single DynamoDB table.

## Layout

```
app/
  main.py              FastAPI app + CORS + Mangum handler (Lambda entry: app.main.handler)
  api/
    deps.py            shared dependencies (admin JWT guard)
    v1/
      router.py        mounts endpoint routers under /v1
      endpoints/       health, contact, projects, auth
  core/                config (pydantic-settings), security (JWT + bcrypt), logging
  db/dynamodb.py       boto3 table accessor + key helpers (single-table design)
  models/              DynamoDB item <-> domain mappers
  schemas/             pydantic request/response contracts
  services/            business logic (project, contact, auth)
tests/                 pytest + moto-mocked DynamoDB
```

## Endpoints

| Method | Path                | Auth   | Purpose                          |
| ------ | ------------------- | ------ | -------------------------------- |
| GET    | `/v1/health`        | —      | liveness / warmer                |
| POST   | `/v1/contact`       | public | contact-form submission          |
| GET    | `/v1/projects`      | public | list projects                    |
| GET    | `/v1/projects/{slug}` | public | one project                    |
| POST   | `/v1/projects`      | admin  | create project                   |
| PUT    | `/v1/projects/{slug}` | admin | update project                  |
| DELETE | `/v1/projects/{slug}` | admin | delete project                  |
| POST   | `/v1/auth/login`    | public | admin login → JWT                |

## Data model (single DynamoDB table)

```
Project   PK=PROJECT#<slug>   SK=META   GSI1PK=PROJECT   GSI1SK=<order>#<slug>
Contact   PK=CONTACT#<ulid>   SK=META   GSI1PK=CONTACT   GSI1SK=<createdAt>
```

`GSI1` powers "list projects by order" and "list contacts newest-first".

## Local development

```bash
python -m venv .venv
.venv/Scripts/pip install -r requirements-dev.txt   # Windows; use .venv/bin on POSIX
cp .env.example .env                                  # then fill JWT_SECRET, ADMIN_PASSWORD_HASH

# Run against a local DynamoDB (set DYNAMODB_ENDPOINT_URL in .env), then:
.venv/Scripts/uvicorn app.main:app --reload --port 8000
```

Generate an admin password hash:

```bash
python -c "import bcrypt; print(bcrypt.hashpw(b'your-password', bcrypt.gensalt()).decode())"
```

## Quality gates

```bash
.venv/Scripts/ruff check .          # lint
.venv/Scripts/ruff format --check . # format
.venv/Scripts/mypy app              # types (strict)
.venv/Scripts/pytest                # tests (moto-mocked DynamoDB)
```

## Packaging for Lambda

`make package` builds `build/function.zip` with manylinux wheels for the
Python 3.12 Lambda runtime. Terraform owns the function shell; CI ships code via
`aws lambda update-function-code`.
