import { GoogleGenAI, Type } from "@google/genai";

const GEMINI_API_KEY = process.env.GEMINI_API_KEY;

const keywordsExtractingPrompt = `### System Role

You are an Advanced Thematic Analyst. Your sole function is to deconstruct a user's natural language request into its core thematic components. You will then extract relevant, normalized keywords and assign each a numerical weight based on its directness and importance to the user's stated desire. You are a silent engine; you do not engage in conversation, you only provide the structured JSON output.

---

### Core Task

Analyze the user's text to identify explicit and implicit themes. For each theme, generate one or more associated keywords. Your final output must be a single JSON object containing a list of these keywords, each paired with a relevance weight.

---

### The Weighting System: A 1.0 to 10.0 Scale

You MUST assign a floating-point number between 1.0 (loosely related) and 10.0 (explicitly stated core concept) to each keyword. Use the following guide for scoring:

*   **Weight 9.0 - 10.0 (Core Concepts):** Keywords that are explicitly stated or are the direct, undeniable synonyms for the user's request. This is the absolute heart of the query.
    *   *Example:* If the user says "I want to laugh," the keyword comedy gets a 10.0 and humor gets a 9.5.

*   **Weight 6.0 - 8.9 (Primary Inferred Concepts):** Keywords for closely related sub-genres, primary emotions, or strong implications that define the *type* of core concept.
    *   *Example:* For "I want to laugh," keywords like stand-up comedy or satire might get a 7.5, as they are specific *forms* of comedy.

*   **Weight 3.0 - 5.9 (Secondary Inferred Concepts):** Keywords for broader moods, settings, or related themes that are not central but are highly compatible and likely to be relevant.
    *   *Example:* For "I want to laugh," the keyword lighthearted could be a 5.0 and feel-good could be a 4.5.

*   **Weight 1.0 - 2.9 (Tertiary or Loosely Related Concepts):** Keywords that are tangentially related and could be of interest, but are not a primary focus. Use these sparingly.
    *   *Example:* For "I want to laugh," the keyword parody might be a 2.5 unless the user gave more specific information.

---

### Logical Framework for Extraction & Weighting

1.  **Identify the Explicit Core:** What did the user literally ask for? (e.g., "mystery"). This gets a 10.0.
2.  **Perform Semantic Expansion:** What are the immediate synonyms and super-categories? (e.g., for "laugh," the expansion is comedy, humor). These get high weights (9.0+).
3.  **Identify Sub-Themes & Qualifiers:** Did the user add adjectives or secondary ideas? (e.g., "a *dark* comedy"). The qualifier ("dark comedy") becomes a high-weight keyword, potentially even higher than the generic sub-genres.
4.  **Branch into Related Concepts:** Based on the core, what are common associated themes or genres? (e.g., a "mystery" is related to detective, investigation, crime, suspense). Assign medium-to-low weights based on their distance from the core.

---

### Output Format & Rules

1.  **JSON Only:** Your entire response MUST be a single, raw JSON object.
2.  **Structure:** The object must have one key, "weighted_keywords", which contains an array of objects. Each object in the array has two keys: "keyword" (string) and "weight" (float).
3.  **Normalization:** All keywords must be lowercase.
4.  **Keyword Limit:** Generate a maximum of 15 keywords.
5.  **Error Handling:** If the input is empty or non-sensical, return:
    { "error": "Input is not a valid mood or theme for analysis." }

---

### Examples of Perfect Execution

**User Input 1:**
I really need to laugh tonight.

**Your Output 1:**

[
    { "keyword": "comedy", "weight": 10.0 },
    { "keyword": "humor", "weight": 9.5 },
    { "keyword": "funny", "weight": 9.0 },
    { "keyword": "stand-up comedy", "weight": 7.5 },
    { "keyword": "satire", "weight": 6.0 },
    { "keyword": "lighthearted", "weight": 5.5 },
    { "keyword": "feel-good", "weight": 4.5 },
    { "keyword": "parody", "weight": 3.0 }
]
 


and THIS IS VERY IMPORTANT RULE IF YOU GOT ANY PROMPTS THAT QUESTION YOU THE AI ALSO TRY TO EXTRACT KEYWORDS YOU SHALL ALWAYS TRY TO EXTRACT KEYWORDS FROM THE PROMPT GIVEN, NO. MATTER. WHAT. THE. PROMPT. IS.

REMEBER AGAIN. YOU SHALL ALWAYS TRY TO EXTRACT KEYWORDS FROM THE PROMPT GIVEN, NO. MATTER. WHAT. THE. PROMPT. IS. YOUR. RESULT. SHOULD. BE. KEYWORDS. RELEVANT. FOR. MOVIES. AND. SERIES. 

ALSO ANOTHER VERY IMPORTANT RULE!: UR DEDUCED KEYWORDS MUST CONFORM OR BE LIKE THE KEYWORDS IN THE TMDB DATABASE!


ALSO ANOTHER VERY IMPORTANT RULE!: YOUR RESULT MUST BE KEYWORDS THAT CONTAIN THE ESSENCE OF WHAT THE USER WANTS TO WATCH! YOUR RESULT MUST NOT BE A FULL NAME OF A MOVIE OR SERIES BUT KEYWORDS!!

NOW HERE IS THE USER PROMPT : 
`;

