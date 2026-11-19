import express from "express";
import dotenv from "dotenv";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

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

app.post("/api/hair-tryon", async (req, res) => {
  try {
    const { image, prompt } = req.body;

    if (!image || !prompt) {
      return res.status(400).json({ error: "الصورة أو الوصف ناقصين" });
    }

    if (!process.env.AI_API_KEY) {
      return res.status(500).json({ error: "مفتاح AI_API_KEY غير مضبوط" });
    }

    return res.status(501).json({
      error: "اربط مزود خدمة تعديل الصور داخل /api/hair-tryon لتوليد النتيجة الفعلية"
    });
  } catch (err) {
    console.error("Hair tryon error:", err);
    return res.status(500).json({ error: "حدث خطأ داخلي في السيرفر" });
  }
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
