# Mission Control High-Impact Features Implementation Plan

## Phase 1: Email Drafts Queue (High Priority)
**Goal:** See all email drafts Q created, approve/edit/send directly from MC

### Tasks:
- [ ] Create `drafts` table in Convex schema
- [ ] Create `drafts.ts` Convex functions (list, create, update, markSent, remove)
- [ ] Create `/drafts` page with draft list
- [ ] Show draft content, recipient, subject in expandable cards
- [ ] Add "Approve & Send" button (calls Gmail API via route)
- [ ] Add "Edit" modal for tweaking drafts
- [ ] Add badge count to sidebar

---

## Phase 2: Quick Actions Dashboard Widget
**Goal:** One-click common operations from main dashboard

### Tasks:
- [ ] Create QuickActions component
- [ ] Actions to include:
  - "Check my inbox" → triggers email scan
  - "What's on my calendar?" → shows today's events  
  - "Create task" → quick task modal
  - "Ask Q" → text input that creates a question
- [ ] Add to dashboard above activity feed

---

## Phase 3: Global Search
**Goal:** Search across all entities from one place

### Tasks:
- [ ] Create search input in sidebar header
- [ ] Create `search:global` Convex query that searches:
  - Tasks (title, description)
  - People (name, company, notes)
  - Memories (title, content)
  - Decisions (title, description)
- [ ] Show results in dropdown with entity type badges
- [ ] Click to navigate to entity

---

## Phase 4: Live Google Calendar Integration
**Goal:** Show real calendar events, not just MC events

### Tasks:
- [ ] Enhance `/api/calendar` route to fetch from Google
- [ ] Create CalendarWidget component for dashboard
- [ ] Show today's meetings with times
- [ ] Add "Upcoming meetings" section
- [ ] Click to open in Google Calendar

---

## Phase 5: PWA & Notifications
**Goal:** Install as app, get push notifications

### Tasks:
- [ ] Add manifest.json for PWA
- [ ] Add service worker
- [ ] Request notification permissions
- [ ] Send browser notifications for:
  - New approvals pending
  - Urgent questions
  - Upcoming calendar events

---

## Implementation Order

1. **Email Drafts Queue** - Directly actionable, high value
2. **Quick Actions** - Improves daily workflow
3. **Global Search** - Makes everything findable
4. **Calendar Integration** - Real data > placeholder data
5. **PWA/Notifications** - Nice to have, lower priority

## Deployment

- Push to GitHub after each phase
- Replit auto-deploys from main branch
