import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { getDocuments, uploadDocument, deleteDocument } from '../api/documents'

export function useDocuments(projectId: number) {
  return useQuery({
    queryKey: ['documents', projectId],
    queryFn: () => getDocuments(projectId),
    enabled: !!projectId,
  })
}

export function useUploadDocument(projectId: number) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (file: File) => uploadDocument(projectId, file),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['documents', projectId] })
      qc.invalidateQueries({ queryKey: ['projects', projectId] })
      qc.invalidateQueries({ queryKey: ['projects'] })
    },
  })
}

export function useDeleteDocument(projectId: number) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (docId: number) => deleteDocument(docId),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['documents', projectId] })
      qc.invalidateQueries({ queryKey: ['projects'] })
    },
  })
}
