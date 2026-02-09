import { BrandDna } from "./brand-analyzer";
import { CompetitorInsight } from "./competitor-analyzer";

export interface PostTemplate {
  format: string;
  tone: string;
  structure: string;
}

export interface GeneratedPost {
  caption: string;
  hashtags: string[];
  format: string;
  reasoning: string;
}

export class PostGenerator {
  generatePosts(params: {
    brandDna: BrandDna;
    competitorInsights: CompetitorInsight[];
    count: number;
  }): GeneratedPost[] {
    const posts: GeneratedPost[] = [];
    const { brandDna, competitorInsights, count } = params;

    // Extract key brand characteristics
    const brandTone = this.extractTone(brandDna);
    const topCompetitorFormats = this.getTopFormats(competitorInsights);
    const competitorThemes = this.aggregateThemes(competitorInsights);

    for (let i = 0; i < count; i++) {
      const format = topCompetitorFormats[i % topCompetitorFormats.length];
      const theme = competitorThemes[i % competitorThemes.length];
      
      const post = this.createPost({
        format,
        theme,
        tone: brandTone,
        brandDna,
        competitorInsights,
      });

      posts.push(post);
    }

    return posts;
  }

  private extractTone(brandDna: BrandDna): string {
    const inferredTone = brandDna.inferred.find(i => i.startsWith("Tone:"));
    if (inferredTone?.includes("Energetic")) return "energetic";
    if (inferredTone?.includes("Measured")) return "measured";
    return "balanced";
  }

  private getTopFormats(insights: CompetitorInsight[]): string[] {
    const formatCounts: Record<string, number> = {};
    
    insights.forEach(insight => {
      insight.topFormats.forEach(format => {
        formatCounts[format] = (formatCounts[format] || 0) + 1;
      });
    });

    return Object.entries(formatCounts)
      .sort((a, b) => b[1] - a[1])
      .map(([format]) => format)
      .slice(0, 3);
  }

  private aggregateThemes(insights: CompetitorInsight[]): string[] {
    const themeCounts: Record<string, number> = {};
    
    insights.forEach(insight => {
      insight.commonThemes.forEach(theme => {
        themeCounts[theme] = (themeCounts[theme] || 0) + 1;
      });
    });

    return Object.entries(themeCounts)
      .sort((a, b) => b[1] - a[1])
      .map(([theme]) => theme)
      .slice(0, 5);
  }

  private createPost(params: {
    format: string;
    theme: string;
    tone: string;
    brandDna: BrandDna;
    competitorInsights: CompetitorInsight[];
  }): GeneratedPost {
    const { format, theme, tone, brandDna, competitorInsights } = params;

    // Generate caption based on tone and theme
    let caption = "";
    const emojis = ["🎵", "🔥", "✨", "💫", "🎧", "🎶", "⚡", "🌟"];
    
    if (tone === "energetic") {
      caption = `${emojis[Math.floor(Math.random() * emojis.length)]} READY FOR THIS? ${this.capitalizeFirst(theme)}-inspired vibes coming at you! `;
    } else if (tone === "measured") {
      caption = `Exploring ${theme} in our latest ${format}. `;
    } else {
      caption = `${this.capitalizeFirst(theme)} energy ✨ Check out our latest ${format}! `;
    }

    // Add context from brand DNA
    const avgEngagement = competitorInsights.reduce((sum, c) => sum + c.engagementAvg, 0) / competitorInsights.length;
    caption += `Join the community and experience what ${Math.round(avgEngagement)}+ others are loving!`;

    // Generate relevant hashtags
    const hashtags = this.generateHashtags(theme, format, brandDna);

    const reasoning = `Format "${format}" chosen based on top competitor performance. ` +
      `Theme "${theme}" aligns with ${competitorInsights.length} competitor insights. ` +
      `Tone "${tone}" matches brand DNA analysis.`;

    return {
      caption,
      hashtags,
      format,
      reasoning,
    };
  }

  private generateHashtags(theme: string, format: string, brandDna: BrandDna): string[] {
    const baseHashtags = ["#EDM", "#ElectronicMusic", "#DanceMusic"];
    const themeHashtags = [`#${this.capitalizeFirst(theme)}`, `#${theme}vibes`];
    const formatHashtags = format === "reel" ? ["#Reels", "#InstaReels"] : ["#Carousel", "#InstaPost"];
    
    // Extract hashtag strategy from brand DNA
    const usesHashtags = brandDna.observed.some(o => o.includes("Hashtag strategy: Active"));
    
    if (usesHashtags) {
      return [...baseHashtags, ...themeHashtags, ...formatHashtags].slice(0, 8);
    }
    
    return [...baseHashtags, ...themeHashtags].slice(0, 5);
  }

  private capitalizeFirst(str: string): string {
    return str.charAt(0).toUpperCase() + str.slice(1);
  }
}
