import express, { Request, Response } from "express";
import { InstagramCollector } from "./instagram-collector";
import { BrandAnalyzer } from "./brand-analyzer";
import { CompetitorAnalyzer } from "./competitor-analyzer";
import { PostGenerator } from "./post-generator";
import { PDFRenderer, ReportData } from "./pdf-renderer";

const app = express();
const port = process.env.PORT || 3000;

app.use(express.json());

// CORS middleware for Custom GPT integration
app.use((req, res, next) => {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
  res.header("Access-Control-Allow-Headers", "Content-Type");
  if (req.method === "OPTIONS") {
    res.sendStatus(200);
  } else {
    next();
  }
});

// Health check endpoint
app.get("/", (req: Request, res: Response) => {
  res.json({
    service: "Smart Prompt Lab API",
    version: "1.0.0",
    status: "running",
    endpoints: ["/analyze", "/pdf"],
  });
});

// Main analysis endpoint
app.post("/analyze", async (req: Request, res: Response) => {
  try {
    const {
      targetHandle,
      recencyWindowDays = 30,
      maxRecentPosts = 12,
      competitorCount = 5,
      generatePostCount = 3,
    } = req.body;

    if (!targetHandle) {
      return res.status(400).json({ error: "targetHandle is required" });
    }

    // Initialize services
    const collector = new InstagramCollector();
    const brandAnalyzer = new BrandAnalyzer();
    const competitorAnalyzer = new CompetitorAnalyzer();
    const postGenerator = new PostGenerator();

    // Step 1: Resolve and validate target handle
    const targetResolution = await collector.resolveTarget(targetHandle);
    if (!targetResolution.accessible) {
      return res.status(404).json({
        error: "Target handle not accessible",
        reason: targetResolution.reason,
      });
    }

    // Step 2: Collect artifacts from target account
    const { artifacts, likeCommentVisible } = await collector.collectRecentArtifacts({
      handle: targetResolution.handle,
      recencyWindowDays,
      maxRecentPosts,
    });

    if (artifacts.length === 0) {
      return res.status(404).json({
        error: "No artifacts found for target handle",
      });
    }

    // Step 3: Analyze brand DNA
    const brandDna = brandAnalyzer.analyzeBrand(targetResolution.handle, artifacts);

    // Step 4: Discover and analyze competitors
    const brandDnaKeywords = brandDna.inferred
      .join(" ")
      .toLowerCase()
      .split(/\W+/)
      .filter(w => w.length > 3)
      .slice(0, 5);

    const competitorHandles = await collector.discoverCompetitors({
      targetHandle: targetResolution.handle,
      brandDnaKeywords,
      desiredCount: competitorCount,
    });

    // Collect competitor artifacts
    const competitorArtifacts: Record<string, any[]> = {};
    for (const handle of competitorHandles) {
      const { artifacts: compArtifacts } = await collector.collectRecentArtifacts({
        handle,
        recencyWindowDays,
        maxRecentPosts: 6,
      });
      competitorArtifacts[handle] = compArtifacts;
    }

    const competitorInsights = competitorAnalyzer.analyzeCompetitors(competitorArtifacts);

    // Step 5: Generate post recommendations
    const generatedPosts = postGenerator.generatePosts({
      brandDna,
      competitorInsights,
      count: generatePostCount,
    });

    // Return comprehensive analysis
    res.json({
      targetHandle: targetResolution.handle,
      brandDna,
      competitorInsights,
      generatedPosts,
      metadata: {
        artifactsCollected: artifacts.length,
        competitorsAnalyzed: competitorHandles.length,
        postsGenerated: generatedPosts.length,
        likeCommentVisible,
        timestamp: new Date().toISOString(),
      },
    });
  } catch (error) {
    console.error("Analysis error:", error);
    res.status(500).json({
      error: "Internal server error during analysis",
      message: error instanceof Error ? error.message : String(error),
    });
  }
});

// PDF generation endpoint
app.post("/pdf", async (req: Request, res: Response) => {
  try {
    const reportData: ReportData = req.body;

    if (!reportData.targetHandle || !reportData.brandDna || !reportData.competitorInsights) {
      return res.status(400).json({
        error: "Invalid report data. Required: targetHandle, brandDna, competitorInsights",
      });
    }

    const renderer = new PDFRenderer();
    const doc = renderer.generateReport({
      ...reportData,
      timestamp: reportData.timestamp || new Date().toISOString(),
    });

    // Set response headers for PDF download
    res.setHeader("Content-Type", "application/pdf");
    res.setHeader(
      "Content-Disposition",
      `attachment; filename="smart-prompt-lab-${reportData.targetHandle}-${Date.now()}.pdf"`
    );

    // Pipe PDF to response
    doc.pipe(res);
    doc.end();
  } catch (error) {
    console.error("PDF generation error:", error);
    res.status(500).json({
      error: "Internal server error during PDF generation",
      message: error instanceof Error ? error.message : String(error),
    });
  }
});

// Start server
app.listen(port, () => {
  console.log(`Smart Prompt Lab API running on port ${port}`);
  console.log(`Endpoints available:`);
  console.log(`  GET  /           - Health check`);
  console.log(`  POST /analyze    - Instagram analysis`);
  console.log(`  POST /pdf        - PDF report generation`);
});

export default app;
