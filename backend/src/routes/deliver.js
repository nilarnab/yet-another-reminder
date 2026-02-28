const express = require("express");
const { google } = require("googleapis");
const Event = require("../models/Event");
const User = require("../models/User");

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
 * Get the user's dedicated ContestSync calendar ID.
 * Creates one if it doesn't exist yet, then saves it to MongoDB.
 */
async function getOrCreateContestCalendar(user, calendar) {
  // Already created before — reuse it
  if (user.calendarId) return user.calendarId;

  // Create a brand new calendar on their Google account
  const newCal = await calendar.calendars.insert({
    requestBody: {
      summary: "ContestSync 🏆",
      description: "Coding contests auto-synced by ContestSync",
      timeZone: "UTC",
    },
  });

  const calendarId = newCal.data.id;

  // Persist so we don't create duplicates on next delivery
  await User.findByIdAndUpdate(user._id, { calendarId });
  user.calendarId = calendarId; // update in-memory too

  console.log(`  📅 Created ContestSync calendar for ${user.email}`);
  return calendarId;
}

/**
 * Create a single Google Calendar event for a user.
 * Returns true on success, false on failure.
 */
async function createCalendarEvent(user, event) {
  try {
    const calendar = buildCalendarClient(user);

    // Use dedicated ContestSync calendar instead of primary
    const calendarId = await getOrCreateContestCalendar(user, calendar);

    const endTime = new Date(
      event.startTime.getTime() + event.durationMinutes * 60 * 1000
    );

    await calendar.events.insert({
      calendarId,
      requestBody: {
        summary: `🏆 ${event.name}`,
        description: `Codeforces Contest\n\nDuration: ${event.durationMinutes} minutes\nJoin here: ${event.url}`,
        start: {
          dateTime: event.startTime.toISOString(),
          timeZone: "UTC",
        },
        end: {
          dateTime: endTime.toISOString(),
          timeZone: "UTC",
        },
        source: {
          title: "ContestSync",
          url: event.url,
        },
        reminders: {
          useDefault: false,
          overrides: [
            { method: "popup", minutes: 60 },  // 1 hour before
            { method: "popup", minutes: 10 },  // 10 mins before
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
 * 1. Fetch all events where is_delivered: false
 * 2. For each event, push to every user's Google Calendar
 * 3. Mark event as is_delivered: true if at least one user succeeded
 * 4. Return a full summary
 */
router.post("/", async (req, res) => {
  try {
    // ── Step 1: Get all undelivered events ───────────────────────────────────
    const undeliveredEvents = await Event.find({ is_delivered: false });

    if (undeliveredEvents.length === 0) {
      return res.json({
        success: true,
        message: "No undelivered events found.",
        summary: { eventsProcessed: 0, eventsDelivered: 0 },
      });
    }

    console.log(`\n========== DELIVERY JOB ==========`);
    console.log(`Found ${undeliveredEvents.length} undelivered event(s).`);

    // ── Step 2: Get all users ─────────────────────────────────────────────────
    const users = await User.find({ refreshToken: { $exists: true, $ne: null } });

    if (users.length === 0) {
      return res.json({
        success: true,
        message: "No users with calendar access found.",
        summary: { eventsProcessed: undeliveredEvents.length, eventsDelivered: 0 },
      });
    }

    console.log(`Delivering to ${users.length} user(s).\n`);

    const results = [];

    // ── Step 3: For each event, push to all users ─────────────────────────────
    for (const event of undeliveredEvents) {
      console.log(`Processing: "${event.name}"`);

      let atLeastOneSuccess = false;
      const userResults = [];

      for (const user of users) {
        const success = await createCalendarEvent(user, event);
        if (success) {
          atLeastOneSuccess = true;
          console.log(`  ✓ Delivered to ${user.email}`);
        }
        else {
            console.log(`  ✗ Failed to deliver to ${user.email}`);
        }
        userResults.push({ email: user.email, success });
      }

      // ── Step 4: Mark as delivered if at least one user got it ─────────────
      if (atLeastOneSuccess) {
        await Event.findByIdAndUpdate(event._id, { is_delivered: true });
        console.log(`  → Marked as delivered.\n`);
      } else {
        console.log(`  → NOT marked as delivered (all users failed).\n`);
      }

      results.push({
        eventName: event.name,
        startTime: event.startTime,
        delivered: atLeastOneSuccess,
        userResults,
      });
    }

    console.log(`========== DELIVERY COMPLETE ==========\n`);

    const deliveredCount = results.filter((r) => r.delivered).length;

    return res.json({
      success: true,
      summary: {
        eventsProcessed: undeliveredEvents.length,
        eventsDelivered: deliveredCount,
        eventsFailed: undeliveredEvents.length - deliveredCount,
        usersTargeted: users.length,
      },
      results,
    });

  } catch (err) {
    console.error("Delivery job error:", err.message);
    return res.status(500).json({ success: false, error: err.message });
  }
});

module.exports = router;