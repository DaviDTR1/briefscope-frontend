import { api } from './client'
import type { Project, ProjectCreate, ProjectUpdate } from '../types/api'

export const getProjects = async (): Promise<Project[]> => {
  const { data } = await api.get('/projects/')
  return data
}

export const getProject = async (id: number): Promise<Project> => {
  const { data } = await api.get(`/projects/${id}`)
  return data
}

export const createProject = async (body: ProjectCreate): Promise<Project> => {
  const { data } = await api.post('/projects/', body)
  return data
}

export const updateProject = async (id: number, body: ProjectUpdate): Promise<Project> => {
  const { data } = await api.patch(`/projects/${id}`, body)
  return data
}

export const deleteProject = async (id: number): Promise<void> => {
  await api.delete(`/projects/${id}`)
}
