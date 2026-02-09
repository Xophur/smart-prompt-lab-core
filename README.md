# Smart Prompt Lab Core

A comprehensive Instagram brand analysis and post generation API designed for Custom GPT integration. This tool analyzes Instagram accounts, extracts brand DNA, studies competitor strategies, and generates data-driven post recommendations.

## Features

- **Instagram Analysis**: Automated collection and analysis of Instagram posts
- **Brand DNA Extraction**: Identifies brand characteristics, tone, and content patterns
- **Competitor Intelligence**: Discovers and analyzes competitor accounts
- **Post Generation**: Creates template-based post recommendations with competitor insights
- **PDF Reporting**: Generates comprehensive PDF reports with all analysis data
- **RESTful API**: Express-based API with OpenAPI 3.0 specification
- **Custom GPT Ready**: Designed for seamless integration with ChatGPT Custom GPTs

## Architecture

```
smart-prompt-lab-core/
├── src/
│   ├── core.ts                  # Core specification implementation
│   ├── instagram-collector.ts   # Instagram data collection
│   ├── brand-analyzer.ts        # Brand DNA analysis
│   ├── competitor-analyzer.ts   # Competitor insights
│   ├── post-generator.ts        # Post recommendation generation
│   ├── pdf-renderer.ts          # PDF report generation
│   └── index.ts                 # Express API server
├── api/
│   └── openapi.yaml             # OpenAPI 3.0 specification
├── package.json
├── tsconfig.json
└── README.md
```

## Installation

### Prerequisites

- Node.js 18+ 
- npm or yarn

### Local Setup

```bash
# Clone the repository
git clone https://github.com/Xophur/smart-prompt-lab-core.git
cd smart-prompt-lab-core

# Install dependencies
npm install

# Install Playwright browsers
npx playwright install chromium

# Build the project
npm run build

# Start the server
npm start
```

### Development Mode

```bash
# Run in development mode with auto-reload
npm run dev

# Watch mode for TypeScript compilation
npm run watch
```

## API Endpoints

### GET /

Health check endpoint that returns API status and available endpoints.

**Response:**
```json
{
  "service": "Smart Prompt Lab API",
  "version": "1.0.0",
  "status": "running",
  "endpoints": ["/analyze", "/pdf"]
}
```

### POST /analyze

Performs comprehensive Instagram brand analysis.

**Request Body:**
```json
{
  "targetHandle": "edm_brand",
  "recencyWindowDays": 30,
  "maxRecentPosts": 12,
  "competitorCount": 5,
  "generatePostCount": 3
}
```

**Parameters:**
- `targetHandle` (required): Instagram handle to analyze (with or without @)
- `recencyWindowDays` (optional, default: 30): Days to look back for posts
- `maxRecentPosts` (optional, default: 12): Maximum posts to collect
- `competitorCount` (optional, default: 5): Number of competitors to analyze
- `generatePostCount` (optional, default: 3): Number of post recommendations

**Response:**
```json
{
  "targetHandle": "edm_brand",
  "brandDna": {
    "observed": [
      "12 recent posts analyzed",
      "Uses emojis: Yes",
      "Hashtag strategy: Active"
    ],
    "inferred": [
      "Tone: Energetic/Emphatic",
      "Audience engagement approach: Community-focused"
    ],
    "artifactRefs": ["artifact_123", "artifact_456"]
  },
  "competitorInsights": [
    {
      "handle": "competitor1_edm",
      "topFormats": ["carousel", "reel"],
      "commonThemes": ["music", "energy", "vibe"],
      "engagementAvg": 5420
    }
  ],
  "generatedPosts": [
    {
      "caption": "🔥 READY FOR THIS? Music-inspired vibes coming at you!",
      "hashtags": ["#EDM", "#ElectronicMusic", "#Music"],
      "format": "carousel",
      "reasoning": "Format 'carousel' chosen based on top competitor performance."
    }
  ],
  "metadata": {
    "artifactsCollected": 12,
    "competitorsAnalyzed": 5,
    "postsGenerated": 3,
    "likeCommentVisible": true,
    "timestamp": "2024-01-15T10:30:00.000Z"
  }
}
```

### POST /pdf

Generates a PDF report from analysis data.

**Request Body:**
```json
{
  "targetHandle": "edm_brand",
  "brandDna": { ... },
  "competitorInsights": [ ... ],
  "generatedPosts": [ ... ],
  "artifacts": [ ... ],
  "timestamp": "2024-01-15T10:30:00.000Z"
}
```

**Response:** PDF file download

## Deployment

### Replit Deployment

