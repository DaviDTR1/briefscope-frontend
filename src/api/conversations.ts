import { api } from './client'
import type { Conversation, ConversationDetail } from '../types/api'

export const getConversations = async (projectId: number): Promise<Conversation[]> => {
  const { data } = await api.get(`/projects/${projectId}/conversations`)
  return data
}

export const getConversation = async (convId: number): Promise<ConversationDetail> => {
  const { data } = await api.get(`/conversations/${convId}`)
  return data
}

export const deleteConversation = async (convId: number): Promise<void> => {
  await api.delete(`/conversations/${convId}`)
}
