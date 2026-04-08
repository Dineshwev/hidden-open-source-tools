import { supabaseAdmin, supabasePublic } from "@/lib/backend_lib/supabase-scraper";
import type { AdminReply, ContactMessage, PublicQueryThread } from "@/lib/types/contact.types";

const CONTACT_MESSAGE_FIELDS =
  "id, message, mode, social_handle, email, is_read, is_private, thread_id, created_at";
const ADMIN_REPLY_FIELDS = "id, message_id, reply_text, is_public, created_at";

type AdminMessageRecord = ContactMessage & {
  reply: AdminReply | null;
};

function getPublicClient() {
  if (!supabasePublic) {
    throw new Error("Supabase public client is not configured");
  }

  return supabasePublic;
}

function normalizePage(page: number) {
  return Number.isFinite(page) ? Math.max(1, Math.floor(page)) : 1;
}

function normalizeLimit(limit: number) {
  return Number.isFinite(limit) ? Math.max(1, Math.floor(limit)) : 10;
}

async function fetchLatestReply(client: typeof supabasePublic, messageId: string) {
  const { data, error } = await client
    .from("admin_replies")
    .select(ADMIN_REPLY_FIELDS)
    .eq("message_id", messageId)
    .order("created_at", { ascending: false })
    .limit(1);

  if (error) {
    throw error;
  }

  const reply = (data?.[0] ?? null) as AdminReply | null;

  if (!reply) {
    return null;
  }

  const { count, error: countError } = await client
    .from("query_reactions")
    .select("id", { count: "exact", head: true })
    .eq("reply_id", reply.id)
    .eq("reaction", "helpful");

  if (countError) {
    throw countError;
  }

  return {
    ...reply,
    helpful_count: count ?? 0
  } as AdminReply;
}

async function fetchFollowUps(client: typeof supabasePublic, parentId: string) {
  const { data, error } = await client
    .from("contact_messages")
    .select(CONTACT_MESSAGE_FIELDS)
    .eq("thread_id", parentId)
    .order("created_at", { ascending: true });

  if (error) {
    throw error;
  }

  return (data ?? []) as ContactMessage[];
}

async function buildPublicQueryThread(
  client: typeof supabasePublic,
  message: ContactMessage,
  includeFollowUps: boolean
): Promise<PublicQueryThread> {
  const [reply, followUps] = await Promise.all([
    fetchLatestReply(client, message.id),
    includeFollowUps ? fetchFollowUps(client, message.id) : Promise.resolve([] as ContactMessage[])
  ]);

  return {
    message,
    reply,
    helpful_count: reply?.helpful_count ?? 0,
    follow_ups: followUps
  };
}

export async function sendMessage(data: {
  message: string;
  mode: "identified" | "anonymous";
  social_handle?: string;
  email?: string;
  thread_id?: string;
}) {
  const payload = {
    message: data.message,
    mode: data.mode,
    social_handle: data.social_handle ?? null,
    email: data.email ?? null,
    thread_id: data.thread_id ?? null,
    is_private: data.mode === "identified",
    is_read: false
  };

  const { data: insertedMessage, error } = await supabaseAdmin
    .from("contact_messages")
    .insert(payload)
    .select(CONTACT_MESSAGE_FIELDS)
    .single();

  if (error) {
    throw error;
  }

  return insertedMessage as ContactMessage;
}

export async function getPublicQueries(page: number, limit: number) {
  const client = getPublicClient();
  const currentPage = normalizePage(page);
  const pageSize = normalizeLimit(limit);
  const start = (currentPage - 1) * pageSize;
  const end = start + pageSize - 1;

  const { data, error } = await client
    .from("contact_messages")
    .select(CONTACT_MESSAGE_FIELDS)
    .eq("mode", "anonymous")
    .eq("is_private", false)
    .is("thread_id", null)
    .order("created_at", { ascending: false })
    .range(start, end);

  if (error) {
    throw error;
  }

  const messages = (data ?? []) as ContactMessage[];

  return Promise.all(messages.map((message) => buildPublicQueryThread(client, message, true)));
}

