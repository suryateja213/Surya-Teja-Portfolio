"""Local development entry point.

Run the API locally with one command:

    python run.py

This is a CONVENIENCE for local dev only. In production the app runs on AWS
Lambda, which imports `app.main.handler` (the Mangum handler) directly and never
executes this file. So nothing here affects prod — it just saves you from
remembering the full uvicorn command.

It defaults the AWS profile to the one that owns the DynamoDB table, so the
backend can reach the real table without you exporting it each time. Override
with PORT / RELOAD / AWS_PROFILE env vars if needed.
"""

import os

import uvicorn

# Point boto3 at the table-owning account unless the caller already chose a
# profile (or is running in Lambda, where AWS creds come from the role).
os.environ.setdefault("AWS_PROFILE", "suryatejaportfolio")


def main() -> None:
    port = int(os.environ.get("PORT", "8000"))
    reload = os.environ.get("RELOAD", "true").lower() != "false"
    uvicorn.run("app.main:app", host="127.0.0.1", port=port, reload=reload)


if __name__ == "__main__":
    main()
