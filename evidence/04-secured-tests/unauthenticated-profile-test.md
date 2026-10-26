# Unauthenticated API Access Test

## Objective

Verify that the profile API rejects requests without authentication.

## Method

Sent a request to `https://localhost:3443/api/profiles/2` using `curl.exe -k -i`, without providing an authentication cookie.

## Result

The API returned `HTTP/1.1 401 Unauthorized` with the response body:

`{"error":"Authentication required."}`

## Interpretation

The endpoint rejected the unauthenticated request instead of returning the requested profile. This supports the effectiveness of the API's authentication middleware for this test case.

## Limitation

This test verifies one request without a cookie. It does not, by itself, verify every invalid-token or authorization scenario.

## Evidence

- `unauthenticated-profile-test.png`
