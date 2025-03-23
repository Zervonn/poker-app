# ✅ To-Do List

Short-term development checklist to track current progress.

---

## 🔌 Database Work
- [ ] Refactor `join-room` socket event to use DB
- [ ] Create `models/rooms.js` and `models/users.js`
- [ ] Store each vote in `votes` table
- [ ] Track rounds using the `rounds` table
- [ ] Replace in-memory vote history with DB queries

---

## 🧱 Refactors & Cleanup
- [ ] Remove old `votes = {}` and `usersInRooms = {}` logic
- [ ] Adjust client-side code to reflect DB changes
- [ ] Add error handling for invalid or missing rooms

---

## 🧪 Optional Dev Tasks
- [ ] Convert `init-tables.js` to reusable seed/migration script
- [ ] Set up a dev-only `.env.example` for onboarding others

---

## 📝 Additions to Document
- [ ] Update README with DB integration info
- [ ] Add examples of DB schema to documentation
