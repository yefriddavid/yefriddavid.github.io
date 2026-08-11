import React from 'react'
import CIcon from '@coreui/icons-react'
import {
  cibBitcoin,
  cil3d,
  cilArrowThickFromBottom,
  cilBalanceScale,
  cilBank,
  cilBarChart,
  cilBasket,
  cilBell,
  cilBook,
  cilBug,
  cilCalculator,
  cilCalendarCheck,
  cilCarAlt,
  cilCash,
  cilChart,
  cilChartLine,
  cilCheck,
  cilCode,
  cilCut,
  cilDollar,
  cilEnvelopeClosed,
  cilExitToApp,
  cilFile,
  cilFolder,
  cilGroup,
  cilHome,
  cilImage,
  cilLayers,
  cilLightbulb,
  cilList,
  cilListHighPriority,
  cilLocationPin,
  cilMoon,
  cilNotes,
  cilPeople,
  cilSettings,
  cilShareBoxed,
  cilSpeedometer,
  cilSpreadsheet,
  cilSun,
  cilSwapHorizontal,
  cilSwapVertical,
  cilTerminal,
  cilTransfer,
  cilTrash,
  cilUser,
  cilWallet,
  cilWarning,
} from '@coreui/icons'
import { CNavGroup, CNavItem } from '@coreui/react'

// Icon lookup by the string name stored in the nav JSON — explicit named
// imports (not `import *`) so bundlers can tree-shake unused CoreUI icons.
const ICONS = {
  cibBitcoin,
  cil3d,
  cilArrowThickFromBottom,
  cilBalanceScale,
  cilBank,
  cilBarChart,
  cilBasket,
  cilBell,
  cilBook,
  cilBug,
  cilCalculator,
  cilCalendarCheck,
  cilCarAlt,
  cilCash,
  cilChart,
  cilChartLine,
  cilCheck,
  cilCode,
  cilCut,
  cilDollar,
  cilEnvelopeClosed,
  cilExitToApp,
  cilFile,
  cilFolder,
  cilGroup,
  cilHome,
  cilImage,
  cilLayers,
  cilLightbulb,
  cilList,
  cilListHighPriority,
  cilLocationPin,
  cilMoon,
  cilNotes,
  cilPeople,
  cilSettings,
  cilShareBoxed,
  cilSpeedometer,
  cilSpreadsheet,
  cilSun,
  cilSwapHorizontal,
  cilSwapVertical,
  cilTerminal,
  cilTransfer,
  cilTrash,
  cilUser,
  cilWallet,
  cilWarning,
}

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
      if (node.icon) entry.icon = <CIcon icon={ICONS[node.icon]} customClassName="nav-icon" />
      if (node.items) entry.items = buildNav(node.items, { t, role })
      return entry
    })
