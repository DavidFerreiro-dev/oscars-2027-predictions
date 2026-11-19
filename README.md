# OSCARS 2027 — Predictions

<p align="center">
  <img src="./media/oscars.png" alt="OSCARS 2027 logo" width="420">
</p>

<p align="center">
  <strong>An independent, mobile-first Oscar prediction ballot for the 99th Academy Awards.</strong>
</p>

<p align="center">
  <a href="https://github.com/DavidFerreiro-dev">GitHub</a>
  ·
  <a href="#features">Features</a>
  ·
  <a href="#getting-started">Getting Started</a>
  ·
  <a href="#credits">Credits</a>
</p>

---

## Features

- Build predictions across all 14 categories
- Rank nominees from favorite to alternate
- Search movies and people through TMDB
- Automatically fill an actor's character name
- Save predictions locally in the browser
- Copy the complete ballot as text
- Download the ballot as JPG or PNG
- Export only Major categories or every category
- Responsive desktop and mobile interface

## Getting Started

### Requirements

- Node.js 20 or later
- npm
- A TMDB API Read Access Token (v4)

### Installation

```bash
git clone https://github.com/DavidFerreiro-dev/oscars-2027-predictions.git
cd oscars-2027-predictions
npm install
```

Create a local `.env` file or add `VITE_TMDB_ACCESS_TOKEN` in your deployment platform:

```env
VITE_TMDB_ACCESS_TOKEN=YOUR_TMDB_READ_ACCESS_TOKEN
```

On Netlify, add the variable under **Project configuration → Environment variables**.

The shared `src/tmdb.config.js` file contains no token; it reads the value from Vite environment variables.

### Run

```bash
npm run dev
```

The app is available at `http://localhost:5173`.

### Build

```bash
npm run build
npm run preview
```

## Security

Never commit `.env` or real TMDB credentials. Both `.env` and `.env.local` are ignored by Git. Client-side applications cannot keep API tokens completely private: the value is delivered to the browser. For stronger protection, move TMDB requests behind a server-side proxy and store the token only on the server.

## Recommended Repository Name

**`oscars-2027-predictions`**

It clearly describes the application, release year and purpose.

## Credits

Made with love by [David Ferreiro](https://github.com/DavidFerreiro-dev).

- Designed and developed by **David Ferreiro**
- Movie and person data provided by [TMDB](https://www.themoviedb.org/)
- This project is an independent fan project
- Not affiliated with, endorsed by, or sponsored by the Academy of Motion Picture Arts and Sciences

The OSCARS name and related marks belong to their respective owners. OSCARS and Academy Awards references are used only for identification and fan-content purposes.

## License

This project is licensed under the [MIT License](./LICENSE).
