const express = require('express');
const cors = require('cors');
const { VertexAI } = require('@google-cloud/vertexai');

const app = express();
const PORT = process.env.PORT || 8080;
const PROJECT_ID = process.env.GOOGLE_CLOUD_PROJECT || 'project-d0118f2c-58f4-4081-864';
const LOCATION = process.env.LOCATION || 'us-central1';

// CORS - 허용 도메인
app.use(cors({
  origin: [
    'https://econojabis.com',
    'https://www.econojabis.com',
    /\.lovable\.app$/,
    /localhost/
  ],
  methods: ['GET', 'POST'],
  allowedHeaders: ['Content-Type']
}));

app.use(express.json({ limit: '10mb' }));

// Vertex AI 클라이언트 (서비스 계정 자동 인증)
const vertexAI = new VertexAI({ project: PROJECT_ID, location: LOCATION });

// 뉴스 생성 모델 (Gemini 2.0 Flash - 텍스트 생성)
const newsModel = vertexAI.getGenerativeModel({
  model: 'gemini-2.0-flash',
  generationConfig: {
    temperature: 0.2,
    maxOutputTokens: 16384,
  },
  tools: [{ googleSearch: {} }],
});

// 이미지 생성 모델 (Nano Banana 2 = gemini-3.1-flash-image-preview)
const imageModel = vertexAI.getGenerativeModel({
  model: 'gemini-3.1-flash-image-preview',
  generationConfig: {
    responseModalities: ['IMAGE', 'TEXT'],
    temperature: 0.4,
  },
});

// 헬스체크
app.get('/health', (req, res) => {
  res.json({ status: 'ok', project: PROJECT_ID, location: LOCATION });
});

// 뉴스 생성 API
app.post('/api/news', async (req, res) => {
  try {
    const { query } = req.body;
    if (!query) return res.status(400).json({ error: 'query required' });

    const today = new Date().toLocaleDateString('ko-KR', { year: 'numeric', month: '2-digit', day: '2-digit' });
    const prompt = `You are a professional global economic journalist. Write 3 latest real-time news articles on: "${query}" for today (${today}).

RESPOND ONLY WITH VALID JSON ARRAY - NO OTHER TEXT:
[
  {
    "title": "News headline in Korean",
    "source": "Reuters/Bloomberg/etc",
    "published_at": "${new Date().toISOString()}",
    "category": "주식|부동산|환율|암호화폐|금융|테크|거시경제|경제",
    "keywords": "keyword1,keyword2,keyword3",
    "body": "Article body minimum 1500 characters, 8 paragraphs separated by blank lines, include specific numbers/names"
  }
]

Rules:
1. body must be 1500+ characters
2. Write in Korean for Korean queries
3. Include real data, specific percentages, company names
4. ABSOLUTELY NO TEXT outside JSON`;

    const result = await newsModel.generateContent({
      contents: [{ role: 'user', parts: [{ text: prompt }] }]
    });

    const text = result.response?.candidates?.[0]?.content?.parts?.[0]?.text || '';
    const jsonMatch = text.match(/\[[\s\S]*\]/);
    if (!jsonMatch) return res.status(500).json({ error: 'No JSON in response', raw: text.substring(0, 200) });

    const articles = JSON.parse(jsonMatch[0]);
    res.json({ articles, count: articles.length });
  } catch (err) {
    console.error('News API error:', err);
    res.status(500).json({ error: err.message });
  }
});

// 이미지 생성 API (Nano Banana 2)
app.post('/api/image', async (req, res) => {
  try {
    const { prompt } = req.body;
    if (!prompt) return res.status(400).json({ error: 'prompt required' });

    const result = await imageModel.generateContent({
      contents: [{ role: 'user', parts: [{ text: prompt }] }]
    });

    const parts = result.response?.candidates?.[0]?.content?.parts || [];
    const imagePart = parts.find(p => p.inlineData);
    
    if (!imagePart) {
      return res.status(500).json({ error: 'No image generated' });
    }

    res.json({
      imageData: imagePart.inlineData.data,
      mimeType: imagePart.inlineData.mimeType || 'image/png'
    });
  } catch (err) {
    console.error('Image API error:', err);
    res.status(500).json({ error: err.message });
  }
});

app.listen(PORT, () => {
  console.log(`EconoJabis Backend running on port ${PORT}`);
  console.log(`Project: ${PROJECT_ID}, Location: ${LOCATION}`);
});
