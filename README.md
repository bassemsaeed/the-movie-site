# the-movie-site

A web application to browse and discover movies, TV series, and characters.

## Features

* **AI Search:** Enter natural-language queries to find content (for example, "mind-bending sci-fi with a romantic subplot").

  * Rate-limited to 15 AI searches per user per day.
* **Personalized Recommendations:** Suggestions based on the genres and keywords of titles you like or save.
* **Watchlist & Favorites:** Track titles you plan to watch and mark favorites to improve recommendations.
* **Media Details:** View cast, crew, trailers, ratings, and more from TMDB.
* **Classic Discovery:** Browse popular, top-rated, and trending titles or search directly for any movie, series, or person.
* **Theme Toggle:** Switch between light and dark modes.


## How It Works

### AI Search Pipeline

1. **User Query:** A natural-language prompt is sent to the backend.
2. **Keyword Extraction:** Gemini API extracts potential movie-related keywords.
3. **Keyword Verification:** Extracted keywords are looked up in TMDB to obtain official IDs.
4. **Structured Query Generation:** Gemini receives verified keywords, their IDs, the original prompt, and TMDB genre data to generate a JSON query.
5. **Content Discovery:** The JSON query powers TMDB’s `/discover` endpoint.
6. **Result Display:** Relevant titles are returned and shown to the user.

### Recommendation Engine

1. **Data Collection:** The app collects movies and series you have liked or saved.
2. **Feature Extraction:** It identifies your top genres and keywords.
3. **Query TMDB:** It searches TMDB for titles matching those features, excluding items you’ve already viewed.
4. **Display Suggestions:** New, relevant recommendations are presented.

## Technology Stack

* **Frontend:** React, React Router, Tailwind CSS
* **Backend:** Node.js, Express.js
* **AI Models:** Google Gemini
* **Hosting:** AWS EC2 (backend), Vercel (frontend)

## Setup and Installation

1. **Clone the repository:**

   ```bash
   git clone https://github.com/bassemsaeed/the-movie-site.git
   cd the-movie-site
   ```
2. **Install backend dependencies:**

   ```bash
   cd backend
   npm install
   ```
3. **Install frontend dependencies:**

   ```bash
   cd ../frontend
   npm install
   ```
4. **Configure environment variables:**
   Create a `.env` file in the `backend` directory with:

   ```ini
   TMDB_API_KEY=your_tmdb_api_key
   GEMINI_API_KEY=your_google_ai_key
   ```
5. **Run the application:**

   ```bash
   # Start backend
   cd backend && npm run dev

   # Start frontend
   cd ../frontend && npm run dev
   ```
6. **Access the app:**
   Open [http://localhost:5173](http://localhost:5173) in your browser.

## License

This project is licensed under the MIT License.
