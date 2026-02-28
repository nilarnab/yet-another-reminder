const express = require("express");
const { google } = require("googleapis");
const Event = require("../models/Event");
const User = require("../models/User");
const Delivery = require("../models/Delivery");

const router = express.Router();

/**
 * Build an authenticated Google Calendar client for a specific user.
 * Automatically refreshes access token if expired.
 */
function buildCalendarClient(user) {
  const oauth2Client = new google.auth.OAuth2(
    process.env.GOOGLE_CLIENT_ID,
    process.env.GOOGLE_CLIENT_SECRET,
    process.env.GOOGLE_REDIRECT_URI
  );

  oauth2Client.setCredentials({
    access_token: user.accessToken,
    refresh_token: user.refreshToken,
    expiry_date: user.tokenExpiresAt?.getTime(),
  });

  return google.calendar({ version: "v3", auth: oauth2Client });
}

/**
 * Get the user's dedicated YAR calendar ID.
 * Creates one if it doesn't exist yet, then saves it to MongoDB.
 */
async function getOrCreateContestCalendar(user, calendar) {
  if (user.calendarId) return user.calendarId;

  const newCal = await calendar.calendars.insert({
    requestBody: {
      summary: "YAR 🏆",
      description: "Codeforces contests auto-synced by YAR (Yet Another Reminder)",
      timeZone: "UTC",
    },
  });

  const calendarId = newCal.data.id;
  await User.findByIdAndUpdate(user._id, { calendarId });
  user.calendarId = calendarId;

  console.log(`  📅 Created YAR calendar for ${user.email}`);
  return calendarId;
}

/**
 * Create a single Google Calendar event for a user.
 * Returns true on success, false on failure.
 */
async function createCalendarEvent(user, event) {
  try {
    const calendar = buildCalendarClient(user);
    const calendarId = await getOrCreateContestCalendar(user, calendar);

    const endTime = new Date(
      event.startTime.getTime() + event.durationMinutes * 60 * 1000
    );

    await calendar.events.insert({
      calendarId,
      requestBody: {
        summary: `🏆 ${event.name}`,
        description: `Codeforces Contest\n\nDuration: ${event.durationMinutes} minutes\nJoin here: ${event.url}`,
        start: { dateTime: event.startTime.toISOString(), timeZone: "UTC" },
        end:   { dateTime: endTime.toISOString(),         timeZone: "UTC" },
        source: { title: "YAR", url: event.url },
        reminders: {
          useDefault: false,
          overrides: [
            { method: "popup", minutes: 60 },
            { method: "popup", minutes: 10 },
          ],
        },
      },
    });

    return true;
  } catch (err) {
    console.error(`  ✗ Failed for user ${user.email}: ${err.message}`);
    return false;
  }
}

/**
 * POST /api/deliver
 *
 * For every contest × every user:
 *   1. Check if a Delivery doc exists for (userId, contestId)
 *   2. If YES  → already delivered, skip
 *   3. If NO   → push to Google Calendar, then insert Delivery doc
 */
router.get("/", async (req, res) => {
  try {
    // Fetch ALL events — delivery check is handled by the Delivery collection
    const allEvents = await Event.find();

    if (allEvents.length === 0) {
      return res.json({
        success: true,
        message: "No events in the database.",
        summary: { eventsProcessed: 0 },
      });
    }

    // Only users who have granted calendar access
    const users = await User.find({ refreshToken: { $exists: true, $ne: null } });

    if (users.length === 0) {
      return res.json({
        success: true,
        message: "No users with calendar access found.",
        summary: { eventsProcessed: allEvents.length, usersTargeted: 0 },
      });
    }

    console.log(`\n========== DELIVERY JOB ==========`);
    console.log(`Events: ${allEvents.length} | Users: ${users.length}\n`);

    const results = [];

    for (const event of allEvents) {
      console.log(`Processing: "${event.name}"`);
      const userResults = [];

      for (const user of users) {

        // ── Core idempotency check ──────────────────────────────────────────
        // Look up whether this (user, contest) pair has already been delivered
        const alreadyDelivered = await Delivery.findOne({
          userId:    user._id,
          contestId: event._id,
        });

        if (alreadyDelivered) {
          console.log(`  ↷ Skipped ${user.email} (already delivered)`);
          userResults.push({ email: user.email, status: "skipped" });
          continue;
        }
        // ───────────────────────────────────────────────────────────────────

        // Not delivered yet — push to Google Calendar
        const success = await createCalendarEvent(user, event);

        if (success) {
          // Record the delivery so we never push this pair again
          await Delivery.create({ userId: user._id, contestId: event._id });
          console.log(`  ✓ Delivered to ${user.email}`);
          userResults.push({ email: user.email, status: "delivered" });
        } else {
          // Do NOT create a Delivery record — let it retry next run
          console.log(`  ✗ Failed for ${user.email}`);
          userResults.push({ email: user.email, status: "failed" });
        }
      }

      results.push({ eventName: event.name, startTime: event.startTime, userResults });
      console.log();
    }

    console.log(`========== DELIVERY COMPLETE ==========\n`);

    // Build summary counts across all results
    const allUserResults = results.flatMap((r) => r.userResults);
    const delivered = allUserResults.filter((r) => r.status === "delivered").length;
    const skipped   = allUserResults.filter((r) => r.status === "skipped").length;
    const failed    = allUserResults.filter((r) => r.status === "failed").length;

    return res.json({
      success: true,
      summary: {
        eventsProcessed:  allEvents.length,
        usersTargeted:    users.length,
        totalDelivered:   delivered,
        totalSkipped:     skipped,
        totalFailed:      failed,
      },
      results,
    });

  } catch (err) {
    console.error("Delivery job error:", err.message);
    return res.status(500).json({ success: false, error: err.message });
  }
});

module.exports = router;