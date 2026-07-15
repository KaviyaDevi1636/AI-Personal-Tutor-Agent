import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI, Type } from "@google/genai";
import dotenv from "dotenv";

// Load environment variables
dotenv.config();

// Standard lazy initialization of Gemini API Client
let aiClient: GoogleGenAI | null = null;

function getAiClient(): GoogleGenAI {
  if (!aiClient) {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      throw new Error("GEMINI_API_KEY environment variable is not defined. Please configure it in Settings > Secrets.");
    }
    aiClient = new GoogleGenAI({
      apiKey,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        }
      }
    });
  }
  return aiClient;
}

const app = express();
const PORT = 3000;

app.use(express.json());

// API health endpoint
app.get("/api/health", (req, res) => {
  res.json({
    status: "ok",
    hasApiKey: !!process.env.GEMINI_API_KEY,
  });
});

// Endpoint: Socratic Chat Dialogue
app.post("/api/chat", async (req, res) => {
  try {
    const { message, history = [], systemInstruction } = req.body;
    const ai = getAiClient();

    // Map history to the Gemini API structure
    const contents = history.map((msg: any) => ({
      role: msg.sender === 'user' ? 'user' : 'model',
      parts: [{ text: msg.text }]
    }));

    // Add current message
    contents.push({
      role: 'user',
      parts: [{ text: message }]
    });

    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents,
      config: {
        systemInstruction: systemInstruction || "You are an expert Socratic tutor. Guide the user step-by-step by asking questions rather than directly giving the answer. Help them think through problems on their own.",
        temperature: 0.7,
      },
    });

    res.json({ text: response.text || "I was unable to formulate a response. Let's try again!" });
  } catch (error: any) {
    console.error("Chat error:", error);
    res.status(500).json({ error: error.message || "Failed to process chat response from Gemini API." });
  }
});

// Endpoint: Generate Personalized Course Roadmap
app.post("/api/generate-roadmap", async (req, res) => {
  try {
    const { topic, difficulty = "beginner", targetAudience = "" } = req.body;
    const ai = getAiClient();

    const difficultyPrompt = `The difficulty level is '${difficulty}'.`;
    const audiencePrompt = targetAudience ? `Target audience background/preferences: '${targetAudience}'.` : '';

    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: `Design a comprehensive and structured learning roadmap for the topic: "${topic}". ${difficultyPrompt} ${audiencePrompt} Be highly technical yet clear, sequencing the learning step-by-step in 3-5 modules, each with clear objectives, realistic completion times, and 2-4 granular subtopics with short, bite-sized actionable descriptions.`,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            title: { type: Type.STRING, description: "Engaging and clear course title" },
            description: { type: Type.STRING, description: "High-level description of what the user will learn" },
            estimatedTime: { type: Type.STRING, description: "Total completion time, e.g., '15 hours' or '3 weeks'" },
            targetAudience: { type: Type.STRING, description: "Short summary of prerequisites or target level" },
            modules: {
              type: Type.ARRAY,
              description: "The modules list in logical sequence",
              items: {
                type: Type.OBJECT,
                properties: {
                  title: { type: Type.STRING, description: "Module title" },
                  description: { type: Type.STRING, description: "Short overview of module objectives" },
                  duration: { type: Type.STRING, description: "Duration to complete, e.g., '3 hours'" },
                  topics: {
                    type: Type.ARRAY,
                    description: "Specific subtopics in this module (2-4 items)",
                    items: {
                      type: Type.OBJECT,
                      properties: {
                        title: { type: Type.STRING, description: "Subtopic title" },
                        description: { type: Type.STRING, description: "Short description of the subtopic concept" }
                      },
                      required: ["title", "description"]
                    }
                  }
                },
                required: ["title", "description", "duration", "topics"]
              }
            }
          },
          required: ["title", "description", "estimatedTime", "targetAudience", "modules"]
        },
        temperature: 0.5,
      },
    });

    if (!response.text) {
      throw new Error("Empty response from AI engine");
    }

    const data = JSON.parse(response.text.trim());
    res.json(data);
  } catch (error: any) {
    console.error("Roadmap generation error:", error);
    res.status(500).json({ error: error.message || "Failed to generate roadmap. Please try again." });
  }
});

// Endpoint: Generate Interactive Quiz
app.post("/api/generate-quiz", async (req, res) => {
  try {
    const { topic, moduleTitle, difficulty = "beginner" } = req.body;
    const ai = getAiClient();

    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: `Create an engaging 5-question multiple choice quiz on the topic "${topic}" in the module "${moduleTitle || 'General'}" at difficulty level "${difficulty}". Provide exactly 4 options per question, mark the correct 0-based index, and provide a clear, supportive educational explanation of the correct concept.`,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            title: { type: Type.STRING, description: "Engaging quiz title" },
            questions: {
              type: Type.ARRAY,
              description: "List of exactly 5 quiz questions",
              items: {
                type: Type.OBJECT,
                properties: {
                  question: { type: Type.STRING, description: "The question text" },
                  options: {
                    type: Type.ARRAY,
                    items: { type: Type.STRING },
                    description: "Exactly 4 options"
                  },
                  correctIndex: { type: Type.INTEGER, description: "The 0-based index of the correct answer (0-3)" },
                  explanation: { type: Type.STRING, description: "Bite-sized supportive educational breakdown of the correct answer" }
                },
                required: ["question", "options", "correctIndex", "explanation"]
              }
            }
          },
          required: ["title", "questions"]
        },
        temperature: 0.6,
      },
    });

    if (!response.text) {
      throw new Error("Empty response from AI engine");
    }

    const data = JSON.parse(response.text.trim());
    res.json(data);
  } catch (error: any) {
    console.error("Quiz generation error:", error);
    res.status(500).json({ error: error.message || "Failed to generate interactive quiz." });
  }
});

