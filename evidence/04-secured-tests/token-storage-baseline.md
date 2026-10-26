# Baseline Experiment: Insecure Token Storage

## Objective

Determine whether the browser stores the API access token
in persistent local storage.

## Procedure

1. Open the local application.
2. Sign in using Sijan's fictional test account.
3. Open browser Developer Tools.
4. Navigate to Application > Local Storage.
5. Inspect the storage entry for the local application.

## Actual Result

The `access_token` key was present in localStorage after login.
The interface also reported that the access token persists.

## Security Risk

JavaScript running in the same origin can read localStorage.
If a cross-site scripting (XSS) vulnerability allows attacker-
controlled JavaScript to execute, the token may be exposed.

## Planned Improvement

Replace JavaScript-readable token storage with an HttpOnly,
Secure, SameSite cookie and verify that the browser can still
authenticate without exposing the token to page JavaScript.

## Evidence

- `token-storage-baseline.png`
- `token-storage-baseline.md`
