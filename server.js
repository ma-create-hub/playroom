import express from 'express';
import cors from 'cors';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { scrapeProduct } from './scraper.js';

const __dirname = dirname(fileURLToPath(import.meta.url));

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json({ limit: '1mb' }));
app.use(express.static(join(__dirname, 'public')));

// Scrape a product page for measurements.
//   GET /api/scrape?url=https://...
app.get('/api/scrape', async (req, res) => {
  const { url } = req.query;
  if (!url || typeof url !== 'string') {
    return res.status(400).json({ error: 'Provide a ?url= query parameter.' });
  }
  try {
    const data = await scrapeProduct(url);
    res.json(data);
  } catch (err) {
    res.status(err.status || 500).json({ error: err.message || 'Scrape failed.' });
  }
});

app.get('/api/health', (_req, res) => res.json({ ok: true }));

app.listen(PORT, () => {
  console.log(`\n  Playroom Designer running at  http://localhost:${PORT}\n`);
});
