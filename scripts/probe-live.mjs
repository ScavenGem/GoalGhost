import fs from "fs";

const key = fs.readFileSync(".env.local", "utf8").match(/FOOTBALL_DATA_API_KEY=(.+)/)?.[1].trim();

for (const url of [
  "https://api.football-data.org/v4/competitions/WC/matches?status=LIVE,IN_PLAY,PAUSED",
  "https://api.football-data.org/v4/matches?competitions=WC&status=LIVE",
]) {
  const res = await fetch(url, { headers: { "X-Auth-Token": key } });
  const data = await res.json();
  const live = (data.matches ?? []).filter((m) =>
    ["LIVE", "IN_PLAY", "PAUSED", "HT"].includes(m.status)
  );
  console.log("\nURL", url, "count", live.length);
  for (const m of live) {
    console.log({
      id: m.id,
      status: m.status,
      minute: m.minute,
      injuryTime: m.injuryTime,
      utcDate: m.utcDate,
      lastUpdated: m.lastUpdated,
      ft: m.score?.fullTime,
      ht: m.score?.halfTime,
    });
    const d = await (
      await fetch(`https://api.football-data.org/v4/matches/${m.id}`, {
        headers: { "X-Auth-Token": key },
      })
    ).json();
    console.log("DETAIL", {
      minute: d.minute,
      injuryTime: d.injuryTime,
      status: d.status,
      lastUpdated: d.lastUpdated,
      ft: d.score?.fullTime,
      ht: d.score?.halfTime,
      goals: d.goals?.length,
      lastGoal: d.goals?.at(-1),
    });
  }
}