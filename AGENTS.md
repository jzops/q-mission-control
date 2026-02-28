# Q Communication Protocol

Mission Control is the shared dashboard between Claude Code instances and Q (the AI agent on Mac Mini).

## Convex API

**Base URL:** `https://reminiscent-pigeon-507.convex.cloud`

## Communication Patterns

### To ask Q a question:
```bash
curl -s "$CONVEX_URL/api/mutation" -H "Content-Type: application/json" \
  -d '{"path": "questions:create", "args": {"question": "...", "category": "decision", "priority": "normal"}, "format": "json"}'
```

### To log activity (so Q sees what you did):
```bash
curl -s "$CONVEX_URL/api/mutation" -H "Content-Type: application/json" \
  -d '{"path": "activity:log", "args": {"type": "task_completed", "action": "...", "details": "..."}, "format": "json"}'
```

### To create a task for Q:
```bash
curl -s "$CONVEX_URL/api/mutation" -H "Content-Type: application/json" \
  -d '{"path": "tasks:create", "args": {"title": "...", "assignee": "ai", "priority": "medium"}, "format": "json"}'
```

### To ask Joe a question (Q → Joe):
```bash
curl -s "$CONVEX_URL/api/mutation" -H "Content-Type: application/json" \
  -d '{"path": "questions:ask", "args": {"question": "...", "category": "clarification", "priority": "normal"}, "format": "json"}'
```
**Categories:** `clarification`, `permission`, `preference`, `decision`, `technical`, `other`

### To request approval (Q → Joe):
```bash
curl -s "$CONVEX_URL/api/mutation" -H "Content-Type: application/json" \
  -d '{"path": "approvals:request", "args": {"title": "...", "description": "...", "type": "email_send", "priority": "normal"}, "format": "json"}'
```
**Types:** `email_send`, `social_post`, `calendar_change`, `purchase`, `code_deploy`, `communication`, `other`

### To log a decision Q made autonomously:
```bash
curl -s "$CONVEX_URL/api/mutation" -H "Content-Type: application/json" \
  -d '{"path": "decisions:log", "args": {"title": "...", "description": "...", "reasoning": "...", "category": "email", "impact": "low"}, "format": "json"}'
```
**Categories:** `email`, `scheduling`, `prioritization`, `communication`, `technical`, `other`
**Impact:** `low`, `medium`, `high`

### To check Q's recent activity:
```bash
curl -s "$CONVEX_URL/api/query" -H "Content-Type: application/json" \
  -d '{"path": "activity:list", "args": {"limit": 10}, "format": "json"}'
```

## Tables Used for Communication

| Table | Purpose |
|-------|---------|
| `questions` | Claude Code posts questions → Q sees them on heartbeat |
| `activity` | Q posts activity → Claude Code can query to see updates |
| `tasks` | Shared task list for delegation between agents |
| `approvals` | Items waiting for human approval |
| `decisions` | Autonomous decisions Q made (for transparency) |

## Activity Types
- `task_started`, `task_completed`
- `email_drafted`
- `memory_added`
- `cron_executed`
- `decision_made`
- `approval_requested`
- `question_asked`
- `heartbeat`, `error`, `info`

## Session Logging (Q's Daily Work)

Q should log work entries so Joe can see "What Q did while away":

```bash
curl -s "$CONVEX_URL/api/mutation" -H "Content-Type: application/json" \
  -d '{"path": "sessions:logEntry", "args": {"type": "email", "action": "Drafted reply to client", "reasoning": "Urgent request", "outcome": "Pending approval"}, "format": "json"}'
```

**Session Types:** `email`, `coding`, `research`, `automation`, `communication`, `memory`, `other`

## Lessons Learned

When Joe gives feedback or corrections, log it so Q remembers:

```bash
curl -s "$CONVEX_URL/api/mutation" -H "Content-Type: application/json" \
  -d '{"path": "lessons:add", "args": {"title": "Short title", "description": "What happened", "lesson": "What to do next time", "category": "communication", "source": "feedback"}, "format": "json"}'
```

**Categories:** `communication`, `technical`, `prioritization`, `style`, `process`, `other`
**Sources:** `feedback`, `correction`, `observation`, `explicit`

---

## GitHub Actions: Gmail Auto-Reply Integration

**NOTE:** Email processing is handled by a GitHub Actions workflow, NOT Q's cron job.

**Repo:** `Skills-and-SOPs`
**Workflow:** `.github/workflows/gmail-auto-reply.yml`
**Schedule:** Every 10 min (business hours), every 30 min (off-hours)

### What it does:
1. Reads unread emails from Gmail
2. Classifies them (client, newsletter, spam, etc.)
3. Generates AI-powered draft replies using Claude
4. Creates drafts IN-THREAD in Gmail
5. **Syncs to Mission Control** via Convex:
   - Drafts appear in the `/drafts` page for Joe's review
   - Activity logs appear in the activity feed
   - Tone profile is synced to `emailToneProfiles` table

