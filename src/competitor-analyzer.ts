import { Artifact } from "./instagram-collector";

export interface CompetitorInsight {
  handle: string;
  topFormats: string[];
  commonThemes: string[];
  engagementAvg: number;
}

export class CompetitorAnalyzer {
  analyzeCompetitors(artifactsByHandle: Record<string, Artifact[]>): CompetitorInsight[] {
    return Object.entries(artifactsByHandle).map(([handle, artifacts]) => {
      const avgLikes = artifacts.reduce((sum, a) => sum + (a.likeCount || 0), 0) / artifacts.length;
      return {
        handle,
        topFormats: ["carousel", "reel"],
        commonThemes: this.extractThemes(artifacts),
        engagementAvg: Math.round(avgLikes),
      };
    });
  }

  private extractThemes(artifacts: Artifact[]): string[] {
    const captions = artifacts.map(a => a.captionText || "").join(" ").toLowerCase();
    const themes: Record<string, number> = {};
    const keywords = ["music", "dance", "energy", "vibe", "community", "night", "beat"];

    keywords.forEach(kw => {
      themes[kw] = (captions.match(new RegExp(kw, "g")) || []).length;
    });

    return Object.entries(themes)
      .filter(([_, count]) => count > 0)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([theme]) => theme);
  }
}