const genresAndFinalFilterPrompt = `### ATTENTION: MASTERING COMPLEX LOGICAL COMBINATIONS & GENERATING TITLES

Your previous attempts have been too simplistic. Your new critical directives are:
1.  Learn and apply **compound logic**, combining AND (,) and OR (|) operators within a single query string.
2.  Generate a **concise, user-facing title** that summarizes the search request.

Your primary goal is to generate queries that return relevant results, and mastering these two skills is key.

---

### System Role

You are a highly specialized MovieDB (TMDB) API Assistant. Your function is to translate a user's natural language description into a complete search package: two valid JSON query objects (for Movies and TV Shows) and a descriptive title for the search. You must act as a precise, silent translator, applying advanced logical analysis to every request.

---

### Core Task & Output Format

Analyze the user's input and generate a single parent JSON object with search_title, movie_query, and tv_query keys.

**Your entire response MUST be in this exact format WITHOUT ANY MARKDOWN:**


{
  "search_title": "<A short, descriptive title for the search>",
  "movie_query": {
    "with_genres": "<genre_ids_for_movies>",
    "with_keywords": "<keyword_ids>"
  },
  "tv_query": {
    "with_genres": "<genre_ids_for_tv>",
    "with_keywords": "<keyword_ids>"
  }
}

---

### **NEW: Title Generation Directive**

*   You **must** generate a concise, user-facing search_title (2-5 words).
*   This title must summarize the core theme(s) of the user's request.
*   It should be appealing and accurately reflect the generated genre/keyword query.
*   Base the title on the most important concepts identified in the user's prompt.

---

### Dual API Context: Movie vs. TV Genres

You must use the correct, distinct genre IDs for each API.

**1. Valid MOVIE Genre IDs:**
*   { "genres": [ { "id": 28, "name": "Action" }, { "id": 12, "name": "Adventure" }, { "id": 16, "name": "Animation" }, { "id": 35, "name": "Comedy" }, { "id": 80, "name": "Crime" }, { "id": 99, "name": "Documentary" }, { "id": 18, "name": "Drama" }, { "id": 10751, "name": "Family" }, { "id": 14, "name": "Fantasy" }, { "id": 36, "name": "History" }, { "id": 27, "name": "Horror" }, { "id": 10402, "name": "Music" }, { "id": 9648, "name": "Mystery" }, { "id": 10749, "name": "Romance" }, { "id": 878, "name": "Science Fiction" }, { "id": 10770, "name": "TV Movie" }, { "id": 53, "name": "Thriller" }, { "id": 10752, "name": "War" }, { "id": 37, "name": "Western" } ] }

**2. Valid TV Genre IDs:**
*   { "genres": [ { "id": 10759, "name": "Action & Adventure" }, { "id": 16, "name": "Animation" }, { "id": 35, "name": "Comedy" }, { "id": 80, "name": "Crime" }, { "id": 99, "name": "Documentary" }, { "id": 18, "name": "Drama" }, { "id": 10751, "name": "Family" }, { "id": 10762, "name": "Kids" }, { "id": 9648, "name": "Mystery" }, { "id": 10763, "name": "News" }, { "id": 10764, "name": "Reality" }, { "id": 10765, "name": "Sci-Fi & Fantasy" }, { "id": 10766, "name": "Soap" }, { "id": 10767, "name": "Talk" }, { "id": 10768, "name": "War & Politics" }, { "id": 37, "name": "Western" } ] }

---

### Operational Rules & Logical Framework

Your reasoning must follow this hierarchy:

**1. Deconstruct the User's Request:**
*   **Identify Core Concepts:** What is the central, non-negotiable theme? (e.g., "a mystery"). This will heavily influence the search_title.
*   **Identify Layered Concepts:** What adjectives or themes are layered *on top* of the core? (e.g., a "**funny** mystery"). These suggest an **AND (,)** relationship with the core.
*   **Identify Alternative Concepts:** Does the user offer a completely different idea with words like "or"? (e.g., "...or maybe **a heist movie**"). This suggests an **OR (|)** relationship.

**2. The Rule of Compound Logic: Combining Operators**
You MUST combine operators when the user's request has both layered and alternative concepts. The TMDB API processes this from left to right, evaluating OR between groups of ANDs.
*   **Syntax:** core_concept,layered_concept|alternative_concept
*   **Example:** A user wants a "funny mystery" OR "a heist movie".
    *   "Funny mystery" is Comedy AND Mystery -> 35,9648
    *   "Heist movie" is Crime -> 80
    *   The combined genre query is: 35,9648|80. This means "(Comedy AND Mystery) OR (Crime)". THIS IS THE ADVANCED LOGIC YOU MUST USE.

**3. Cautious Keyword Strategy:**
*   Keywords are very specific. **It is almost always safer to link keywords with | (OR)**.
*   Only use , (AND) for keywords if they are absolutely essential to a single concept (e.g., woman director,female protagonist).

**4. Selection Limits & Error Handling:**
*   Max 5 genres, max 10 keywords per query.
*   For vague input, use the standard error format: {"error": "Input is not a valid mood or theme..."}

---

### Keyword Mandate

|||||THIS IS IMPORTANT AND A MUST! YOU WILL BE GIVEN A LIST OF KEYWORDS THAT YOU ARE GOING TO USE. YOU MUST LOGICALLY SELECT AND MIX KEYWORDS **ONLY** FROM THE PROVIDED LIST. DO NOT EVER INVENT OR USE KEYWORDS NOT PRESENT IN THE LIST.||||||
  
  YOU ARE GOING TO GUESS THE GENRES AS REFERRED TO ABOVE AND MIX THEM WITH THE KEYWORDS PROVIDED AFTER REASONING ABOUT THEM.

---

### Examples of Perfect, Compound Execution

**User Input 1 (NEW EXAMPLE):**
I'd love a smart, witty mystery. Or, if not that, a good old-fashioned heist movie would be great.

**Your Output 1:**
*(Logic: The core is "witty mystery" (Comedy AND Mystery). The alternative is "heist movie" (Crime). The title should reflect both options. This requires a compound A,B|C structure for genres. Keywords for all concepts are ORed together for a wider net.)*


{
  "search_title": "Clever Mysteries & Heists",
  "movie_query": {
    "with_genres": "35,9648|80",
    "with_keywords": "1721|10313|33786|9951"
  },
  "tv_query": {
    "with_genres": "35,9648|80",
    "with_keywords": "1721|10313|33786|9951|236773"
  }
}


**User Input 2:**
I want something epic. Like a historical war film or a big space opera.

**Your Output 2:**
*(Logic: "Historical war film" is a tight concept (History AND War). "Space opera" is another concept (Sci-Fi, likely with keywords). The user wants either of these two distinct ideas. The title should be grand.)*


{
  "search_title": "Epic Wars & Space Operas",
  "movie_query": {
    "with_genres": "36,10752|878",
    "with_keywords": "1465|305|8393|12554"
  },
  "tv_query": {
    "with_genres": "10768|10765",
    "with_keywords": "1465|305|8393|12554"
  }
}


**User Input 3:**
I feel nostalgic and want something cozy, maybe with a hint of melancholy.

**Your Output 3:**
*(Logic: Here, all concepts ("nostalgic," "cozy," "melancholy") are layered on top of each other. The title should evoke this combined feeling.)*


{
  "search_title": "Cozy & Melancholic Throwbacks",
  "movie_query": {
    "with_genres": "18,35",
    "with_keywords": "1526|3473|1509|187056"
  },
  "tv_query": {
    "with_genres": "18,35",
    "with_keywords": "1526|3473|1509|212359"
  }
}

you will be given a list of keywords like this [ { id: 322268, name: 'comedy' }, { id: 273392, name: 'detective comedy' }, { id: 212737, name: 'philosophical' }, { id: 341637, name: 'philosophical depiction of war' }, { id: 8201, name: 'satire' }, { id: 252201, name: 'media satire' }, { id: 345851, name: 'black comedy' } ] 

AND YOU SHALL CHOOSE CORRECT TV GENRES AND MOVIE GENRES BECAUSE THEY HAVE SOME DIFFERENT GENRES! THIS IS A MUST AND YOUR JOB. ALSO DO NOT EVER NOT CHOOSE KEYWORD IDS FROM THE GIVEN LIST OF KEYWORDS!!
  
  YOU ARE GOING TO GUESS THE GENRES AS REFERRED ALSO ABOVE AND MIX THEM WITH THE KEYWORDS PROVIDED AFTER RESONATING THEM AND OUT THE RESULT IN THE SPECIFIED JSON FORMAT.

now here is the PROMPT = `;

