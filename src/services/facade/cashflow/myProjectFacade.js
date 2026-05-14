import * as idb from '../../idb/cashflow/myProjects'
import * as fb from '../../firebase/cashflow/myProjects'

export const getAllProjects = idb.getAllProjects
export const saveProject = idb.saveProject
export const deleteProject = idb.deleteProject

export const syncProject = async (project) => {
  await fb.syncProjectToFirebase(project)
  const syncedAt = new Date().toISOString()
  const updated = { ...project, syncedAt }
  await idb.saveProject(updated)
  return { id: project.id, syncedAt }
}

export const syncAll = async (projects) => {
  const now = new Date().toISOString()
  for (const project of projects) {
    await fb.syncProjectToFirebase(project)
    await idb.saveProject({ ...project, syncedAt: now })
  }
  return projects.map((p) => ({ id: p.id, syncedAt: now }))
}

export const importFromFirebase = async () => {
  const projects = await fb.fetchAllFromFirebase()
  for (const project of projects) await idb.saveProject(project)
  return projects
}
