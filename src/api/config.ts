import { api } from './client'
import type { Config, ConfigUpdate, ConfigStatus } from '../types/api'

export const getConfig = async (): Promise<Config> => {
  const { data } = await api.get('/config/')
  return data
}

export const updateConfig = async (body: ConfigUpdate): Promise<Config> => {
  const { data } = await api.post('/config/', body)
  return data
}

export const getConfigStatus = async (): Promise<ConfigStatus> => {
  const { data } = await api.get('/config/status')
  return data
}

export const getOllamaModels = async (): Promise<string[]> => {
  const { data } = await api.get('/config/ollama/models')
  return data.models ?? []
}
