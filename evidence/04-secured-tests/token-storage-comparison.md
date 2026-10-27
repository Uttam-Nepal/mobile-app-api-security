# Token Storage: Before-and-After Comparison

## Objective

Compare JavaScript-readable localStorage token storage with
HttpOnly cookie-based token handling.

## Baseline: localStorage

### Procedure

1. Sign in using the fictional Sijan test account.
2. Inspect the browser's Local Storage.
3. Check whether the `access_token` key exists.

### Actual result

The `access_token` key was present in localStorage after login.
The application displayed a message confirming that the token
persisted in browser localStorage.

### Risk

JavaScript running in the same origin can read localStorage.
If an XSS vulnerability allows untrusted JavaScript to execute,
an access token stored there could be exposed.

## Improved design: HttpOnly cookie

### Procedure

1. Sign in through the local HTTPS interface.
2. Inspect the access-token cookie in browser Developer Tools.
3. Verify the cookie attributes.
4. Run JavaScript checks for localStorage and `document.cookie`.
5. Retrieve the authenticated user's profile.

### Actual results

- The cookie table showed `HttpOnly` enabled.
- The cookie table showed `Secure` enabled.
- The cookie table showed `SameSite=Strict`.
- `localStorage.getItem('access_token')` returned `null`.
- `document.cookie.includes('access_token=')` returned `false`.
- Uttam's authenticated profile request succeeded using the cookie.

### Security interpretation

The JWT is no longer stored in localStorage or directly readable
through `document.cookie`. The browser sends the eligible cookie
with requests, while the server verifies the JWT before allowing
profile access.

HttpOnly reduces the ability of injected JavaScript to steal the
cookie through normal JavaScript APIs. It does not prevent XSS
itself or eliminate all session-related risks.

## Limitations

The prototype uses a self-signed local TLS certificate, so it is
not a production deployment. Cookie-based authentication must also
consider CSRF protection, secure deployment configuration, session
expiry and logout behaviour.

## Evidence

- `token-storage-baseline.png`
- `httponly-cookie-login-sijan.png`
- `httponly-cookie-attributes.png`
- `httponly-javascript-access-check.png`
- `httponly-cookie-profile-uttam.png`

## Logout and Session Clearing

### Procedure

1. Sign in through the HTTPS application.
2. Select "Sign out / clear session".
3. Inspect the browser cookie table.
4. Request a protected profile without an authentication cookie.

### Actual Results

- The access-token cookie was no longer present.
- The profile request returned HTTP 401 Unauthorized.
- The API response was `Authentication required.`

### Conclusion

The logout flow cleared the cookie, and the protected profile
endpoint rejected the subsequent request without authentication.
