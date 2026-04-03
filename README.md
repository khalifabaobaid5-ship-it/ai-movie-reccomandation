# CineAI — AI-Powered Movie Recommendation System

CineAI is a personalized movie discovery and tracking platform built with React, Tailwind CSS, and the [OMDB API](https://www.omdbapi.com/). It helps users find, rate, and track movies while receiving tailored recommendations based on their taste.

---

## Features

### 🔐 Login & Profile Setup
- Users create a profile by entering a username and selecting their favorite genres (Action, Comedy, Drama, Horror, Sci-Fi, Romance, Thriller, Animation, Documentary, Adventure).
- Profile data persists locally via `localStorage`.

### 🎬 AI-Powered Recommendations
- The home page generates **4–5 personalized movie recommendations** based on the user's selected favorite genres.
- Recommendations are fetched dynamically from the OMDB database and refreshed on each visit.

### 🔍 Movie Search
- Full-text search powered by the OMDB API — search any movie by title.
- Results display: **title, year, poster image, and user rating** (if rated).
- **Filtering options**:
  - All results
  - Rated by me
  - Not yet rated
  - High rated (7+)

### 🎥 Movie Detail Pages
Each movie page displays comprehensive information:

| Field          | Description                              |
|----------------|------------------------------------------|
| **Title**      | Full movie title                         |
| **Year**       | Release year                             |
| **Genre**      | All associated genres                    |
| **Runtime**    | Movie duration                           |
| **Rating**     | MPAA rating (PG, R, etc.)               |
| **IMDb Score**  | Official IMDb rating out of 10          |
| **Director**   | Film director                            |
| **Cast**       | Lead actors                              |
| **Plot**       | Full plot synopsis                       |
| **Poster**     | Official movie poster image              |
| **Google Link** | Direct link to search the movie on Google |

Additionally, each detail page shows **4 similar movies** based on the film's primary genre.

### ⭐ Movie Rating System
- **1–10 star rating** with interactive click-to-rate UI.
- Optional **text review** for each rated movie.
- Ratings are saved to the user profile and visible across the app (search results, history, ratings page).

### 📜 Watch History
- Movies are **automatically added to watch history** when a user views a movie's detail page.
- History displays: title, poster, genre, year, and timestamp.
- Sorted by most recently watched.

### 📊 Ratings Dashboard
- Dedicated page listing all movies the user has rated.
- Each entry shows: poster, title, year, star score, written review, and date rated.
- Quick links back to movie detail pages.

### 🧭 Navigation
- Persistent top navigation bar with links to:
  - **Home** (recommendations)
  - **Search**
  - **History**
  - **Ratings**
- Displays the logged-in username and a logout button.

---

## Tech Stack

| Technology        | Purpose                        |
|-------------------|--------------------------------|
| React 18          | UI framework                   |
| TypeScript        | Type safety                    |
| Tailwind CSS v3   | Styling & design system        |
| Vite 5            | Build tool & dev server        |
| React Router v6   | Client-side routing            |
| TanStack Query    | Async state management         |
| OMDB API          | Movie database & search        |
| localStorage      | User data persistence          |
| Lucide React      | Icon library                   |
| shadcn/ui         | Reusable UI components         |
| Sonner            | Toast notifications            |

---

## API

This project uses the [OMDB API](https://www.omdbapi.com/) for all movie data.

- **Search**: `GET /?s={query}&apikey=KEY`
- **Details**: `GET /?i={imdbID}&apikey=KEY&plot=full`

---

## Data Model

### User Profile (stored in localStorage)

```json
{
  "username": "john",
  "favoriteGenres": ["Action", "Sci-Fi"],
  "ratings": {
    "tt1234567": {
      "imdbID": "tt1234567",
      "score": 8,
      "review": "Great movie!",
      "date": "2026-04-03T12:00:00.000Z"
    }
  },
  "watchHistory": [
    {
      "imdbID": "tt1234567",
      "title": "Example Movie",
      "poster": "https://...",
      "genre": "Action",
      "year": "2024",
      "watchedAt": "2026-04-03T12:00:00.000Z"
    }
  ]
}
```

---

## Getting Started

1. Clone the repository
2. Install dependencies: `npm install`
3. Start the dev server: `npm run dev`
4. Open `http://localhost:5173` in your browser
5. Create a profile and start discovering movies!
