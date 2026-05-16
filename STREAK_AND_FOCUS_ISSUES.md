# Issues: Streak Reset & Focus Time Not Resetting at Midnight

## Issue 1: Streak Shows 0 (Not Incrementing Properly)

### Root Cause
The streak calculation in the dashboard has a logic flaw:

**Location:** [src/app/dashboard/page.tsx](src/app/dashboard/page.tsx#L126-L137)

```typescript
// Current problematic logic:
const today = new Date().toISOString().split("T")[0];
let streak = 0;
const sortedDays = [...heatmapData].reverse();
for (const day of sortedDays) {
  if (day.date > today) continue;  // Skip future dates
  if (day.total > 0 || day.isFrozen) {
    streak++;
  } else {
    break;  // BREAKS on first day with 0 activity
  }
}
```

**Problems:**
1. **Includes today in check**: The loop processes `today` in the data. If today hasn't had any completed sessions yet (which is common in the morning), `day.total = 0`, and the streak breaks immediately.
2. **Breaks too early**: The `break` statement stops counting as soon as it finds any day with 0 activity. This means if you skip a day, your streak resets to 0 even if you had activity before.
3. **Data stale**: The `getHeatmapData()` only includes **completed** sessions. If you're currently in a timer session, it won't be counted until completion.

### Why It's Happening
- When you load the dashboard in the morning before completing today's focus session, `today` has `total: 0`
- The loop immediately breaks when it encounters this zero
- Streak shows 0 instead of showing the accumulated count from previous days

---

## Issue 2: Focus Time Shows Yesterday's Data (Not Resetting at Midnight)

### Root Cause
The focus time might be persisting due to date boundary issues when calculating daily sessions.

**Location:** [src/actions/daily-focus-actions.ts](src/actions/daily-focus-actions.ts#L40-L120)

**Current Logic:**
```typescript
const dayStart = new Date(now);
dayStart.setHours(0, 0, 0, 0);  // Midnight of current day
const dayEnd = new Date(now);
dayEnd.setHours(23, 59, 59, 999);  // 23:59:59 of current day

// Query sessions in this range
const sessions = await prisma.focusSession.findMany({
  where: {
    userId,
    startTime: {
      gte: dayStart,
      lte: dayEnd,
    },
  },
  select: { duration: true, isCompleted: true },
});
```

**Problems:**
1. **Timezone Issues**: The date boundaries use local time (via `setHours`), but the database might have sessions stored in UTC or a different timezone
2. **Session startTime includes time component**: When comparing `startTime: { gte: dayStart, lte: dayEnd }`, sessions from yesterday might still be counted if the timezone conversion is off
3. **Not using UTC consistently**: The heatmap data uses `toISOString().split("T")[0]` which is UTC, but the daily progress uses local timezone

### Example Problem Scenario
- User in UTC+5:30 timezone
- Yesterday's session: `startTime: 2026-04-12T23:30:00 UTC` = `2026-04-13T05:00:00 UTC+5:30` (actually today)
- When calculating today's focus at `dayStart: 2026-04-13T00:00:00` local time (= `2026-04-12T18:30:00 UTC`)
- The query includes the session because timezone comparison is inconsistent

---

## Fixes Required

### Fix 1: Streak Calculation - Exclude Today From Count
**File:** [src/app/dashboard/page.tsx](src/app/dashboard/page.tsx#L126-L137)

The streak should count from **yesterday backwards**, not including today. This way:
- Your streak is stable throughout the day
- Today's activity adds to tomorrow's streak count (when it becomes "yesterday")
- Breaks only happen when you truly miss a day

```typescript
// Better logic:
const today = new Date().toISOString().split("T")[0];
let streak = 0;
const sortedDays = [...heatmapData].reverse();
for (const day of sortedDays) {
  if (day.date >= today) continue;  // SKIP today - count from yesterday back
  if (day.total > 0 || day.isFrozen) {
    streak++;
  } else {
    break;  // NOW break only on actual past days with 0 activity
  }
}
```

### Fix 2: Focus Time Reset - Use Consistent UTC
**File:** [src/actions/daily-focus-actions.ts](src/actions/daily-focus-actions.ts#L40-L120)

Use UTC consistently for date boundaries:

```typescript
// Use UTC for all date comparisons
const now = new Date();
const dayStart = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate(), 0, 0, 0, 0));
const dayEnd = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate(), 23, 59, 59, 999));

// And in getHeatmapData, use UTC consistently
```

### Fix 3: Add Midnight Reset Logic
Create a scheduled task (API route or cron job) that runs daily at midnight to:
1. Mark yesterday's tracking as complete
2. Create a fresh record for today
3. Process any carry-over from incomplete days

This removes dependency on real-time date calculations.

---

## Summary
- **Streak Issue**: Streak includes incomplete "today" in calculation, breaks when today has no sessions yet
- **Focus Time Issue**: Timezone inconsistency causes yesterday's sessions to be counted in today's total
- **Solution**: 
  1. Count streak from yesterday backwards (exclude today)
  2. Use UTC consistently for all date boundaries
  3. Optional: Add explicit midnight reset logic