export async function getThreadReplies(thread_id: string) {
  const client = getPublicClient();

  const { data: rootMessage, error: rootError } = await client
    .from("contact_messages")
    .select(CONTACT_MESSAGE_FIELDS)
    .eq("id", thread_id)
    .maybeSingle();

  if (rootError) {
    throw rootError;
  }

  if (!rootMessage) {
    return [] as PublicQueryThread[];
  }

  const followUps = await fetchFollowUps(client, thread_id);
  const threadMessages = [rootMessage as ContactMessage, ...followUps];

  return Promise.all(threadMessages.map((message) => buildPublicQueryThread(client, message, false)));
}

export async function addReaction(reply_id: string, reaction: "helpful" | "not_helpful") {
  const { error } = await supabaseAdmin.from("query_reactions").insert({ reply_id, reaction });

  if (error) {
    throw error;
  }

  return { success: true };
}

export async function getAllMessagesAdmin(page = 1, limit = 10) {
  const currentPage = normalizePage(page);
  const pageSize = normalizeLimit(limit);
  const start = (currentPage - 1) * pageSize;
  const end = start + pageSize - 1;

  const { count, error: countError } = await supabaseAdmin
    .from("contact_messages")
    .select("id", { count: "exact", head: true });

  if (countError) {
    throw countError;
  }

  const { data, error } = await supabaseAdmin
    .from("contact_messages")
    .select(CONTACT_MESSAGE_FIELDS)
    .order("created_at", { ascending: false })
    .range(start, end);

  if (error) {
    throw error;
  }

  const messages = (data ?? []) as ContactMessage[];

  const { data: pagedReplies, error: repliesError } = messages.length
    ? await supabaseAdmin
      .from("admin_replies")
      .select(ADMIN_REPLY_FIELDS)
      .in(
        "message_id",
        messages.map((message) => message.id)
      )
      .order("created_at", { ascending: false })
    : { data: [], error: null };

  if (repliesError) {
    throw repliesError;
  }

  const { data: allReplies, error: allRepliesError } = await supabaseAdmin
    .from("admin_replies")
    .select(ADMIN_REPLY_FIELDS)
    .order("created_at", { ascending: false });

  if (allRepliesError) {
    throw allRepliesError;
  }

  const latestRepliesByMessageId = new Map<string, AdminReply>();

  for (const reply of (pagedReplies ?? []) as AdminReply[]) {
    if (!latestRepliesByMessageId.has(reply.message_id)) {
      latestRepliesByMessageId.set(reply.message_id, reply);
    }
  }

  const { count: unreadCount = 0 } = await supabaseAdmin
    .from("contact_messages")
    .select("id", { count: "exact", head: true })
    .eq("is_read", false);

  const repliedMessageIds = new Set((allReplies ?? []).map((reply) => reply.message_id));
  const awaitingReplyCount = count ? Math.max(0, count - repliedMessageIds.size) : 0;

  return {
    data: messages.map((message) => ({
      ...message,
      reply: latestRepliesByMessageId.get(message.id) || null
    })) as AdminMessageRecord[],
    totalPages: Math.max(1, Math.ceil((count ?? 0) / pageSize)),
    count: count ?? 0,
    currentPage,
    unreadCount: unreadCount ?? 0,
    awaitingReplyCount
  };
}

export async function replyToMessage(message_id: string, reply_text: string, is_public: boolean) {
  const { data: reply, error: replyError } = await supabaseAdmin
    .from("admin_replies")
    .insert({
      message_id,
      reply_text,
      is_public
    })
    .select(ADMIN_REPLY_FIELDS)
    .single();

  if (replyError) {
    throw replyError;
  }

  const updatePayload: { is_read: boolean; is_private?: boolean } = {
    is_read: true
  };

  if (is_public) {
    updatePayload.is_private = false;
  }

  const { error: messageError } = await supabaseAdmin
    .from("contact_messages")
    .update(updatePayload)
    .eq("id", message_id);

  if (messageError) {
    throw messageError;
  }

  return reply as AdminReply;
}

export async function markAsRead(message_id: string) {
  const { error } = await supabaseAdmin
    .from("contact_messages")
    .update({ is_read: true })
    .eq("id", message_id);

  if (error) {
    throw error;
  }

  return { success: true };
}