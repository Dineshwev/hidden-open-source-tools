export interface ContactMessage {
  id: string;
  message: string;
  mode: "identified" | "anonymous";
  social_handle: string | null;
  email: string | null;
  is_read: boolean;
  is_private: boolean;
  thread_id: string | null;
  created_at: string;
}

export interface AdminReply {
  id: string;
  message_id: string;
  reply_text: string;
  is_public: boolean;
  created_at: string;
  helpful_count?: number;
}

export interface QueryReaction {
  id: string;
  reply_id: string;
  reaction: "helpful" | "not_helpful";
  created_at: string;
}

export interface PublicQueryThread {
  message: ContactMessage;
  reply: AdminReply | null;
  helpful_count: number;
  follow_ups: ContactMessage[];
}
