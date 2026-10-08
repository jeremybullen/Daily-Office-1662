# 1662 Daily Office

[![TypeScript](https://img.shields.io/badge/TypeScript-5.8-blue.svg)](https://www.typescriptlang.org/)
[![React](https://img.shields.io/badge/React-19.0-61dafb.svg)](https://react.dev/)
[![Vite](https://img.shields.io/badge/Vite-6.2-646cff.svg)](https://vitejs.dev/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-4.1-38bdf8.svg)](https://tailwindcss.com/)
[![License](https://img.shields.io/badge/License-MIT-green.svg)](LICENSE)

A beautifully crafted, private reading and listening experience for the historic **1662 Book of Common Prayer (BCP)** Daily Office (Morning Prayer and Evening Prayer).

Designed with sacred typographic discipline, liturgical reverence, and modern audio-visual synchronization.

---

## ✨ Highlights & Features

### 📖 Historic Liturgy & Lectionary
- **Morning & Evening Prayer**: Complete liturgical orders following the classic 1662 Book of Common Prayer.
- **1662 Lectionary**: Faithfully provides the appointed Old Testament First Lessons, New Testament Second Lessons, and the traditional 30-day monthly Psalter.
- **Americanized Rubrics**: Includes customary state prayers and rubric adaptations according to the Sparks & Long standard for American usage.
- **ESV Scripture Integration**: Full-text Scripture lessons fetched and rendered cleanly with verse numbers, with support for Apocrypha passages.
- **Canticle Alternatives**: Includes traditional canticles for both offices (Venite, Te Deum Laudamus, Benedicite, Benedictus, Jubilate Deo, Magnificat, Cantate Domino, Nunc Dimittis, Deus Misereatur).

### 🎙️ Immersive Audio Experience
- **Pre-recorded Choral & Spoken Tracks**: Built-in support for authentic Anglican chant, plainchant, and spoken prayers for the invariant liturgical texts (Canticles, Versicles, *Gloria Patri*, Suffrages, Creeds, Collects).
- **Karaoke-Style Text Synchronization**: Highlights verses, responses, and prayers in real-time as the audio plays.
- **Continuous Liturgical Playback**: Sequentially advances through the entire Office from the Opening Sentences to The Grace without manual intervention.
- **ESV Narrated Scripture Audio**: High-fidelity narration for daily lessons and Psalms via Crossway ESV audio streaming with seekable audio range support.
- **Intelligent Speech Synthesis Fallback**: When pre-recorded audio is not present for a section, the app seamlessly falls back to browser Speech Synthesis with distinct Minister and People voices.
- **Sheet Music Visualizer**: View authentic Anglican chant pointing and sheet music settings alongside canticles.

### 🎨 Sacred Typography & Aesthetics
- **Classic Print Book Feel**: Set in **EB Garamond** with rubric styling (traditional red accents, illuminated drop caps, and liturgical italic cues).
- **Light & Dark Modes**: Carefully tuned color palettes honoring traditional prayer book paper tones and dark mode readability.
- **Distraction-Free**: Minimal chrome with auto-hiding header and clean section dividers.

### 🔒 Private & Local
- **No Tracking or Telemetry**: Your prayer life is strictly personal.
- **Local Progress Tracking**: Mark Morning and Evening offices as completed with data stored locally on your device in `localStorage`.
- **Liturgical Calendar**: Seamlessly browse readings for any day of the year, past or future.

---

## 🛠️ Tech Stack

- **Frontend**: [React 19](https://react.dev/), [TypeScript](https://www.typescriptlang.org/), [Vite](https://vitejs.dev/)
- **Styling**: [Tailwind CSS v4](https://tailwindcss.com/)
- **Animation**: [Motion](https://motion.dev/)
- **Icons**: [Lucide React](https://lucide.dev/)
- **Backend**: [Express](https://expressjs.com/) on Node.js (proxies Bible text and audio streams with HTTP range seeking)

---

## 🚀 Getting Started

### Prerequisites

- [Node.js](https://nodejs.org/) (version 20 or later recommended)
- [npm](https://www.npmjs.com/) or [bun](https://bun.sh/)

### Installation

1. **Clone the repository**:
   ```bash
   git clone https://github.com/your-username/1662-daily-office.git
   cd 1662-daily-office
   ```

2. **Install dependencies**:
   ```bash
   npm install
   ```

3. **Configure Environment Variables** (Optional):
   Copy `.env.example` to `.env`:
   ```bash
   cp .env.example .env
   ```

   | Variable | Description |
   | :--- | :--- |
   | `ESV_API_KEY` | *(Optional)* API key from [Crossway ESV API](https://api.esv.org/account/create-application/) for professional narrated passage audio. |
   | `APP_URL` | Host URL for self-referential links and static assets. |
   | `PORT` | Local server port (defaults to `3000`). |

4. **Start the development server**:
   ```bash
   npm run dev
   ```
   Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## 📦 Building for Production

To create an optimized production build:

```bash
npm run build
```

To run the full-stack server serving the production build:

```bash
npm start
```

---

## 🎵 Customizing Liturgical Audio

The application supports pre-recorded audio files placed in `public/audio/`. The player automatically recognizes matching tracks and seamlessly integrates them into the office sequence:

```
public/audio/
├── canticles/
│   ├── venite.mp3
│   ├── te-deum.mp3
│   ├── benedicite.mp3
│   ├── benedictus.mp3
│   ├── jubilate.mp3
│   ├── magnificat.mp3
│   └── nunc-dimittis.mp3
├── general/
│   ├── confession.mp3
│   ├── absolution.mp3
│   ├── lords-prayer.mp3
│   ├── versicles.mp3
│   ├── lesser-litany.mp3
│   ├── suffrages.mp3
│   ├── st-chrysostom.mp3
│   └── the-grace.mp3
├── morning/
│   ├── collect-peace.mp3
│   └── collect-grace.mp3
├── evening/
│   ├── collect-peace.mp3
│   └── collect-aid.mp3
└── creeds/
    └── apostles-creed.mp3
```

Refer to [`public/audio/README.md`](public/audio/README.md) for details on naming conventions and hybrid playback settings.

---

## 📚 Liturgical Sources & Attributions

- **Book of Common Prayer (1662)**: Texts of the Order for Morning and Evening Prayer according to the Church of England.
- **American Use**: Adapted for use in the United States following the rubrics published by *Sparks & Long*.
- **Lectionary**: 1662 Daily Office Lectionary table of lessons.
- **Scripture**: Scripture quotations are from the **ESV® Bible** (The Holy Bible, English Standard Version®), copyright © 2001 by Crossway, a publishing ministry of Good News Publishers. Used by permission. All rights reserved.

---

## 📄 License

This project is licensed under the [MIT License](LICENSE).
