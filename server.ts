import "dotenv/config";
import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI, Type } from "@google/genai";

const app = express();
const PORT = 3000;

// Initialize GoogleGenAI client with standard proxy variables
const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
  httpOptions: {
    headers: {
      'User-Agent': 'aistudio-build',
    }
  }
});

app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ extended: true, limit: "50mb" }));

// API endpoint to transcribe audio bases64 using gemini-3.5-flash
app.post("/api/transcribe", async (req, res) => {
  try {
    const { audio, mimeType } = req.body;
    if (!audio) {
      return res.status(400).json({ error: "Missing audio base64 data" });
    }

    if (!process.env.GEMINI_API_KEY) {
      return res.status(500).json({ error: "GEMINI_API_KEY is not configured on the server." });
    }

    const audioPart = {
      inlineData: {
        mimeType: mimeType || "audio/webm",
        data: audio
      }
    };

    const sysInstruction = "You are an expert audio transcription system. " +
      "Listen carefully to the recorded dream narration. Output a verbatim transcript of the dream. " +
      "Correct slight stutters or repetitiveness, but keep the word choice exact. " +
      "Do NOT add any notes, headers, preambles, or explanations. Just output the clean transcription. " +
      "If the audio contains only ambient noise or is unintelligible, output: [Noise - Unable to transcribe]";

    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: [
        audioPart,
        { text: sysInstruction }
      ]
    });

    const transcript = response.text?.trim() || "";
    return res.json({ transcript });
  } catch (error: any) {
    console.error("Transcription error:", error);
    return res.status(500).json({ error: error.message || "Failed to transcribe audio" });
  }
});

// API endpoint to analyze dream transcript using Jungian Archetypal Schema
app.post("/api/analyze", async (req, res) => {
  try {
    const { transcript } = req.body;
    if (!transcript) {
      return res.status(400).json({ error: "Missing dream transcript text" });
    }

    if (!process.env.GEMINI_API_KEY) {
      return res.status(500).json({ error: "GEMINI_API_KEY is not configured on the server." });
    }

    const prompt = `Analyze this dream transcript psychological exploration. Rely deeply on recognised archetypes (especially Jungian ones like the Shadow, Anima/Animus, Ego, Wise Old Man/Woman, Self, or Trickster).\n\nDream Transcript: "${transcript}"`;

    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: prompt,
      config: {
        systemInstruction: "You are a professional depth psychologist and Jungian dream analyst. Analyze the provided dream with deep empathy and scientific archetypal rigor. Ensure that the tone is deeply understanding, insightful, and supportive of human conscious growth.",
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            summary: { type: Type.STRING, description: "A high-fidelity psychological overview of the dream's hidden meaning" },
            emotionalTheme: { type: Type.STRING, description: "A descriptive four-to-six word theme capturing the dream's core emotional wavelength (e.g. 'Trapped by duty, yearning for flight')" },
            archetypes: {
              type: Type.ARRAY,
              description: "Symbols or characters representing specific Jungian archetypes in the dream",
              items: {
                type: Type.OBJECT,
                properties: {
                  name: { type: Type.STRING, description: "The archetype name (e.g., Shadow, Anima, Wise Old Man)" },
                  description: { type: Type.STRING, description: "General definition of this archetype" },
                  meaning: { type: Type.STRING, description: "The unique way this archetype is expressing itself in this specific dream" }
                },
                required: ["name", "description", "meaning"]
              }
            },
            symbols: {
              type: Type.ARRAY,
              description: "Key symbolic elements (flora, fauna, objects, actions) that need exploration",
              items: {
                type: Type.OBJECT,
                properties: {
                  name: { type: Type.STRING, description: "The symbol identified (e.g., silver key, dark forest)" },
                  meaning: { type: Type.STRING, description: "The psychological or archetypal representation of this item" },
                  association: { type: Type.STRING, description: "A gentle reflective prompt for the user's personal association" }
                },
                required: ["name", "meaning", "association"]
              }
            },
            dynamics: { type: Type.STRING, description: "The dynamic friction, conflicts, tensions, or potential resolution occurring between the Dream-Ego and other entities" },
            guidance: { type: Type.STRING, description: "Actionable analytical guidance and integration exercises (e.g., active imagination, creative writing) to explore this message" }
          },
          required: ["summary", "emotionalTheme", "archetypes", "symbols", "dynamics", "guidance"]
        }
      }
    });

    const parsedData = JSON.parse(response.text?.trim() || "{}");
    return res.json(parsedData);
  } catch (error: any) {
    console.error("Analysis error:", error);
    return res.status(500).json({ error: error.message || "Failed to analyze dream" });
  }
});

