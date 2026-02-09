import { Artifact } from "./instagram-collector";

export interface BrandDna {
  observed: string[];
  inferred: string[];
  artifactRefs: string[];
}

export class BrandAnalyzer {
  analyzeBrand(_handle: string, artifacts: Artifact[]): BrandDna {
    const captions = artifacts.map(a => a.captionText || "").join(" ");
    const hasEmojis = /[\p{Emoji}]/gu.test(captions);
    const hasCaps = /[A-Z]{2,}/.test(captions);
    const avgCaptionLength = artifacts.reduce((sum, a) => sum + (a.captionText?.length || 0), 0) / artifacts.length;
    const hasHashtags = /#\w+/.test(captions);
    const hasMentions = /@\w+/.test(captions);

    const observed = [
      `${artifacts.length} recent posts analyzed`,
      `Uses emojis: ${hasEmojis ? "Yes" : "No"}`,
      `Hashtag strategy: ${hasHashtags ? "Active" : "Minimal"}`,
      `Mention strategy: ${hasMentions ? "Active" : "Minimal"}`,
      `Average caption length: ${Math.round(avgCaptionLength)} characters`,
    ];

    const inferred = [
      `Tone: ${hasCaps ? "Energetic/Emphatic" : "Measured"}`,
      `Audience engagement approach: ${hasMentions ? "Community-focused" : "Broadcast-focused"}`,
      `Content pillar: ${extractPillars(captions)}`,
    ];

    return {
      observed,
      inferred,
      artifactRefs: artifacts.map(a => a.artifactId),
    };
  }
}

function extractPillars(text: string): string {
  const pillars: Record<string, number> = {};
  const keywords = {
    music: ["music", "track", "beat", "drop", "remix", "mix"],
    event: ["event", "show", "live", "gig", "festival", "venue"],
    lifestyle: ["vibe", "mood", "energy", "love", "passion"],
    visual: ["visual", "art", "design", "creative", "style"],
  };

  Object.entries(keywords).forEach(([pillar, words]) => {
    pillars[pillar] = words.filter(w => text.toLowerCase().includes(w)).length;
  });

  return Object.entries(pillars)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 3)
    .map(([p]) => p)
    .join(", ");
}