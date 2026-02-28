#!/bin/bash
# Mission Control Status Hook
# Add to each team member's Claude Code hooks to auto-report status

CONVEX_URL="${CONVEX_URL:-https://reminiscent-pigeon-507.convex.cloud}"
AGENT_NAME="${AGENT_NAME:-Unknown}"

# Called when Claude starts a task
report_working() {
  local task="$1"
  curl -s "$CONVEX_URL/api/mutation" -H "Content-Type: application/json" \
    -d "{\"path\": \"agents:updateStatusByName\", \"args\": {\"name\": \"$AGENT_NAME\", \"status\": \"working\", \"currentTask\": \"$task\"}, \"format\": \"json\"}" > /dev/null
}

# Called when Claude finishes
report_idle() {
  curl -s "$CONVEX_URL/api/mutation" -H "Content-Type: application/json" \
    -d "{\"path\": \"agents:updateStatusByName\", \"args\": {\"name\": \"$AGENT_NAME\", \"status\": \"idle\"}, \"format\": \"json\"}" > /dev/null
}

# Export for use
export -f report_working
export -f report_idle
