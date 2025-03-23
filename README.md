# 🃏 Planning Poker App

A real-time planning poker app for Agile teams to estimate story sizes using Fibonacci cards.

## 🚀 Features

- Live vote casting via Socket.IO
- Roles: Facilitator, Developer, QA, Observer
- Dark/light mode toggle with saved preference
- Facilitator controls: Reveal, Reset, Next Round, Remove Users
- Voting history panel
- User list with roles, icons, and vote status
- Responsive mobile-friendly layout

## 🧱 Tech Stack

- Node.js + Express
- EJS for templating
- Socket.IO for real-time communication
- HTML, CSS (vanilla), JavaScript

## 📁 Project Structure

```
planning-poker-app/
├── public/
│   ├── script.js       # Frontend logic for room
│   ├── lobby.js        # Lobby logic
│   └── styles.css      # Styling (dark mode, layout)
├── views/
│   ├── index.ejs       # Lobby page
│   ├── room.ejs        # Room voting page
│   └── partials/
│       └── header.ejs  # Shared layout
├── server.js           # Backend with Express + Socket.IO
├── package.json
```

## ▶️ Running Locally

1. **Install dependencies**  
```bash
npm install
```

2. **Start the server**  
```bash
npm start
```

3. **Visit the app**  
Open [http://localhost:3000](http://localhost:3000)

## 🧑‍💻 Roles

| Role        | Can Vote | Can Manage Room |
|-------------|----------|-----------------|
| Facilitator | ✅       | ✅              |
| Developer   | ✅       | ❌              |
| QA          | ✅       | ❌              |
| Observer    | ❌       | ❌              |

## 🌍 Deployment Tips

You can deploy this app using:

- [Railway](https://railway.app)
- [Render](https://render.com)
- [Heroku](https://heroku.com)

### Railway Quick Start

1. Push your project to GitHub
2. Go to Railway → New Project → Deploy from GitHub
3. Set:
   - **Install Command:** `npm install`
   - **Start Command:** `npm start`

It will auto-detect the port and deploy.

## 📄 License

MIT License

---

Made with ❤️ for planning better sprints.
