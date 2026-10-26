# HTTP Security Headers Validation

## Objective

Verify that the local HTTPS application returns the expected HTTP security headers.

## Method

Ran `curl.exe -k -i https://localhost:3443/api/health` against the local HTTPS health endpoint.

## Result

The server returned `HTTP/1.1 200 OK` with a JSON health response. The response included the following headers:

- `Content-Security-Policy`
- `Cross-Origin-Opener-Policy: same-origin`
- `Cross-Origin-Resource-Policy: same-origin`
- `Referrer-Policy: no-referrer`
- `Strict-Transport-Security: max-age=31536000; includeSubDomains`
- `X-Content-Type-Options: nosniff`
- `X-Frame-Options: SAMEORIGIN`
- `X-Permitted-Cross-Domain-Policies: none`

## Interpretation

The response demonstrates that several browser security headers are present on the HTTPS health endpoint. The Content Security Policy restricts resource sources, although its `style-src` directive permits `unsafe-inline`, which reduces the strictness of that restriction.

## Limitations

The request used `curl.exe -k`, which bypasses certificate validation. The server uses a self-signed certificate for local development, so this test does not demonstrate production certificate trust. The check validates the observed response headers; it does not prove that every possible security risk is eliminated.

## Evidence

- `security-headers.png`
