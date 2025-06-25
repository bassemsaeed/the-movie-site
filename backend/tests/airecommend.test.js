import { jest, describe, it, expect, beforeEach } from "@jest/globals";
import request from "supertest";
import { app } from "../app.js";

// --- MOCK SETUP for ESM ---
jest.unstable_mockModule("../services/gemini.service.js", () => ({
  getKeywordsFromPrompt: jest.fn(),
  getFinalGeneratedKwordsAndGneres: jest.fn(),
}));

jest.unstable_mockModule("axios", () => ({
  default: {
    get: jest.fn(),
  },
}));

// --- DYNAMICALLY IMPORT AFTER MOCKING ---
const { getKeywordsFromPrompt, getFinalGeneratedKwordsAndGneres } =
  await import("../services/gemini.service.js");
const { default: axios } = await import("axios");

describe("GET /airecommend - Rate Limiting", () => {
  beforeEach(() => {
    jest.clearAllMocks();

    getKeywordsFromPrompt.mockResolvedValue(["sci-fi", "dystopian"]);
    getFinalGeneratedKwordsAndGneres.mockResolvedValue({
      movie_query: { with_genres: "878", with_keywords: "4321" },
      tv_query: { with_genres: "10765", with_keywords: "1234" },
    });
    axios.get.mockResolvedValue({ data: { results: [] } });
  });

  // THIS IS THE TEST THAT WAS FAILING
  it("should process the request successfully when the limit is not exceeded", async () => {
    const response = await request(app)
      .get("/airecommend")
      .query({ prompt: "movies like blade runner" });

    expect(response.statusCode).toBe(200);
    expect(response.text).toContain("Analyzing your prompt");
    expect(response.text).not.toContain(
      "You have exceeded the daily request limit",
    );
  }, 30000);

  it("should return a rate limit error after exceeding the 15 request limit", async () => {
    const limit = 15;

    const promises = [];
    for (let i = 0; i < limit; i++) {
      promises.push(
        request(app)
          .get("/airecommend")
          .query({ prompt: `test ${i}` }),
      );
    }
    await Promise.all(promises);

    const finalResponse = await request(app)
      .get("/airecommend")
      .query({ prompt: "the final test" });

    expect(finalResponse.statusCode).toBe(200);
    const expectedMessage = "You have exceeded the daily request limit";
    expect(finalResponse.text).toContain(expectedMessage);
    expect(finalResponse.text).toContain('"limitReached":true');
  }, 30000); // It's good practice to add it here too, as it makes many requests.
});
