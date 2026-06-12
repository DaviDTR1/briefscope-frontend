import { api } from './client'
import type { Conversation, ConversationDetail } from '../types/api'

export const getConversations = async (projectId: number): Promise<Conversation[]> => {
  const { data } = await api.get(`/projects/${projectId}/conversations`)
  return data
}

export const getConversation = async (
  projectId: number,
  convId: number,
): Promise<ConversationDetail> => {
  const { data } = await api.get(`/projects/${projectId}/conversations/${convId}`)
  return data
}

export const deleteConversation = async (
  projectId: number,
  convId: number,
): Promise<void> => {
  await api.delete(`/projects/${projectId}/conversations/${convId}`)
}
