# Profile-Level Authorization Test

## Objective

Verify that an authenticated user can access their own profile but cannot access another user's profile.

## Method

Using the browser session containing Sijan's authentication cookie, sent two same-origin requests through the browser Console:

- `GET /api/profiles/1`
- `GET /api/profiles/2`

Sijan has user ID 1, and Uttam has user ID 2.

## Results

| Request                          | Expected result | Observed result |
| -------------------------------- | --------------- | --------------- |
| Sijan accesses `/api/profiles/1` | `200 OK`        | `200 OK`        |
| Sijan accesses `/api/profiles/2` | `404 Not Found` | `404 Not Found` |

The own-profile response contained Sijan's profile. The cross-user request returned `{"error":"Profile not found."}`.

## Interpretation

The results support the effectiveness of the profile endpoint's user-level authorization check for these two test cases. The endpoint allows access to the authenticated user's profile and does not disclose the other user's profile through the tested request.

## Limitations

This test covers one authenticated account and one cross-user access attempt. It does not establish that every authorization path or every possible identifier is protected.

## Evidence

- `profile-authorization-test.png`
