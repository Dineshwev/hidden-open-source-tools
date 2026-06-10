import { NextResponse } from "next/server";

function parseRepo(value: string | null) {
  const repo = (value || "").trim();

  if (!/^[a-zA-Z0-9_.-]+\/[a-zA-Z0-9_.-]+$/.test(repo)) {
    return null;
  }

  return repo;
}

export async function GET(req: Request) {
  try {
    const url = new URL(req.url);
    const repo = parseRepo(url.searchParams.get("repo"));

    if (!repo) {
      return NextResponse.json({ error: "Invalid repo query parameter" }, { status: 400 });
    }

    const headers: HeadersInit = {
      Accept: "application/vnd.github+json",
      "X-GitHub-Api-Version": "2022-11-28"
    };

    const githubToken = process.env.GITHUB_TOKEN?.trim();
    if (githubToken) {
      headers.Authorization = `Bearer ${githubToken}`;
    }

    const response = await fetch(`https://api.github.com/repos/${repo}`, {
      headers,
      next: {
        revalidate: 3600
      }
    });

    if (!response.ok) {
      return NextResponse.json({ error: "Failed to fetch GitHub repository" }, { status: response.status });
    }

    const data = await response.json();

    return NextResponse.json({
      stars: Number(data?.stargazers_count || 0),
      forks: Number(data?.forks_count || 0),
      language: data?.language || null,
      license: data?.license?.spdx_id || null
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Internal server error";
    console.error("[github-stars] Fetch failed:", message);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
