const axios = require("axios");

const CF_API_URL = "https://codeforces.com/api/contest.list";

/**
 * Fetches all UPCOMING contests from the Codeforces public API.
 * Returns an array of cleaned contest objects ready to be stored in MongoDB.
 */
const fetchUpcomingContests = async () => {
  console.log("Calling Codeforces API...");
  const response = await axios.get(CF_API_URL);

  const { status, result } = response.data;

  if (status !== "OK") {
    throw new Error(`Codeforces API returned status: ${status}`);
  }

  // phase === "BEFORE" means the contest hasn't started yet
  const upcoming = result.filter((contest) => contest.phase === "BEFORE");

  console.log(`Found ${upcoming.length} upcoming contest(s) from Codeforces.`);

  // Map raw CF API fields to our schema
  const contests = upcoming.map((contest) => ({
    name: contest.name,
    codeforcesId: contest.id,
    // CF gives startTimeSeconds as a Unix timestamp (seconds), convert to Date
    startTime: new Date(contest.startTimeSeconds * 1000),
    // CF gives durationSeconds, convert to minutes
    durationMinutes: Math.round(contest.durationSeconds / 60),
    url: `https://codeforces.com/contest/${contest.id}`,
    is_delivered: false,
  }));

  return contests;
};

module.exports = { fetchUpcomingContests };
