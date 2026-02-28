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
