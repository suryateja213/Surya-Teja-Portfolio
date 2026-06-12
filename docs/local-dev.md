# Local development

Work entirely on your machine; deploy only when you choose to. **Deploys happen
only on push to `main`** — so develop on a branch and nothing deploys until you
merge.

## Workflow (no deploy until you want one)

```bash
git checkout -b feat/whatever     # branch — pushing this NEVER deploys
# ...build features, commit, push the branch freely as backup...
# when a batch is ready to ship:
git checkout main && git merge feat/whatever && git push   # ONE deploy, all features
```

Small features accumulate on the branch with zero workflow runs. You see your
changes live the whole time via the local servers below — no AWS deploy needed.

## Running locally

Two servers. The backend uses your AWS profile to reach the **real** DynamoDB
table (`surya-portfolio`), so local data is shared with production — fine while
the table is essentially empty.

### Backend (`:8000`)

```powershell
cd backend
$env:AWS_PROFILE = "suryatejaportfolio"
.\.venv\Scripts\uvicorn.exe app.main:app --reload --port 8000
```

Config comes from `backend/.env` (gitignored). Local admin login:

- **Email:** `kommugurisuryateja@gmail.com`
- **Password:** `admin123`

(`.env` stores the bcrypt hash, not the plaintext. To change the local password:
`.\.venv\Scripts\python.exe -c "from app.core.security import hash_password; print(hash_password('newpw'))"`
and paste the result into `ADMIN_PASSWORD_HASH`.)

### Frontend (`:3000`)

```powershell
cd frontend
npm run dev
```

`frontend/.env.local` points it at `http://localhost:8000`. Open
<http://localhost:3000> for the site, <http://localhost:3000/admin/login> for the
dashboard.

## Local vs production credentials

| | Local | Production |
| --- | --- | --- |
| Source | `backend/.env` (gitignored) | Lambda env var, set by Terraform |
| Password | `admin123` | set via `TF_VAR_admin_password_hash` |
| Cookie | `SameSite=Lax`, insecure (http localhost) | `SameSite=None; Secure; Domain=.kommugurisuryateja.com` |

To change the **production** password later: generate a new bcrypt hash, set it
as the `TF_VAR_ADMIN_PASSWORD_HASH` GitHub secret, and let the deploy workflow's
`terraform apply` push it (or apply locally once). The plaintext is never stored
— only the hash.
