# Mobile App & API Security Lab — Runbook

This runbook starts the local **Mobile App and API Security** prototype on Windows. It is intended for the project owner’s local demo and assessment validation, not for production deployment.

## 1. Requirements

- Windows 10/11
- Node.js 22 or later and npm
- The repository: https://github.com/Uttam-Nepal/mobile-app-api-security
- A local development certificate at `certs\localhost.pfx` (not committed to GitHub)

## 2. Open the project

Open **Command Prompt** or the VS Code terminal using Command Prompt, then run:

```cmd
cd /d "C:\Users\admin\OneDrive\Desktop\mobile-app-api-security"
```

If you cloned the repo to another directory, change the path to that directory.

For a fresh clone or after dependency changes, install packages once:

```cmd
npm install
```

## 3. First-time setup only: create the local database and test accounts

Run these only if `data\app.db` does not exist yet or the database is empty. Do not repeatedly seed an existing database unless you intend to reset test data.

```cmd
node --experimental-sqlite src/database/db.js
node --experimental-sqlite src/database/seed.js
```

The app uses fictional test records only. The SQLite database is local and should not be committed to Git.

## 4. Check the HTTPS certificate

Before starting the server, check that this file exists:

```text
certs\localhost.pfx
```

It is intentionally excluded from the Git repository because it contains a private key. The local development PFX password used by this setup is:

```text
LocalPfxPass2026
```

If the certificate file is missing, create a new local-only certificate from PowerShell (run PowerShell from the project directory):

```powershell
New-Item -ItemType Directory -Force .\certs | Out-Null
$cert = New-SelfSignedCertificate -DnsName "localhost" -CertStoreLocation "Cert:\CurrentUser\My" -FriendlyName "Mobile App API Local Dev"
$password = ConvertTo-SecureString "LocalPfxPass2026" -AsPlainText -Force
Export-PfxCertificate -Cert $cert -FilePath ".\certs\localhost.pfx" -Password $password -Force
```

This certificate is for local testing only and will not be trusted by normal production clients.

## 5. Start the application

In the same Command Prompt terminal, generate a fresh JWT secret:

```cmd
node -e "console.log(require('node:crypto').randomBytes(32).toString('hex'))"
```

Copy the generated value privately. Then set it in that same terminal, replacing the example text below with the generated value (do **not** type the placeholder literally):

```cmd
set "JWT_SECRET=PASTE_YOUR_NEW_RANDOM_SECRET_HERE"
set "HTTPS_PFX_PASSWORD=LocalPfxPass2026"
npm run dev
```

Leave this terminal open while using the app. Environment variables set with `set` apply only to that terminal session. A new terminal needs a new `JWT_SECRET` and the PFX password set again. Never put the JWT secret in source code, screenshots, Markdown evidence or GitHub.

The current scripts use Node’s experimental built-in SQLite support. An experimental SQLite warning can appear; it is expected in this setup if the process continues and the server starts successfully.

## 6. Open the interface

Use HTTPS for login and cookie-based authentication:

- **Application:** https://localhost:3443/
- **HTTPS health endpoint:** https://localhost:3443/api/health
- **HTTP comparison endpoint:** http://127.0.0.1:3000/api/health

Chrome may show a certificate warning because the certificate is self-signed. This is expected for the local lab. Do not treat it as production-grade certificate validation. Do not use the local certificate or its password in a production environment.

## 7. Test-account sign-in

These are fictional local-only accounts created by the seed script:

| Name  | Email                | Local test password    |
| ----- | -------------------- | ---------------------- |
| Sijan | `sijan@example.test` | `TestOnly-Sijan-2026!` |
| Uttam | `uttam@example.test` | `TestOnly-Uttam-2026!` |

If login does not work, check that the database was seeded and that the server’s `JWT_SECRET` is set. If you change `JWT_SECRET`, existing tokens become invalid and users must sign in again.

## 8. Quick verification commands

Open a **second terminal** in the project directory while `npm run dev` is still running.

Check the HTTPS health endpoint and security headers:

```cmd
curl.exe -k -i https://localhost:3443/api/health
```

Expected: `HTTP/1.1 200 OK`, JSON health response and security headers.

Check that unauthenticated profile access is rejected:

```cmd
curl.exe -k -i https://localhost:3443/api/profiles/2
```

Expected: `401 Unauthorized` with an authentication-required response.

`-k` disables certificate verification in curl. Use it only for this local self-signed certificate test. The command does **not** demonstrate that a production certificate is trusted.

For the profile-authorisation demo, sign in as Sijan in the browser and run these requests in DevTools Console:

```javascript
fetch("/api/profiles/1", { credentials: "same-origin" }).then(async (r) =>
  console.log("Sijan own profile:", r.status, await r.text()),
);

fetch("/api/profiles/2", { credentials: "same-origin" }).then(async (r) =>
  console.log("Cross-user request:", r.status, await r.text()),
);
```

Expected: Sijan’s own profile returns `200`; the attempt to access Uttam’s profile returns `404`.

## 9. Stop the server

Return to the terminal where `npm run dev` is running and press:

```text
Ctrl + C
```

## 10. Common issues

- **`JWT_SECRET` missing:** set it in the same terminal before `npm run dev`.
- **Login works, but previous session stops working:** a new JWT secret invalidates previously issued tokens; sign in again.
- **PFX file not found:** create the local certificate using Section 4.
- **PFX password error:** set `HTTPS_PFX_PASSWORD` to the password used when exporting `certs\localhost.pfx`.
- **Port already in use:** stop the older server process or close the terminal that is running it, then restart.
- **`node` or `npm` not recognised:** install Node.js, reopen the terminal and verify with `node -v` and `npm -v`.
- **Database or test users missing:** follow the first-time setup steps in Section 3; do not overwrite a useful database without intending to reset it.

## Security and Git hygiene

Before committing changes, run `git status` and verify that none of these are staged: `data\app.db`, `certs\localhost.pfx`, `.env`, secrets, JWT values, `node_modules`, or screenshots exposing authentication-cookie values. Do not commit the local development certificate or its password.
