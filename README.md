# the-movie-site
An app to discover movies, series and characters.


## Key Features

*   **AI-Powered Search:** Go beyond simple text search. Ask for movies in natural language!
    *   *""A mind-bending sci-fi movie like Inception but with a romantic subplot.""*
    *   *""A funny, light-hearted detective series set in the 90s.""*
    *   *""Visually stunning animated films that are not for kids.""*
    *   **Note:** To manage API costs and ensure fair usage, the AI search feature is currently rate-limited to **15 requests per user, per day**.

*   **Content-Based Recommendations:** Get suggestions tailored to your taste. The system analyzes the genres and keywords of movies you've liked and saved to recommend similar content.
*   **Watchlist & Favorites:** Keep track of what you want to watch and what you love. Your interactions directly fuel the recommendation engine.
*   **Comprehensive Media Details:** View detailed information for every movie, series, and person, including cast, crew, trailers, and ratings, all sourced from TMDB.
*   **Standard Search & Discovery:** Browse popular, top-rated, and trending content, or perform a classic search for any movie, series, or person.
*   **Dark/Light Mode:** Switch between themes for your viewing comfort.

---

## 🎥 Demo


![Demo GIF](https://raw.githubusercontent.com/bassemsaeed/the-movie-site/main/assets/demo.gif)



## How It Works

The application's intelligence is driven by two custom systems:

### 1. The AI-Powered Search (Gemini + TMDB Pipeline)

This is a multi-step process designed to turn a vague user idea into a precise list of movies.

1.  **User Prompt:** The user's natural language query (e.g., "dark comedy about a dysfunctional family") is sent to the backend.
2.  **Initial Keyword Extraction (Gemini Step 1):** The backend first asks the Gemini API to extract potential movie-related keywords from the prompt.
3.  **Keyword Verification (TMDB):** The extracted keywords (e.g., "dark comedy", "family") are then searched against the TMDB API to verify their existence and retrieve their official IDs. This step grounds the AI's output in real-world data.
4.  **Intelligent Query Generation (Gemini Step 2):** The verified keywords, their IDs, the original user prompt, and a full list of TMDB genres are sent back to Gemini. In this second, more informed request, Gemini is tasked with creating a structured JSON object containing the most likely genres and keywords for the user's request.
5.  **Targeted Discovery (TMDB):** The final JSON from Gemini is used to build a precise query for TMDB's `/discover` endpoint, filtering by the identified genres and keywords.
6.  **Display Results:** The highly relevant results from TMDB are sent to the frontend and displayed to the user.

### 2. The Content-Based Recommendation System

1.  **Data Collection:** The system gathers all movies/series a user has added to their "Liked" and "Saved" lists.
2.  **Feature Extraction:** It processes this data to find the most frequently occurring **genres** and **keywords**.
3.  **Recommendation Generation:** It queries the TMDB API for other titles that match the user's top genres and keywords, while filtering out anything the user has already interacted with.
4.  **Display Suggestions:** These new, relevant suggestions are presented to the user.




## Tech Stack

- React, React Router and Tailwind css for frontend.
- Express js for backend
- Gemini Ai models
- Backend Deployment on AWS EC2
- Frontend On Vercel



## Getting Started

Follow these instructions to get a copy of the project up and running on your local machine for development and testing purposes.

### Installation

1.  **Clone the repository:**
    ```bash
    git clone https://github.com/bassemsaeed/the-movie-site.git
    cd [the-movie-site]
    ```

2.  **Set up the Backend:**
    ```bash
    cd backend
    npm install
    ```

3.  **Set up the Frontend:**
    ```bash
    cd ../frontend
    npm install
    ```

4.  **Environment Variables:**
    You will need to create a `.env` file in the `backend` directory. Get your API keys from the respective services.
   ```ini

    # TMDB API Key (v3 Auth)
    TMDB_API_KEY="your_tmdb_api_key"

    # Google Gemini API Key
    GEMINI_API_KEY="your_google_ai_studio_key"

    
    ```
   
    
### Running the Application

1.  **Start the backend server:**
    ```bash
    cd backend
    npm run dev
    ```

2.  **Start the frontend development server:**
    ```bash
    cd frontend
    npm run dev
    ```

3.  Open your browser and navigate to `http://localhost:5173` (or your frontend's default port).



## License

This project is licensed under the MIT License.