// API endpoint to generate surrealist dream image using gemini-2.5-flash-image
app.post("/api/generate-image", async (req, res) => {
  try {
    const { transcript, emotionalTheme } = req.body;
    if (!transcript) {
      return res.status(400).json({ error: "Missing dream transcript" });
    }

    if (!process.env.GEMINI_API_KEY) {
      return res.status(500).json({ error: "GEMINI_API_KEY is not configured on the server." });
    }

    // Step 1: Generate an extremely creative, surrealist image description based on the dream
    const descriptorPrompt = "Based on this dream: \"" + transcript + "\" and its core theme \"" + emotionalTheme + "\", generate an extremely visual, artistic, and evocative prompt for image generation. " +
      "It must specify a high-fidelity surrealist style (inspired by Salvador Dali, René Magritte, Max Ernst, and Remedios Varo), describing dreamlike atmosphere, symbolic color palettes, floating items, and mysterious negative spacing. " +
      "The result must be directly usable as an image generation prompt. Keep the prompt under 150 words. Do NOT include preface text, just output the image prompt.";

    const descriptorResponse = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: descriptorPrompt
    });

    const finalImagePrompt = descriptorResponse.text?.trim() || `A surreal dream illustration representing: ${emotionalTheme}. Surrealist oil painting, heavy symbolism, Dali style.`;

    // Step 2: Attempt image generation via server-only gemini-2.5-flash-image
    try {
      console.log("Generating surreal image with prompt:", finalImagePrompt);
      const imageResponse = await ai.models.generateContent({
        model: "gemini-2.5-flash-image",
        contents: {
          parts: [{ text: finalImagePrompt }]
        },
        config: {
          imageConfig: {
            aspectRatio: "1:1"
          }
        }
      });

      let base64Image = "";
      if (imageResponse.candidates?.[0]?.content?.parts) {
        for (const part of imageResponse.candidates[0].content.parts) {
          if (part.inlineData?.data) {
            base64Image = part.inlineData.data;
            break;
          }
        }
      }

      if (base64Image) {
        const imageUrl = `data:image/png;base64,${base64Image}`;
        return res.json({ imageUrl, prompt: finalImagePrompt });
      } else {
        throw new Error("No image data returned from image generation model.");
      }
    } catch (apiError: any) {
      console.warn("Gemini Image generation failed, returning procedural instruction for canvas or fallback:", apiError.message);
      // Fallback response with the prompt, so that the client can render a beautiful procedural representation based on the theme
      return res.json({ 
        prompt: finalImagePrompt,
        fallback: true,
        message: "Image generation model requires premium credentials or was throttled. Procedural visualizer active."
      });
    }

  } catch (error: any) {
    console.error("Overall Image Pipeline Error:", error);
    return res.status(500).json({ error: error.message || "Failed in image generation pipeline" });
  }
});

// API endpoint for symbol chat
app.post("/api/chat", async (req, res) => {
  try {
    const { dreamTranscript, chatHistory, message } = req.body;
    if (!dreamTranscript || !message) {
      return res.status(400).json({ error: "Missing required arguments (dreamTranscript, message)" });
    }

    if (!process.env.GEMINI_API_KEY) {
      return res.status(500).json({ error: "GEMINI_API_KEY is not configured on the server." });
    }

    // Build chat parameters
    const systemInstruction = 
      "You are a professional depth psychology guide and dream analyst specializing in Jungian theory. " +
      "The user has shared this dream: \"" + dreamTranscript + "\"\n\n" +
      "Your role is to help them understand follow-up questions about specific symbols, characters, feelings, " +
      "or activities in that dream. Ask insightful, reflective questions in return to spark personal associations. " +
      "Be empathetic, respectful, and psychological. Keep answers concise, highly specific to the symbols mentioned, " +
      "and limit response length to 150 words to keep client conversations highly focused. Deliver clean Markdown formatting.";

    // Convert chat history list to the content structure of google/genai SDK
    // In chat.sendMessage, we can run a standard model.generateContent or use the chat API
    // Let's usegenerateContent with the full conversation history to maintain absolute state control
    const conversationContents: any[] = [];
    
    // Add history
    if (chatHistory && Array.isArray(chatHistory)) {
      chatHistory.forEach((msg: any) => {
        conversationContents.push({
          role: msg.role === "user" ? "user" : "model",
          parts: [{ text: msg.text }]
        });
      });
    }

    // Append current user message
    conversationContents.push({
      role: "user",
      parts: [{ text: message }]
    });

    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: conversationContents,
      config: {
        systemInstruction
      }
    });

    const reply = response.text || "";
    return res.json({ reply });
  } catch (error: any) {
    console.error("Chat symbol error:", error);
    return res.status(500).json({ error: error.message || "Failed to process chat response" });
  }
});

// Handle Vite middleware & static files
async function start() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    // Serve production static assets compiled under dist
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Dream Journal Full-Stack Server running on http://localhost:${PORT}`);
  });
}

start();
