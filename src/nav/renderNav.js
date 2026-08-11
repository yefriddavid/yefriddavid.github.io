import React from 'react'
import CIcon from '@coreui/icons-react'
import * as icons from '@coreui/icons'
import { CNavGroup, CNavItem } from '@coreui/react'

const getLabel = (node, t) => {
  if (node.tKey) {
    const translated = t(node.tKey)
    if (translated !== node.tKey) return translated
  }
  return node.name
}

const isVisible = (node, role) => !node.hideForRoles || !role || !node.hideForRoles.includes(role)

// Hydrates plain nav JSON (name/tKey/to/icon/items/hideForRoles) into the
// CoreUI CNavItem/CNavGroup tree AppSidebar expects — keeps the data itself
// free of JSX/components so it can later come from Firestore instead of a file.
export const buildNav = (nodes, { t = (key) => key, role = null } = {}) =>
  nodes
    .filter((node) => isVisible(node, role))
    .map((node) => {
      const entry = {
        component: node.type === 'group' ? CNavGroup : CNavItem,
        name: getLabel(node, t),
      }
      if (node.to) entry.to = node.to
      if (node.icon) entry.icon = <CIcon icon={icons[node.icon]} customClassName="nav-icon" />
      if (node.items) entry.items = buildNav(node.items, { t, role })
      return entry
    })
