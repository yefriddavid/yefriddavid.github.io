import { describe, it, expect } from 'vitest'
import routes from '../routes'

describe('Routes Configuration', () => {
  it('should be an array', () => {
    expect(Array.isArray(routes)).toBe(true)
  })

  it('should have a path and element for each route', () => {
    routes.forEach((route) => {
      expect(route).toHaveProperty('path')
      expect(route).toHaveProperty('element')
    })
  })

  it('should have unique paths', () => {
    const paths = routes.map((route) => route.path)
    const uniquePaths = new Set(paths)
    expect(uniquePaths.size).toBe(paths.length)
  })

  it('should have valid roles if defined', () => {
    routes.forEach((route) => {
      if (route.roles) {
        expect(Array.isArray(route.roles)).toBe(true)
        route.roles.forEach((role) => {
          expect(typeof role).toBe('string')
        })
      }
    })
  })
})
