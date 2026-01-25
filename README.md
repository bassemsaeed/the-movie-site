# the-movie-site

A web application to browse and discover movies, TV series, and characters — now fully **vector-powered** using semantic embeddings for search and personalization.

---

## TL;DR

* The site stores TMDB items with semantic embeddings (Gemini Embedding) in Postgres using `pgvector`.
* **No login required:** Personalized "For You" recommendations are computed on-the-fly based on your **local browser history**.
* The backend calculates an "interest vector" (average of items you liked locally) and runs a nearest-neighbor search to find similar content.
* **You must provide a ready DB with item embeddings** (see Database & Embeddings section).

---

## Features

* **AI Search (natural language):** Search with normal-language prompts (e.g., `"mind-bending sci-fi with a romantic subplot"`).  
  * Rate-limited to **15 AI searches per day** (IP-based).
* **Vector-Powered Recommendations:** Personalized results using semantic embeddings based on your local history.
* **Local Watchlist & Favorites:** Track what you want to watch using Local Storage (no account needed).
* **Media Details:** Cast, crew, trailers, ratings from TMDB.
* **Classic Discovery:** Popular, top-rated, trending lists plus keyword/genre discovery.
* **Theme Toggle:** Light / dark mode.

---

## Demo

![Project Demo](https://github.com/bassemsaeed/the-movie-site/raw/main/assets/demo.gif)

---

## How It Works

### AI Search & Embedding Flow
1. **User Query:** User types a natural-language prompt.  
2. **Embedding / Keyword Extraction:** The prompt is embedded (or parsed) with the embedding/LLM model (e.g., `gemini-embedding-001`) and keywords are optionally extracted and verified against TMDB.  
3. **Retrieve:** For direct semantic search, compute query embedding → nearest-neighbor search over `movies.embedding`. For structured discovery, translate to TMDB `/discover` params.  
4. **Display:** Results are shown to the user with standard metadata.

### Recommendation Engine (Session-based)
* **Item embeddings** (movies/series) live in Postgres (`pgvector`).  
* **Interest Vector:** When a user visits "For You", the frontend sends a list of Movie IDs found in Local Storage (liked/watched items).
* **Compute:** The backend fetches the embeddings for those specific IDs and calculates a centroid (average vector).
* **Search:** A nearest-neighbor query is run using that centroid to fetch candidate items similar to what the user likes.
* **Blend & Rerank:** Results are blended with popularity/rating signals and diversified using MMR.

---

## Database & Embeddings (REQUIRED)

> This project **requires** a populated Postgres database containing TMDB items **and** their embedding vectors. The app expects `vector(768)` embeddings in the `movies` table.

### Schema used by this project (Python / `psycopg` snippet)

```python
import psycopg
from psycopg import register_vector

conn = psycopg.connect(DB_CONN, autocommit=True)
conn.execute("CREATE EXTENSION IF NOT EXISTS vector")
register_vector(conn)

conn.execute("""
    CREATE TABLE IF NOT EXISTS movies (
        id BIGINT PRIMARY KEY,
        title TEXT,
        media_type TEXT,
        poster_path TEXT,
        release_date TEXT,
        overview TEXT,
        embedding vector(768)
    )
""")
```

### Index (create AFTER bulk load)

```sql
-- run in psql or via a DB client after you bulk-import embeddings
CREATE EXTENSION IF NOT EXISTS vector;

-- Example ivfflat index for cosine similarity. Build after bulk insert for best perf.
CREATE INDEX ON movies USING ivfflat (embedding vector_cosine_ops) WITH (lists = 100);

-- For larger production datasets, consider HNSW:
-- CREATE INDEX ON movies USING hnsw (embedding vector_cosine_ops) WITH (m=16, ef_construction=200);
```

### Importing embeddings

You must import both metadata and embedding arrays. Options:

* `COPY` CSV with vector arrays (e.g., `"{0.001,0.23,...}"`) into `movies`.
* Or write an import script (Python/Node) that inserts rows with parameterized queries (recommended).

**Important:** The `vector(768)` dimension must match the dimension produced by your embedding model.

---

## Example: Generate embeddings (outline)

1. Choose embedding model (e.g., `gemini-embedding-001`).
2. For each TMDB item, create an embedding from the title + overview (or a chosen prompt).
3. Save embeddings in a JSON/CSV suitable for import or directly insert with a script.
4. After bulk load, create vector index.

*(Scripts are not included here — ask if you want a ready import script.)*

---

## Quick example: Interest vector & nearest-neighbor (conceptual)

**1. Calculate Interest Vector (Backend Logic):**
The frontend sends `[101, 550, 203]` (IDs from local storage).
The backend executes:
```sql
SELECT AVG(embedding) as center_vector FROM movies WHERE id IN (101, 550, 203);
```

**2. Query nearest neighbors:**
Using the resulting `center_vector`:

```sql
-- Find nearest 200 items to the calculated average
SELECT id, title, poster_path, release_date,
       embedding <=> $1 AS cosine_distance
FROM movies
ORDER BY embedding <=> $1
LIMIT 200;
```

Then apply your blend (similarity → score) + MMR + optional LLM rerank in app memory.

---

## Technology Stack

* **Frontend:** React, React Router, Tailwind CSS (uses Local Storage for state)
* **Backend:** Node.js, Express.js (DB schema snippets used psycopg in repo)
* **Database:** Postgres + pgvector (vector(768) in this project)
* **AI Models:** Google Gemini (text + embeddings)
* **Hosting:** AWS EC2 (backend), Vercel (frontend)

---

## Setup & Installation

1. **Clone repo**

```bash
git clone https://github.com/bassemsaeed/the-movie-site.git
cd the-movie-site
```

2. **Prepare Postgres DB (REQUIRED)**

* Provision Postgres and enable `pgvector`.
* Create `movies` table and import metadata + embeddings (embedding dimension = **768**).
* Create vector index **after** bulk import.

3. **Install backend**

```bash
cd backend
npm install
```

4. **Install frontend**

```bash
cd ../frontend
npm install
```

5. **Configure environment (.env in backend)**

```ini
DB_CONN=postgres://user:pass@host:5432/dbname   # used by psycopg / backend
TMDB_API_KEY=your_tmdb_api_key
GEMINI_API_KEY=your_google_ai_key
EMBEDDING_MODEL=gemini-embedding-001
EMBEDDING_DIM=768
AI_SEARCH_RATE_LIMIT=15
```

6. **Run dev**

```bash
# backend
cd backend && npm run dev

# frontend
cd ../frontend && npm run dev
```

7. **Open**
   Visit [http://localhost:5173](http://localhost:5173)

---

## Checklist before running

* ✅ Postgres reachable via `DB_CONN`.
* ✅ `pgvector` extension enabled.
* ✅ `movies` table exists and is populated with `embedding vector(768)`.
* ✅ Vector index created **after** bulk import.
* ✅ `.env` set up with TMDB & Gemini API keys.

If you do not yet have embeddings: generate them with your chosen model (e.g., `gemini-embedding-001`) and import them before starting.

---

## Development notes & tips

* **Blend** vector similarity with popularity/rating for practical results.
* **Diversity:** use MMR to avoid near-duplicate recommendations.
* **Indexing:** create IVFFlat/HNSW index after bulk load; tune `lists`, `m`, and `ef_construction`.
* **Reranking:** use an LLM reranker only for small candidate sets (top 20) to control cost.
* **Monitoring:** track CTR/watch starts and run offline metrics (NDCG, precision@K) for experiments.

---

## License

MIT License