1. **Import to Replit:**
   - Go to [Replit](https://replit.com)
   - Click "Create Repl" → "Import from GitHub"
   - Enter repository URL: `https://github.com/Xophur/smart-prompt-lab-core`

2. **Configure:**
   - Replit will auto-detect Node.js
   - Set run command: `npm run build && npm start`

3. **Install Playwright:**
   ```bash
   npx playwright install chromium --with-deps
   ```

4. **Deploy:**
   - Click "Run" to start the server
   - Get your deployment URL from Replit

### Railway Deployment

1. **Create New Project:**
   - Go to [Railway](https://railway.app)
   - Click "New Project" → "Deploy from GitHub repo"
   - Select `Xophur/smart-prompt-lab-core`

2. **Configure Build:**
   - Build Command: `npm install && npm run build`
   - Start Command: `npm start`
   - Add environment variable: `PORT=3000`

3. **Install Playwright:**
   - Add to your Railway service settings:
   ```bash
   npx playwright install chromium --with-deps
   ```

4. **Deploy:**
   - Railway will automatically deploy
   - Get your deployment URL from Railway dashboard

### Environment Variables

```bash
PORT=3000  # Server port (optional, defaults to 3000)
```

## Custom GPT Integration

### Setup Instructions

1. **Deploy the API** to Replit, Railway, or your preferred hosting service
2. **Get your API URL** (e.g., `https://your-app.railway.app`)
3. **Create a Custom GPT** in ChatGPT:
   - Go to ChatGPT → Explore GPTs → Create
   - Name: "Instagram Brand Analyst"
   - Description: "Analyzes Instagram accounts and generates post recommendations"

4. **Configure Actions:**
   - Click "Configure" → "Actions"
   - Click "Import from URL"
   - Enter: `https://your-app.railway.app/api/openapi.yaml`
   - Or manually paste the contents of `api/openapi.yaml`

5. **Test Your GPT:**
   - Ask: "Analyze Instagram account @edm_brand"
   - The GPT will call your API and provide insights

### Example Prompts

- "Analyze @edm_brand and give me 3 post ideas"
- "What's the brand DNA of @competitor_account?"
- "Generate a PDF report for @my_instagram"
- "Compare @brand1 with @brand2 and suggest content strategy"

## Usage Examples

### Using cURL

```bash
# Analyze an Instagram account
curl -X POST http://localhost:3000/analyze \
  -H "Content-Type: application/json" \
  -d '{
    "targetHandle": "edm_brand",
    "competitorCount": 3,
    "generatePostCount": 5
  }'

# Generate PDF report
curl -X POST http://localhost:3000/pdf \
  -H "Content-Type: application/json" \
  -d @analysis-result.json \
  --output report.pdf
```

### Using JavaScript/TypeScript

```typescript
import fetch from 'node-fetch';

// Analyze account
const response = await fetch('http://localhost:3000/analyze', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    targetHandle: 'edm_brand',
    competitorCount: 3,
    generatePostCount: 5
  })
});

const analysis = await response.json();
console.log(analysis);

// Generate PDF
const pdfResponse = await fetch('http://localhost:3000/pdf', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify(analysis)
});

const pdfBuffer = await pdfResponse.buffer();
// Save or process PDF
```

## Development

### Project Structure

- **src/core.ts**: Core specification implementation
- **src/instagram-collector.ts**: Playwright-based Instagram scraping
- **src/brand-analyzer.ts**: Brand DNA extraction algorithms
- **src/competitor-analyzer.ts**: Competitor analysis logic
- **src/post-generator.ts**: Template-based post generation
- **src/pdf-renderer.ts**: PDFKit-based report generation
- **src/index.ts**: Express API server and routing

### Technologies

- **TypeScript**: Type-safe development
- **Express**: Web framework
- **Playwright**: Browser automation for Instagram scraping
- **PDFKit**: PDF generation
- **Node.js**: Runtime environment

### Testing

```bash
# Run type checking
npm run build

# Start dev server
npm run dev

# Test endpoints
curl http://localhost:3000/
```

## Troubleshooting

### Playwright Installation Issues

If you encounter issues with Playwright:

```bash
# Install system dependencies
npx playwright install-deps chromium

# Install browser
npx playwright install chromium
```

### Instagram Access Issues

- Instagram may rate-limit or block automated access
- Consider implementing delays between requests
- Use residential proxies for production deployments
- Respect Instagram's Terms of Service

### Memory Issues

For large-scale analysis:
- Reduce `maxRecentPosts` and `competitorCount`
- Implement pagination
- Add caching layer

## License

MIT License - see LICENSE file for details

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## Support

For issues and questions:
- GitHub Issues: https://github.com/Xophur/smart-prompt-lab-core/issues
- Documentation: See `api/openapi.yaml` for API specification

## Roadmap

- [ ] Add caching layer (Redis)
- [ ] Implement rate limiting
- [ ] Add authentication/API keys
- [ ] Support for additional social platforms
- [ ] Advanced sentiment analysis
- [ ] Image analysis with AI
- [ ] Webhook support for async processing

---

Built with ❤️ by Smart Prompt Lab
