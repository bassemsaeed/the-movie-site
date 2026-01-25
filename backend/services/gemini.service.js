import { GoogleGenerativeAI } from "@google/generative-ai";

const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
const genAI = new GoogleGenerativeAI(GEMINI_API_KEY);

async function getEmbedding(text) {

  const model = genAI.getGenerativeModel({ model: "gemini-embedding-001" });

  try {
    const result = await model.embedContent({
      content: { parts: [{ text: text }] },
      taskType: "RETRIEVAL_QUERY",


      outputDimensionality: 768
    });

    const vector = result.embedding.values;



    return vector;
  } catch (error) {
    throw new Error(`Gemini Embedding Error: ${error.message}`);
  }
}

export { getEmbedding };
