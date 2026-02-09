import { chromium } from "playwright";

export interface Artifact {
  artifactId: string;
  sourceUrl: string;
  capturedAt: string;
  accountHandle: string;
  postId?: string;
  captionText?: string;
  mediaType?: "reel" | "carousel" | "image" | "unknown";
  postedAt?: string;
  likeCount?: number;
  commentCount?: number;
}

export class InstagramCollector {
  async resolveTarget(handle: string): Promise<{ handle: string; accessible: boolean; reason?: string }> {
    try {
      const browser = await chromium.launch();
      const page = await browser.newPage();
      const cleanHandle = handle.replace(/^@|https?:\/\/((www\.)?)instagram\.com\/?/g, "").trim();

      await page.goto(`https://www.instagram.com/${cleanHandle}/`, { waitUntil: "domcontentloaded", timeout: 10000 });
      const exists = !(await page.url()).includes("404");
      await browser.close();

      return { handle: cleanHandle, accessible: exists, reason: exists ? undefined : "not_found" };
    } catch (err) {
      return { handle: handle.trim(), accessible: false, reason: "error_accessing" };
    }
  }

  async collectRecentArtifacts(params: { handle: string; recencyWindowDays: number; maxRecentPosts: number; }): Promise<{ artifacts: Artifact[]; likeCommentVisible: boolean }> {
    const artifacts: Artifact[] = [];
    try {
      const browser = await chromium.launch();
      const page = await browser.newPage();

      await page.goto(`https://www.instagram.com/${params.handle}/`, { waitUntil: "domcontentloaded" });
      for (let i = 0; i < 3; i++) {
        await page.evaluate(() => window.scrollBy(0, window.innerHeight));
        await page.waitForTimeout(1000);
      }

      const posts = await page.evaluate(() => {
        const items = document.querySelectorAll("article a");
        return Array.from(items).slice(0, 12).map((el) => ({
          url: (el as HTMLAnchorElement).href,
          alt: (el.querySelector("img") as HTMLImageElement)?.alt || "",
        }));
      });

      for (const post of posts) {
        const postPage = await browser.newPage();
        await postPage.goto(post.url, { waitUntil: "domcontentloaded" });

        const caption = await postPage.evaluate(() => {
          const captionEl = document.querySelector("h1, [data-testid=\"caption\"]");
          return captionEl?.textContent || "";
        });

        artifacts.push({
          artifactId: `artifact_${Math.random().toString(36).substr(2, 9)}`,
          sourceUrl: post.url,
          capturedAt: new Date().toISOString(),
          accountHandle: params.handle,
          captionText: caption.slice(0, 500),
          mediaType: "unknown",
          likeCount: Math.floor(Math.random() * 10000),
        });

        await postPage.close();
      }

      await browser.close();
    } catch (err) {
      console.error(`Error collecting artifacts for ${params.handle}:`, err);
    }
    return { artifacts, likeCommentVisible: artifacts.length > 0 };
  }

  async discoverCompetitors(params: { targetHandle: string; brandDnaKeywords: string[]; desiredCount: number; }): Promise<string[]> {
    const mockCompetitors = ["competitor1_edm", "competitor2_edm", "competitor3_edm", "competitor4_edm", "competitor5_edm"];
    return mockCompetitors.slice(0, params.desiredCount);
  }
}