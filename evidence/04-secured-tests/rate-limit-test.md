# API Rate-Limiting Test

## Objective

Verify that the local API limits repeated login requests.

## Test Environment

- Application: Mobile App and API Security
- Endpoint: `POST /api/auth/login`
- Host: `127.0.0.1`
- Configured limit: 10 requests per 15 minutes
- Test data: Empty JSON request bodies

## Procedure

Sent 12 consecutive login requests with an empty JSON body
to the local API after restarting the development server.

## Actual Results

| Requests | HTTP Status           | Meaning                       |
| -------- | --------------------- | ----------------------------- |
| 1–10     | 400 Bad Request       | Empty login data rejected     |
| 11–12    | 429 Too Many Requests | Rate limiter blocked requests |

## Conclusion

The test confirmed that the login rate limiter blocked requests
after the configured threshold was reached.

The initial requests returned HTTP 400 because they lacked
required login fields. The later requests returned HTTP 429,
demonstrating rate-limit enforcement.

## Evidence

- `rate-limit-test.png`
