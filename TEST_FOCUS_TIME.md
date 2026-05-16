# FocusGrid Focus Time Fix - TEST PLAN

## Fixes Applied ✅

1. **Pause Duration Display** - Analytics page now divides pause time by 60 (seconds → minutes)
2. **Timezone Handling** - Daily focus tracking uses local timezone consistently
3. **Real-time Sync** - Dashboard and analytics poll for updates every 5 seconds when timer is active
4. **Revalidation** - Both dashboard and analytics pages cache-bust on session completion

## Manual Test Steps

### Step 1: Create a Test Subject (if needed)
- Go to `/dashboard/subjects`
- Create a subject (e.g., "Test Subject")
- Create a task/topic under it

### Step 2: Run a Test Timer Session
- Go to `/dashboard/timer`
- Select the subject/task
- Choose either "Flow Mode" or "Pomodoro Mode"
- **Start timer and let it run for 30-60 seconds**
- Pause the timer and select a reason (e.g., "DISTRACTION")
- Click "Resume"
- Let it run for another 30-60 seconds
- Click "Complete Session"

### Step 3: Verify Focus Time in Dashboard
- Go back to `/dashboard`
- Check "Total Focus" widget - should show the minutes you focused
- Check "Daily Focus Progress" widget - should update with your session
- Check heatmap - today's date should have a data point

### Step 4: Verify Analytics Display
- Go to `/dashboard/analytics`
- Check "Pause Time Summary" section
- **IMPORTANT**: "Total Time Paused" should show minutes, not massive number
  - Example: If you paused for 45 seconds, it should show ~1m (not 45m)
- Check "Pause Reasons Breakdown" → each reason should show minutes in "total" line

### Step 5: Database Verification (Optional)
```bash
# In terminal, run:
npx prisma studio

# Check tables:
# 1. FocusSession → duration should be in minutes (e.g., 1 for 60-second session)
# 2. PauseLog → duration should be in seconds (e.g., 45 for 45-second pause)
# 3. DailyFocusTracking → actualFocusTime should be in minutes
```

## Expected Results

| Component | Expected | Example |
|-----------|----------|---------|
| Dashboard "Total Focus" | Total minutes today | "1m" or "45m" |
| Dashboard heatmap | Date with colored block + tooltip showing minutes | "2m" hover tooltip |
| Analytics "Total Time Paused" | Minutes converted from seconds | Session with 5 pauses of 60s each = "5m" |
| Analytics "Pause Reasons Breakdown" | Minutes per reason | "5m total" per reason |
| Database FocusSession.duration | Minutes | 25 (for 25 min pomo) |
| Database PauseLog.duration | Seconds | 60 (for 1-min pause) |

## Real-Time Sync Test

1. Start timer and wait 10 seconds
2. WITHOUT clicking anything, watch the dashboard
3. Every 5 seconds, focus time should update automatically
4. When you pause/resume, data should refresh
5. When you complete, dashboard should show final time immediately

## Known Limitations

- App must be focused for polling to work consistently (browser background tabs may throttle)
- First poll happens immediately on session start, then every 5 seconds
- If you close tab while timer running, session still saves via beforeunload handler

## Troubleshooting

| Issue | Solution |
|-------|----------|
| Focus time shows only 1 minute but I focused 20+ | Check if sessions are marked as `isCompleted: true` in DB |
| Pause time shows huge number (e.g., 300m) | Frontend fix didn't apply - clear browser cache (Ctrl+Shift+Delete) |
| Weekly report or carry-over doesn't work | Check timezone - IST sessions might be queried as wrong date |
| Real-time updates not showing | Check browser console for errors; refresh dashboard |

---

Run through these steps and report any issues!
