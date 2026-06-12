// ── Projects ─────────────────────────────────────────────────────────────────
export interface Project {
  id: number
  name: string
  description: string
  instructions: string
  created_at: string
  updated_at: string
  document_count: number
  total_tokens: number
}

export interface ProjectCreate {
  name: string
  description?: string
  instructions?: string
}

export interface ProjectUpdate {
  name?: string
  description?: string
  instructions?: string
}

// ── Documents ─────────────────────────────────────────────────────────────────
export interface Document {
  id: number
  project_id: number
  filename: string
  file_type: string
  token_count: number
  created_at: string
}

// ── Conversations ─────────────────────────────────────────────────────────────
export interface Conversation {
  id: number
  project_id: number
  title: string
  created_at: string
  updated_at: string
  message_count: number
}

export interface Message {
  id: number
  role: 'user' | 'assistant'
  content: string
  created_at: string
}

export interface ConversationDetail extends Conversation {
  messages: Message[]
}

// ── Chat ──────────────────────────────────────────────────────────────────────
export interface ChatRequest {
  message: string
  conversation_id?: number
}

// SSE event payloads
export interface SseMeta {
  conversation_id: number
  mode: string
  rag_used: boolean
}

export interface SseFileReady {
  filename: string
  url: string
  label: string
}

// ── Config ────────────────────────────────────────────────────────────────────
export interface Config {
  llm_mode: 'cloud' | 'local'
  cloud_provider: 'anthropic' | 'openai' | 'google'
  cloud_model: string
  ollama_host?: string
  ollama_model?: string
  anthropic_api_key_set: boolean
  openai_api_key_set: boolean
  google_api_key_set: boolean
  cloud_ready: boolean
  rag_threshold_tokens: number
  rag_top_k: number
  history_compact_after: number
}

export interface ConfigUpdate {
  cloud_provider?: string
  cloud_model?: string
  ollama_host?: string
  ollama_model?: string
  anthropic_api_key?: string
  openai_api_key?: string
  google_api_key?: string
  rag_threshold_tokens?: number
  rag_top_k?: number
  history_compact_after?: number
}

export interface ConfigStatus {
  llm_mode: string
  cloud_ready: boolean | null
  needs_setup: boolean
}