### Q should NOT:
- Run his own email cron job (it's handled by GitHub Actions)
- Call `drafts:create` for emails (the workflow does this)

### Q CAN:
- Query drafts to see what's pending: `drafts:list`
- Check email activity in the feed
- Ask questions about emails that need clarification

---

## Heartbeat (CRITICAL - Run every 2-5 minutes)

Q must call this regularly so the dashboard shows "Q is Online":

```bash
curl -s "$CONVEX_URL/api/mutation" -H "Content-Type: application/json" \
  -d '{"path": "systemStatus:heartbeat", "args": {"currentTask": "Processing emails"}, "format": "json"}'
```

If Q stops calling this, the dashboard shows "Q is Offline" after 5 minutes.

---

## Email Drafts (For Joe's Review)

When Q drafts an email, submit it for Joe's approval:

```bash
curl -s "$CONVEX_URL/api/mutation" -H "Content-Type: application/json" \
  -d '{"path": "drafts:create", "args": {"subject": "Re: Meeting", "to": "client@example.com", "body": "...", "category": "client", "priority": "normal"}, "format": "json"}'
```
**Categories:** `client`, `internal`, `personal`, `other`
**Priority:** `urgent`, `normal`, `low`

After Joe approves and sends:
```bash
curl -s "$CONVEX_URL/api/mutation" -H "Content-Type: application/json" \
  -d '{"path": "drafts:markSent", "args": {"id": "draft_id_here"}, "format": "json"}'
```

---

## Memories (Knowledge Base)

Store important information Q learns:

```bash
curl -s "$CONVEX_URL/api/mutation" -H "Content-Type: application/json" \
  -d '{"path": "memories:create", "args": {"title": "Client prefers Slack", "content": "John at Acme prefers Slack over email for quick questions", "category": "preference", "source": "observation"}, "format": "json"}'
```

---

## Calendar Events

Create events for the calendar:

```bash
curl -s "$CONVEX_URL/api/mutation" -H "Content-Type: application/json" \
  -d '{"path": "events:create", "args": {"title": "Client call", "type": "meeting", "startTime": 1709251200000}, "format": "json"}'
```
**Types:** `task`, `cron`, `meeting`, `birthday`, `deadline`, `reminder`

---

## People/Contacts

Add or update contacts:

```bash
curl -s "$CONVEX_URL/api/mutation" -H "Content-Type: application/json" \
  -d '{"path": "people:create", "args": {"name": "John Smith", "relationship": "client", "company": "Acme Inc", "email": "john@acme.com"}, "format": "json"}'
```
**Relationships:** `family`, `team`, `client`, `contact`

Record when you contacted someone:
```bash
curl -s "$CONVEX_URL/api/mutation" -H "Content-Type: application/json" \
  -d '{"path": "people:recordContact", "args": {"id": "person_id_here"}, "format": "json"}'
```

---

## Cron Jobs (Automated Tasks)

After running a scheduled task, record it:

```bash
curl -s "$CONVEX_URL/api/mutation" -H "Content-Type: application/json" \
  -d '{"path": "cronJobs:recordRun", "args": {"id": "cron_id", "success": true, "output": "Processed 5 emails"}, "format": "json"}'
```

---

## Agent Status (Office Page)

Update Q's status BY NAME (no ID needed):

```bash
curl -s "$CONVEX_URL/api/mutation" -H "Content-Type: application/json" \
  -d '{"path": "agents:updateStatusByName", "args": {"name": "Q", "status": "working", "currentTask": "Reviewing inbox"}, "format": "json"}'
```
**Status:** `idle`, `working`, `offline`

When starting a task:
```bash
curl -s "$CONVEX_URL/api/mutation" -H "Content-Type: application/json" \
  -d '{"path": "agents:updateStatusByName", "args": {"name": "Q", "status": "working", "currentTask": "Drafting client email"}, "format": "json"}'
```

When done:
```bash
curl -s "$CONVEX_URL/api/mutation" -H "Content-Type: application/json" \
  -d '{"path": "agents:updateStatusByName", "args": {"name": "Q", "status": "idle"}, "format": "json"}'
```

This makes Q appear "working" in the Office page with the task shown.

---

## Managing Sub-Agents (Q's Team)

Q manages status for all team Claude instances:

| Agent Name | Team Member |
|------------|-------------|
| Brady | Cam |
| Jimothy | Brian |
| Rascal | Derek |
| Rufus | Izzy |
| Archie | John |
| Maxwell | Christopher |
| Edgar | Eduardo |
| Girth Brooks | Tech Ops |
| Ben | Finance/HR |
| TaskMaster | Task Mgmt |
| Labrador-7 | Research |
| Rodolfo | Operations |

When delegating to a sub-agent:
```bash
curl -s "$CONVEX_URL/api/mutation" -H "Content-Type: application/json" \
  -d '{"path": "agents:updateStatusByName", "args": {"name": "Brady", "status": "working", "currentTask": "Building client dashboard"}, "format": "json"}'
```

When their task completes:
```bash
curl -s "$CONVEX_URL/api/mutation" -H "Content-Type: application/json" \
  -d '{"path": "agents:updateStatusByName", "args": {"name": "Brady", "status": "idle"}, "format": "json"}'
```

This keeps the Office page showing who's working on what without requiring each team member to set anything up.
