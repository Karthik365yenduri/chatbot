require('dotenv').config();
const express = require('express');
const { GoogleGenerativeAI } = require('@google/generative-ai');
const path = require("path");
const favicon = require('serve-favicon');
const app = express();
const port = process.env.PORT || 8000;

// Middleware to parse JSON in request bodies
app.use(express.json());

// Serve static files from the "public" folder
app.use(express.static(path.join(__dirname)));

// Serve the favicon from the "public" folder
const faviconPath = path.join(__dirname, 'favicon.ico');
app.use(favicon(faviconPath));

// Serve bg.jpg
app.get('/bg.jpg', (req, res) => {
  res.sendFile(path.join(__dirname, 'bg.jpg'));
});

// Serve the index.html file
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname,'index.html'));
});

// Get API key from environment variables
const apiKey = process.env.GOOGLE_API_KEY;
if (!apiKey) {
  throw new Error("Missing GOOGLE_API_KEY environment variable.");
}

// Initialize GoogleGenerativeAI with your API key
const genAI = new GoogleGenerativeAI(apiKey);
const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });

// POST endpoint to handle chat messages
app.post('/api/chat', async (req, res) => {
  try {
    const { message } = req.body;
    if (!message) {
      return res.status(400).json({ error: 'Message is required' });
    }
    
    // Generate content from the AI model based on the user's message
    const result = await model.generateContent({
      contents: [
        {
          role: "user",
          parts: [{ text: message }]
        }
      ]
    });
    
    const responseText = result.response.text();
    return res.json({ response: responseText });
  } catch (error) {
    console.error("Error generating content:", error);
    res.status(500).json({ error: 'Something went wrong.' });
  }
});

// Start the server
app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});
