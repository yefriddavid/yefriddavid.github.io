/**
 * @vitest-environment jsdom
 *
 * Regression test for the double-prefix bug in AppContent.
 *
 * Root cause: AppContent is rendered as element of <Route path="/finance/*">.
 * React Router v6 strips the matched prefix (/finance/) before the inner
 * <Routes> sees the remaining path. Finance routes must therefore be
 * registered WITHOUT the /finance prefix (just route.path) so they match.
 *
 * Bug: financeRoutes were registered as `/finance${route.path}` (e.g.
 * /finance/dashboard). When the inner Routes received the stripped path
 * "dashboard", no route matched → blank page.
 *
 * Fix: register as `route.path` (e.g. /dashboard) so the stripped path
 * matches correctly.
 */
import React from 'react'
import { render, screen } from '@testing-library/react'
import { MemoryRouter, Route, Routes } from 'react-router-dom'
import { describe, it, expect } from 'vitest'

const Dashboard = () => <div>Finance Dashboard</div>

// Simulates AppContent's inner <Routes> with the FIXED registration (no prefix).
const InnerRoutesFixed = () => (
  <Routes>
    <Route path="/dashboard" element={<Dashboard />} />
  </Routes>
)

// Simulates the OLD broken registration (with /finance prefix).
const InnerRoutesBroken = () => (
  <Routes>
    <Route path="/finance/dashboard" element={<Dashboard />} />
  </Routes>
)

// Wraps the inner routes inside the /finance/* parent, mirroring App.js.
const withFinanceParent = (InnerRoutes, url) =>
  render(
    <MemoryRouter initialEntries={[url]}>
      <Routes>
        <Route path="/finance/*" element={<InnerRoutes />} />
      </Routes>
    </MemoryRouter>,
  )

describe('AppContent finance route prefix — React Router v6 prefix stripping', () => {
  it('renders the component when route has no /finance prefix (fixed behavior)', () => {
    withFinanceParent(InnerRoutesFixed, '/finance/dashboard')
    expect(screen.queryByText('Finance Dashboard')).not.toBeNull()
  })

  it('does NOT render when route has /finance prefix inside /finance/* context (old broken behavior)', () => {
    withFinanceParent(InnerRoutesBroken, '/finance/dashboard')
    // The double prefix causes no match → component never renders
    expect(screen.queryByText('Finance Dashboard')).toBeNull()
  })

  it('does not render a finance route when URL does not contain the matching segment', () => {
    render(
      <MemoryRouter initialEntries={['/finance/other']}>
        <Routes>
          <Route path="/finance/*" element={<InnerRoutesFixed />} />
        </Routes>
      </MemoryRouter>,
    )
    // /other does not match /dashboard — finance dashboard should not render
    expect(screen.queryByText('Finance Dashboard')).toBeNull()
  })
})
