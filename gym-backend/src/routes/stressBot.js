require('dotenv').config();
const express = require('express');
const router = express.Router();


router.post("/stress", async (req, res) => {
  try {
    console.log("Request body:", req.body);
    const { messages } = req.body;

    const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
  method: "POST",
  headers: {
    "Authorization": `Bearer ${process.env.OPENROUTER_API_KEY}`,
    "Content-Type": "application/json",
  },
  body: JSON.stringify({
    model: "deepseek/deepseek-r1:free",
    messages
  })
});



    if (!response.ok) {
      return res.status(response.status).json(await response.json());
    }

    const data = await response.json();
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});
console.log("OpenRouter API Key:", process.env.OPENROUTER_API_KEY ? "✓ Loaded" : "✗ Missing");


module.exports = router;
