const express = require("express");
const { OAuth2Client } = require("google-auth-library");
const User = require("../models/User");

const router = express.Router();


console.log("Creating client with", process.env.GOOGLE_REDIRECT_URI)
const client = new OAuth2Client(
  process.env.GOOGLE_CLIENT_ID,
  process.env.GOOGLE_CLIENT_SECRET,
  process.env.GOOGLE_REDIRECT_URI
);

/**
 * POST /auth/google
 * Body: { code: "<auth-code from frontend>" }
 *
 * Flow:
 * 1. Exchange auth code → tokens
 * 2. Decode id_token → user profile (sub, email, name, picture)
 * 3. Upsert user in MongoDB
 * 4. Return user doc to frontend
 */
router.post("/google", async (req, res) => {
  const { code } = req.body;

  if (!code) {
    return res.status(400).json({ detail: "Missing authorization code." });
  }

  try {
    // Step 1 — Exchange code for tokens
    const { tokens } = await client.getToken(code);
    client.setCredentials(tokens);

    // Step 2 — Decode the id_token to get user info
    const ticket = await client.verifyIdToken({
      idToken: tokens.id_token,
      audience: process.env.GOOGLE_CLIENT_ID,
    });
    const payload = ticket.getPayload();
    const { sub: googleId, email, name, picture } = payload;

    // Step 3 — Upsert user, aligned with User model field names
    const updateFields = {
      email,
      name,
      picture,
      accessToken: tokens.access_token,
      tokenExpiresAt: new Date(tokens.expiry_date),
    };

    // Google only sends refresh_token on the VERY FIRST login.
    // Never overwrite an existing refreshToken with undefined.
    if (tokens.refresh_token) {
      updateFields.refreshToken = tokens.refresh_token;
    }

    const user = await User.findOneAndUpdate(
      { googleId },
      {
        $set: updateFields,
        $setOnInsert: { googleId }, // only written on first insert
      },
      {
        upsert: true,
        new: true,
        setDefaultsOnInsert: true,
      }
    );

    // Step 4 — Return user to frontend
    return res.status(200).json({ user });

  } catch (err) {
    console.error("Google auth error:", err.message);
    return res.status(401).json({ detail: "Google authentication failed." });
  }
});

module.exports = router;