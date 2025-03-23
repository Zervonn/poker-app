# 🧭 Project Roadmap – Planning Poker App

This file outlines the major phases and milestones for building and enhancing the Planning Poker web app.

---

## ✅ Phase 1: MVP Features (Complete)
- Real-time voting with WebSockets
- Roles: Facilitator, Developer, QA, Observer
- Responsive design and mobile layout
- Dark/Light mode toggle
- Live user list with role icons and voting status
- Facilitator controls (reveal, reset, next round)
- Vote history per room

---

## 🔄 Phase 2: Database Integration (In Progress)
- PostgreSQL setup and connection via `pg` and `.env`
- Room and user creation stored in DB
- Save vote history and round data to DB
- Fetch user list and vote data from DB (not memory)
- Ensure persistence between sessions/server restarts

---

## 🧪 Phase 3: Session Enhancements
- Timer per round with auto-reveal option
- Room-level chat sidebar
- Export results to CSV or clipboard
- Card deck customization (e.g., Fibonacci, T-shirt sizes)

---

## 🚀 Phase 4: Stretch Goals
- Authentication & login system
- Admin dashboard to view/report session metrics
- Invite links with permissions
- Cloud functions for cleanup, analytics, alerts

---

_Updated: March 2025_
