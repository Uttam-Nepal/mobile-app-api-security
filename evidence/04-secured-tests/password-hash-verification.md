# Password Hash Storage Verification

## Objective

Verify that user passwords are stored as bcrypt hashes rather than plain-text values in the SQLite database.

## Method

Ran a read-only Node.js command using the built-in `node:sqlite` module. The query selected account emails and password-hash fields, then checked whether each stored value matched the expected bcrypt hash prefix. The command did not print the actual password hashes.

## Results

| Test account         | Observed storage format |
| -------------------- | ----------------------- |
| `sijan@example.test` | bcrypt hash             |
| `uttam@example.test` | bcrypt hash             |

## Interpretation

Both test accounts contained values matching the expected bcrypt hash format. This supports the finding that passwords are stored as hashes rather than plain text. The format check does not independently establish the strength of the hashing configuration or verify every stored account.

## Limitations

The check covered the two seeded test accounts in the local database. Node.js displayed an experimental SQLite warning, but the query completed and returned the expected results.

## Evidence

- `password-hash-verification.png`
