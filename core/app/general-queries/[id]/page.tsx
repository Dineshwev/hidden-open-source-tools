import type { Metadata } from "next";
import GeneralQueryThreadClient from "@/components/contact/GeneralQueryThreadClient";
import { getThreadReplies } from "@/lib/services/contact.service";

type ThreadPageProps = {
  params: {
    id: string;
  };
};

export async function generateMetadata({ params }: ThreadPageProps): Promise<Metadata> {
  let title = "General Query Thread";
  let description = "Follow a shareable public question thread and continue the conversation anonymously.";

  try {
    const thread = await getThreadReplies(params.id);
    const rootMessage = thread[0]?.message;
    const rootReply = thread[0]?.reply;

    if (rootMessage) {
      const summary = rootMessage.message.trim();
      const snippet = summary.length > 120 ? `${summary.slice(0, 120).trimEnd()}...` : summary;

      title = `General Query Thread | ${snippet}`;
      description = rootReply
        ? `${snippet} - Public reply: ${rootReply.reply_text.slice(0, 140)}${rootReply.reply_text.length > 140 ? "..." : ""}`
        : `${snippet} - Follow the conversation anonymously.`;
    }
  } catch {
    // Keep the fallback metadata if the thread cannot be loaded during build/request time.
  }

  return {
    title,
    description,
    robots: {
      index: false,
      follow: true
    },
    openGraph: {
      title,
      description,
      url: `/general-queries/${params.id}`,
      type: "article"
    },
    twitter: {
      card: "summary_large_image",
      title,
      description
    },
    alternates: {
      canonical: `/general-queries/${params.id}`
    }
  };
}

export default function GeneralQueryThreadPage({ params }: ThreadPageProps) {
  return <GeneralQueryThreadClient threadId={params.id} />;
}
