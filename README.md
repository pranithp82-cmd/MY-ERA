# ERA — Daily Habits, Trading & Gym Tracker

A dark-mode, mobile-first web application & PWA designed for high performance and daily discipline across three essential domains:
1. **Lifestyle**: Daily habits checklist with expandable month calendar & completion metrics.
2. **Trading**: Trade execution logger, journal entries, lot-size & risk calculator, and performance summary.
3. **Gym**: Workout notepad for sets, reps, and exercise logs with date-based filtering.

---

## Features
- **PWA (Progressive Web App)**: Installable on Android, iOS Safari, macOS, and Windows with 1-click.
- **Firebase Cloud Sync**: Real-time cross-device synchronization using Cloud Firestore.
- **Multi-Device Authentication**: Google Sign-In and Mobile Phone Number + SMS OTP login with persistent sessions.
- **High-Resolution Card Reports**: In-browser report generation with Save as PNG, Copy to Clipboard, and fullscreen view.
- **Offline First**: Fully functional even without an internet connection using local storage.

---

## Tech Stack
- HTML5, CSS3 (Vanilla + Tailwind runtime engine)
- Vanilla JavaScript (Zero build step, high performance)
- Firebase v10 Compat (Auth & Cloud Firestore)
- HTML5 Canvas Report Generation Engine
- Progressive Web App Manifest & Service Worker

---

## How to Run Locally
Simply open `index.html` in any browser or start a local server:
```bash
python -m http.server 8080
```
Then visit `http://localhost:8080/index.html`.
