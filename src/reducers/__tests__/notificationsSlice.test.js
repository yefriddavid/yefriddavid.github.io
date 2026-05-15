import { describe, it, expect } from 'vitest'
import reducer, { push, dismiss } from '../notificationsSlice'

describe('notificationsSlice', () => {
  it('returns empty array as initial state', () => {
    expect(reducer(undefined, { type: '@@INIT' })).toEqual([])
  })

  describe('push', () => {
    it('adds a notification with auto-generated id', () => {
      const s = reducer([], push({ message: 'Hello', type: 'info' }))
      expect(s).toHaveLength(1)
      expect(s[0].message).toBe('Hello')
      expect(s[0].type).toBe('info')
      expect(typeof s[0].id).toBe('number')
    })

    it('appends so notifications accumulate in insertion order', () => {
      let s = reducer([], push({ message: 'First' }))
      s = reducer(s, push({ message: 'Second' }))
      expect(s[0].message).toBe('First')
      expect(s[1].message).toBe('Second')
    })

    it('each notification gets a unique id', () => {
      let s = reducer([], push({ message: 'A' }))
      s = reducer(s, push({ message: 'B' }))
      expect(s[0].id).not.toBe(s[1].id)
    })
  })

  describe('dismiss', () => {
    it('removes notification by id', () => {
      let s = reducer([], push({ message: 'Keep' }))
      s = reducer(s, push({ message: 'Remove' }))
      const removeId = s[1].id  // 'Remove' is at index 1 (appended last)
      s = reducer(s, dismiss(removeId))
      expect(s).toHaveLength(1)
      expect(s[0].message).toBe('Keep')
    })

    it('does nothing when id does not exist', () => {
      let s = reducer([], push({ message: 'Notification' }))
      s = reducer(s, dismiss(99999999))
      expect(s).toHaveLength(1)
    })

    it('returns empty array when last notification is dismissed', () => {
      let s = reducer([], push({ message: 'Solo' }))
      const id = s[0].id
      s = reducer(s, dismiss(id))
      expect(s).toEqual([])
    })
  })
})
