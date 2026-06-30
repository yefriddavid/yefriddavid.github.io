import React from 'react'

const Pictures = React.lazy(() => import('./views/Finance/Pictures'))
const PicturesEditor = React.lazy(() => import('./views/Finance/PicturesEditor'))
const Scenes3D = React.lazy(() => import('./views/Finance/Scenes3D'))
const Scenes3DEditor = React.lazy(() => import('./views/Finance/Scenes3DEditor'))
const TasksPage = React.lazy(() => import('./views/Tasks/TasksPage'))
const Bastidor = React.lazy(() => import('./views/Miscelanea/Bastidor'))
const Notes = React.lazy(() => import('./views/Miscelanea/Notes'))
const NoteFullPage = React.lazy(() => import('./views/Miscelanea/Notes/NoteFullPage'))
const DocumentTemplates = React.lazy(() => import('./views/Miscelanea/Documents/Templates'))
// Paths are relative to the /miscelanea/* parent route (no /miscelanea prefix)
const miscelaneaRoutes = [
  { path: '/tasks', element: TasksPage, landingPage: true },
  { path: '/bastidor', element: Bastidor },
  { path: '/notes', element: Notes },
  { path: '/notes/:noteId', element: NoteFullPage },
  { path: '/pictures', element: Pictures, landingPage: true },
  { path: '/pictures/:id', element: PicturesEditor },
  { path: '/scenes3d', element: Scenes3D, landingPage: true },
  { path: '/scenes3d/:id', element: Scenes3DEditor },
  { path: '/documents/templates', element: DocumentTemplates },
]

export default miscelaneaRoutes
