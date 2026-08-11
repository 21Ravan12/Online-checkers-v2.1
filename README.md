# ♟️ Online Checkers v2.1 — *Classic but Rock-Solid*

> **Age:** A few seasons old · **Status:** Still kicking butt! ✅

This is **Version 2.1** of my turn-based online checkers project.  
It may not be the *newest* kid on the block, but it's **fully functional**, **well-tested**, and **ready to play** — both offline and online with friends.

Think of it as that reliable arcade machine in the corner — old-school charm, but it *works every single time*. 🎮

---

## 🧠 What This Project Does

- **👥 Online Multiplayer** — Play checkers with a friend over the internet using WebSockets for real-time sync.
- **📜 Game History** — Rewind and fast-forward through moves in offline mode. Analyze your strategy like a chess grandmaster!
- **🔐 User Authentication** — Secure signup/login with JWT tokens and email verification.
- **📦 Persistent Storage** — Games and user data stored in PostgreSQL.
- **📱 Responsive UI** — Works on desktop and mobile (yes, we have a `mobile.html` too!).

---

## 🏗️ Tech Stack (The "Vintage but Valid" Combo)

| Layer | Technology |
|-------|------------|
| **Frontend** | Vanilla HTML/CSS/JS (no frameworks, just pure DOM love ❤️) |
| **Backend API** | Java + Spring Boot (RESTful controllers) |
| **Real-time** | Node.js + WebSockets (`socketServer.js`) |
| **Database** | PostgreSQL |
| **Auth** | JWT + Spring Security + Email verification |
| **Build Tool** | Maven |
| **Version Control** | Git |

---

## 📁 Project Structure (Simplified)

```
Online-checkers-v2.1/
├── CheckerServer/          # Java Spring Boot backend
│   ├── src/main/java/...   # Controllers, services, models, security
│   └── pom.xml             # Maven dependencies
├── public/                 # Frontend static files
│   ├── index.html          # Desktop UI
│   ├── mobile.html         # Mobile-friendly UI
│   ├── assets/styles/      # CSS files
│   └── js/                 # All client-side logic (routing, board, socket)
├── socketServer.js         # WebSocket server for real-time moves
├── package.json            # Node.js dependencies
└── README.md               # You are here 🥰
```

---

## 🚀 How to Run It (Yes, it still works!)

### 1. Clone the repo
```bash
git clone <repository-url>
cd Online-checkers-v2.1
```

### 2. Set up the database
- Create a PostgreSQL database (e.g., `checkers_db`)
- Update `CheckerServer/src/main/resources/application.properties` with your DB credentials

### 3. Run the Spring Boot backend
```bash
cd CheckerServer
./mvnw spring-boot:run   # or mvn spring-boot:run
```
The API will start at `http://localhost:8080`

### 4. Start the WebSocket server
```bash
npm install   # if not already done
node socketServer.js
```
This handles real-time game events (moves, turn sync, etc.)

### 5. Open the frontend
- Open `public/index.html` in your browser (or serve it with any static server)
- For mobile: `public/mobile.html`

---

## 🎮 Gameplay Features

- **Register / Login** with email verification
- **Create or join online games** with other users
- **Real-time move sync** via WebSockets
- **Offline mode** with full move history (rewind/fast-forward)
- **Auto-turn switching** and win/draw detection
- **Responsive design** — play on your phone or desktop!

---

## 🧪 Current State

✅ All core features are **fully operational**  
✅ No critical bugs (we've squashed 'em all)  
✅ Database queries are optimized  
✅ Authentication flow is secure  

> ⚠️ *This project is considered "feature-complete" for its version. I'm not actively adding new features, but it's **production-ready** for casual play or as a learning reference.*

---

## 🔮 What We'd Add (If Time Were Infinite)

- Matchmaking system with ELO ratings
- Animated piece captures and smoother transitions
- Save/load game state to continue later
- Spectator mode for ongoing matches

---

## 🤝 Contributing

This project is mostly in *maintenance mode*, but if you spot a bug or have a cool idea:

1. Fork the repo  
2. Create a branch (`git checkout -b feature/amazing-idea`)  
3. Commit your changes  
4. Open a Pull Request  

We'll review it with love! 💖

---

## 📄 License

MIT — feel free to use, learn from, or remix this project.

---

## 🙌 Final Words

This project was built with a lot of ☕ coffee, 🧠 brainpower, and ❤️ passion.  
It's not the newest, but it's **honest work** — and it *works*.  
If you're here to learn or play, welcome! And if you beat me in a match... *I'll pretend the lag got me* 😉

---

**Enjoy the game!**  
— Your Friendly Dev 🥰
