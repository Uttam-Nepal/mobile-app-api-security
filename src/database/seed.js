const bcrypt = require("bcryptjs");
const db = require("./db");

const accounts = [
  {
    email: "sijan@example.test",
    displayName: "Sijan",
    passwordEnv: "TEST_PASSWORD_SIJAN",
  },
  {
    email: "uttam@example.test",
    displayName: "Uttam",
    passwordEnv: "TEST_PASSWORD_UTTAM",
  },
];

async function seedAccounts() {
  for (const account of accounts) {
    let user = db
      .prepare("SELECT id FROM users WHERE email = ?")
      .get(account.email);

    if (!user) {
      const password = process.env[account.passwordEnv];

      if (!password || password.length < 12) {
        throw new Error(
          `${account.passwordEnv} must be set to a test password of at least 12 characters.`,
        );
      }

      const passwordHash = await bcrypt.hash(password, 12);

      const result = db
        .prepare(
          `
        INSERT INTO users (email, password_hash, display_name)
        VALUES (?, ?, ?)
      `,
        )
        .run(account.email, passwordHash, account.displayName);

      user = { id: Number(result.lastInsertRowid) };

      console.log(`Created account: ${account.displayName}`);
    } else {
      console.log(`Account already exists: ${account.displayName}`);
    }

    // Create a fictional profile if one doesn't already exist.
    const profile = db
      .prepare("SELECT id FROM profiles WHERE user_id = ?")
      .get(user.id);

    if (!profile) {
      db.prepare(
        `
        INSERT INTO profiles (user_id, phone_number, city, bio)
        VALUES (?, ?, ?, ?)
      `,
      ).run(
        user.id,
        null,
        "Example City",
        "Fictional profile for local security testing.",
      );

      console.log(`Created profile: ${account.displayName}`);
    }
  }
}

seedAccounts()
  .catch((error) => {
    console.error("Account seeding failed:", error.message);
    process.exitCode = 1;
  })
  .finally(() => {
    db.close();
  });
