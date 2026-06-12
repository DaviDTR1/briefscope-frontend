import { api } from './client'
import type { Document } from '../types/api'

export const getDocuments = async (projectId: number): Promise<Document[]> => {
  const { data } = await api.get(`/projects/${projectId}/documents`)
  return data
}

export const uploadDocument = async (projectId: number, file: File): Promise<Document> => {
  const form = new FormData()
  form.append('file', file)
  const { data } = await api.post(`/projects/${projectId}/documents`, form, {
    headers: { 'Content-Type': 'multipart/form-data' },
  })
  return data
}

export const deleteDocument = async (docId: number): Promise<void> => {
  await api.delete(`/documents/${docId}`)
}
