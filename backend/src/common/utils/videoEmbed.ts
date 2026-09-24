// Validates and normalizes YouTube/Vimeo URLs into a safe embed URL.
// We never accept raw iframe/HTML from the client — only the source URL,
// which we validate against a strict allowlist of domains here.

interface EmbedResult {
  embedUrl: string;
  thumbnailUrl?: string;
  provider: "YOUTUBE" | "VIMEO";
}

export function resolveVideoEmbed(rawUrl: string): EmbedResult | null {
  let parsed: URL;
  try {
    parsed = new URL(rawUrl);
  } catch {
    return null;
  }

  const host = parsed.hostname.replace(/^www\./, "");

  if (host === "youtube.com" || host === "m.youtube.com" || host === "youtu.be") {
    let videoId: string | null = null;

    if (host === "youtu.be") {
      videoId = parsed.pathname.slice(1);
    } else if (parsed.pathname === "/watch") {
      videoId = parsed.searchParams.get("v");
    } else if (parsed.pathname.startsWith("/embed/")) {
      videoId = parsed.pathname.split("/embed/")[1];
    }

    if (!videoId || !/^[a-zA-Z0-9_-]{6,20}$/.test(videoId)) return null;

    return {
      provider: "YOUTUBE",
      embedUrl: `https://www.youtube.com/embed/${videoId}`,
      thumbnailUrl: `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`,
    };
  }

  if (host === "vimeo.com" || host === "player.vimeo.com") {
    const match = parsed.pathname.match(/(\d{6,12})/);
    if (!match) return null;
    const videoId = match[1];

    return {
      provider: "VIMEO",
      embedUrl: `https://player.vimeo.com/video/${videoId}`,
    };
  }

  return null;
}
