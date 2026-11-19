import express from "express";
import dotenv from "dotenv";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;
const HF_MODEL = process.env.HF_MODEL || "stabilityai/stable-diffusion-xl-base-1.0";

app.use(express.json({ limit: "15mb" }));

app.use((req, res, next) => {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Headers", "Content-Type");
  if (req.method === "OPTIONS") return res.sendStatus(200);
  next();
});

app.get("/", (req, res) => {
  res.json({ status: "ok", message: "Barber AI server is running" });
});

function extractBase64(imageInput) {
  if (!imageInput || typeof imageInput !== "string") return null;
  const match = imageInput.match(/^data:(image\/[a-zA-Z0-9.+-]+);base64,(.+)$/);
  if (match) {
    return {
      mimeType: match[1],
      base64: match[2],
    };
  }
  return {
    mimeType: "image/jpeg",
    base64: imageInput,
  };
}

app.post("/api/hair-tryon", async (req, res) => {
  try {
    const { image, prompt } = req.body || {};

    if (!image || !prompt) {
      return res.status(400).json({ error: "الصورة أو الوصف ناقصين" });
    }

    if (!process.env.AI_API_KEY) {
      return res.status(500).json({ error: "غير مضبوط AI_API_KEY مفتاح" });
    }

    const parsedImage = extractBase64(image);
    const imageBuffer = Buffer.from(parsedImage.base64, "base64");

    const hfResponse = await fetch(
      `https://router.huggingface.co/hf-inference/models/${HF_MODEL}`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${process.env.AI_API_KEY}`,
          "Content-Type": parsedImage.mimeType,
        },
        body: imageBuffer,
      }
    );

    if (!hfResponse.ok) {
      const errorText = await hfResponse.text();
      console.error("Hugging Face error:", hfResponse.status, errorText);
      return res.status(hfResponse.status).json({
        error: "فشل التوليد من مزود الذكاء الاصطناعي",
        details: errorText,
      });
    }

    const contentType = hfResponse.headers.get("content-type") || "image/png";
    const resultArrayBuffer = await hfResponse.arrayBuffer();
    const resultBase64 = Buffer.from(resultArrayBuffer).toString("base64");

    return res.json({
      image: `data:${contentType};base64,${resultBase64}`,
      promptUsed: prompt,
    });
  } catch (err) {
    console.error("Hair tryon error:", err);
    return res.status(500).json({ error: "حدث خطأ داخلي في السيرفر" });
  }
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
