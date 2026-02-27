const express = require("express");
const router = express.Router();
const Event = require("../models/Event");
const { fetchUpcomingContests } = require("../services/codeforcesService");

/**
 * GET /api/contests/fetch
 *
 * 1. Hits the Codeforces API to get all upcoming contests
 * 2. Console logs each contest
 * 3. Upserts each contest into MongoDB (insert if new, skip if already exists)
 * 4. Returns a summary response
 */
router.get("/fetch", async (req, res) => {
  try {
    // ── Step 1: Fetch from Codeforces ────────────────────────────────────────
    const contests = await fetchUpcomingContests();

    // ── Step 2: Console log every contest ────────────────────────────────────
    console.log("\n========== UPCOMING CODEFORCES CONTESTS ==========");
    contests.forEach((contest, i) => {
      console.log(`\n[${i + 1}] ${contest.name}`);
      console.log(`    ID       : ${contest.codeforcesId}`);
      console.log(`    Start    : ${contest.startTime.toUTCString()}`);
      console.log(`    Duration : ${contest.durationMinutes} minutes`);
      console.log(`    URL      : ${contest.url}`);
    });
    console.log("\n==================================================\n");

    // ── Step 3: Push to MongoDB ───────────────────────────────────────────────
    // We use bulkWrite with upsert so:
    //   - New contests are INSERTED
    //   - Already existing contests are SKIPPED (is_delivered is NOT overwritten)
    // The unique key is `codeforcesId`

    const bulkOps = contests.map((contest) => ({
      updateOne: {
        filter: { codeforcesId: contest.codeforcesId },  // ← primary key
        update: {
          $setOnInsert: {
            name: contest.name,
            codeforcesId: contest.codeforcesId,
            startTime: contest.startTime,
            durationMinutes: contest.durationMinutes,
            url: contest.url,
            is_delivered: false,
          },
        },
        upsert: true,
      },
    }));

    const bulkResult = await Event.bulkWrite(bulkOps);

    const inserted = bulkResult.upsertedCount;
    const skipped = contests.length - inserted;

    console.log(`MongoDB: ${inserted} new contest(s) inserted.`);
    console.log(`MongoDB: ${skipped} contest(s) already existed — skipped.\n`);

    // ── Step 4: Respond ───────────────────────────────────────────────────────
    res.json({
      success: true,
      summary: {
        totalFetched: contests.length,
        newlyInserted: inserted,
        alreadyExisted: skipped,
      },
      contests,
    });
  } catch (err) {
    console.error("Error in /fetch route:", err.message);
    res.status(500).json({ success: false, error: err.message });
  }
});

/**
 * GET /api/contests
 * Returns all contests currently stored in MongoDB (for quick verification)
 */
router.get("/", async (req, res) => {
  try {
    const events = await Event.find().sort({ startTime: 1 });
    res.json({ success: true, count: events.length, events });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

module.exports = router;