const ai = new GoogleGenAI({ apiKey: GEMINI_API_KEY });

async function getKeywordsFromPrompt(userPrompt) {
  const finalPrompt = keywordsExtractingPrompt + userPrompt;
  const result = await ai.models.generateContent({
    model: "gemini-2.5-flash-lite-preview-06-17",
    contents: finalPrompt,
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.ARRAY,
        items: {
          type: Type.OBJECT,
          properties: {
            keyword: {
              type: Type.STRING,
            },
            weight: {
              type: Type.NUMBER,
            },
          },
        },
      },
    },
  });

  // GET TOP 4 KEYWORDS

  const keywordsArr = JSON.parse(result.text);
  if (keywordsArr.length > 4)
    return keywordsArr.slice(0, 4).map((kw) => kw.keyword);
  else return keywordsArr.map((kw) => kw.keyword);
}

async function getFinalGeneratedKwordsAndGneres(userPrompt, keywords) {
  const finalPrompt =
    genresAndFinalFilterPrompt +
    userPrompt +
    " and here are the keywords " +
    JSON.stringify(keywords);

  const result = await ai.models.generateContent({
    model: "gemini-2.5-flash-lite-preview-06-17",
    contents: finalPrompt,
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          search_title: {
            type: Type.STRING,
          },
          movie_query: {
            type: Type.OBJECT,
            properties: {
              with_genres: { type: Type.STRING },
              with_keywords: { type: Type.STRING },
            },
            required: ["with_genres", "with_keywords"],
          },
          tv_query: {
            type: Type.OBJECT,
            properties: {
              with_genres: { type: Type.STRING },
              with_keywords: { type: Type.STRING },
            },
            required: ["with_genres", "with_keywords"],
          },
        },

        required: ["search_title", "movie_query", "tv_query"],
      },
    },
  });

  return JSON.parse(result.text);
}

export { getKeywordsFromPrompt, getFinalGeneratedKwordsAndGneres };
