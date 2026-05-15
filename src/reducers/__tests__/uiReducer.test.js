import { describe, it, expect, vi } from 'vitest'
import reducer, { setUi } from '../uiReducer'

describe('uiReducer', () => {
  it('returns state with known shape', () => {
    const s = reducer(undefined, { type: '@@INIT' })
    expect(typeof s.sidebarShow).toBe('boolean')
    expect(typeof s.sidebarUnfoldable).toBe('boolean')
    expect(typeof s.headerShow).toBe('boolean')
    expect(typeof s.appTheme).toBe('string')
  })

  describe('setUi', () => {
    it('merges partial updates into state', () => {
      const s0 = reducer(undefined, { type: '@@INIT' })
      const s1 = reducer(s0, setUi({ sidebarUnfoldable: true }))
      expect(s1.sidebarUnfoldable).toBe(true)
    })

    it('setting appTheme updates the field', () => {
      const s0 = reducer(undefined, { type: '@@INIT' })
      const s1 = reducer(s0, setUi({ appTheme: 'dark' }))
      expect(s1.appTheme).toBe('dark')
    })

    it('persists appTheme to localStorage', () => {
      const spy = vi.spyOn(localStorage, 'setItem')
      reducer(undefined, setUi({ appTheme: 'ocean' }))
      expect(spy).toHaveBeenCalledWith('app-theme', 'ocean')
      spy.mockRestore()
    })

    it('persists sidebarShow to localStorage', () => {
      const spy = vi.spyOn(localStorage, 'setItem')
      reducer(undefined, setUi({ sidebarShow: false }))
      expect(spy).toHaveBeenCalledWith('sidebar-show', false)
      spy.mockRestore()
    })

    it('persists headerShow to localStorage', () => {
      const spy = vi.spyOn(localStorage, 'setItem')
      reducer(undefined, setUi({ headerShow: false }))
      expect(spy).toHaveBeenCalledWith('header-show', false)
      spy.mockRestore()
    })

    it('does not persist sidebarUnfoldable', () => {
      const spy = vi.spyOn(localStorage, 'setItem')
      reducer(undefined, setUi({ sidebarUnfoldable: true }))
      expect(spy).not.toHaveBeenCalled()
      spy.mockRestore()
    })

    it('does not affect unrelated state keys when updating one', () => {
      const s0 = reducer(undefined, { type: '@@INIT' })
      const s1 = reducer(s0, setUi({ appTheme: 'blue' }))
      expect(s1.sidebarShow).toBe(s0.sidebarShow)
      expect(s1.headerShow).toBe(s0.headerShow)
      expect(s1.sidebarUnfoldable).toBe(s0.sidebarUnfoldable)
    })
  })
})
