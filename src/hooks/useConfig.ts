import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { getConfig, updateConfig } from '../api/config'
import type { ConfigUpdate } from '../types/api'

export function useConfig() {
  return useQuery({ queryKey: ['config'], queryFn: getConfig, staleTime: 30_000 })
}

export function useUpdateConfig() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (body: ConfigUpdate) => updateConfig(body),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['config'] }),
  })
}