// Endpoint: Generate Active-Recall Flashcards
app.post("/api/generate-flashcards", async (req, res) => {
  try {
    const { topic, moduleTitle } = req.body;
    const ai = getAiClient();

    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: `Generate a list of 6 highly effective active-recall flashcards for studying "${topic}" (Focus: "${moduleTitle || 'General'}"). Each card must have a precise, thought-provoking question/term on the front and a concise, clear breakdown/answer on the back. Keep answers informative but bite-sized.`,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            cards: {
              type: Type.ARRAY,
              description: "Array of 6 flashcards",
              items: {
                type: Type.OBJECT,
                properties: {
                  front: { type: Type.STRING, description: "Clear question or core concept name" },
                  back: { type: Type.STRING, description: "Bite-sized answer, explanation, or definition" },
                  category: { type: Type.STRING, description: "Sub-category or topic tag" }
                },
                required: ["front", "back", "category"]
              }
            }
          },
          required: ["cards"]
        },
        temperature: 0.6,
      },
    });

    if (!response.text) {
      throw new Error("Empty response from AI engine");
    }

    const data = JSON.parse(response.text.trim());
    res.json(data);
  } catch (error: any) {
    console.error("Flashcards error:", error);
    res.status(500).json({ error: error.message || "Failed to generate study flashcards." });
  }
});

// Endpoint: Socratic/Detailed Concept Explanation
app.post("/api/explain-concept", async (req, res) => {
  try {
    const { topic, style = "socratic" } = req.body;
    const ai = getAiClient();

    let styleInstruction = "";
    if (style === "socratic") {
      styleInstruction = "Explain in Socratic Style: start with a beautiful analogies, break down the core concept, and then ask 2 thought-provoking guiding questions to test their understanding.";
    } else if (style === "elif") {
      styleInstruction = "Explain like I'm 5 (ELI5): Use simple analogies, absolute beginner terms, no dry technical jargon, and friendly illustrative storytelling.";
    } else if (style === "coder") {
      styleInstruction = "Explain like a Senior Engineer: Include clean, annotated TypeScript or pseudo-code examples, explain memory/runtime patterns, and outline typical architectural trade-offs.";
    } else if (style === "interactive_tutor") {
      styleInstruction = `Act as an Interactive AI Personal Tutor to teach the student interactively. Follow these STRICT pedagogical rules:
1. Start with a warm, friendly greeting.
2. Ask exactly one relevant, thought-provoking question to hook the student before starting the main explanation.
3. Explain the concept starting from the absolute basics, keeping it highly engaging and beginner-friendly.
4. Divide the explanation into small, digestible sections.
5. After every single section, ask: "Did you understand this? (Yes/No)"
6. If the concept is technical (or has code/technical foundations), provide:
   - **Definition**
   - **Syntax**
   - **Example**
   - **Real-life analogy**
   - **Diagram explanation** (using text/ASCII design or structured conceptual flow charts)
7. Add at least one clear coding/implementation example if applicable.
8. Provide essential **Interview Tips** for this concept.
9. Provide helpful **Memory Tricks** to guarantee retention.
10. End your response with:
   - **Summary**
   - **Quiz** (Provide exactly 5 highly relevant Multiple-Choice Questions with options A, B, C, D)
   - **Assignment**
   - **Next topic recommendation**`;
    } else {
      styleInstruction = "Provide a structured explanation: Start with a real-world analogy, break down the core mechanism in clear bullet points, list common edge cases or pitfalls, and end with a summary card.";
    }

    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: `Explain the concept: "${topic}" in detail.\n\nStyle Guide: ${styleInstruction}\n\nFormat your entire response beautifully with standard markdown (e.g., headings, list items, bold texts, and clean code blocks).`,
      config: {
        temperature: 0.7,
      },
    });

    res.json({ text: response.text || "I couldn't generate an explanation for this topic. Let's try again!" });
  } catch (error: any) {
    console.error("Concept explanation error:", error);
    res.status(500).json({ error: error.message || "Failed to generate concept explanation." });
  }
});

// Setup Vite middleware in Development mode, serve static build in Production
async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    console.log("Starting server in development mode with Vite middleware...");
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    console.log("Starting server in production mode...");
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`AI Personal Tutor backend listening on http://0.0.0.0:${PORT}`);
  });
}

if (!process.env.VERCEL) {
  startServer();
}

export default app;
