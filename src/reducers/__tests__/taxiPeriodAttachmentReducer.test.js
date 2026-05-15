import { describe, it, expect } from 'vitest'
import reducer from '../taxi/taxiPeriodAttachmentReducer'
import * as actions from '../../actions/taxi/taxiPeriodAttachmentActions'
import { makePeriodAttachment } from '../../__tests__/factories'

const initial = { attachments: [], fetching: false, saving: false, isError: false }

describe('taxiPeriodAttachmentReducer', () => {
  it('returns initial state', () => {
    expect(reducer(undefined, { type: '@@INIT' })).toEqual(initial)
  })

  describe('fetch', () => {
    it('fetchRequest sets fetching and clears isError', () => {
      const s = reducer({ ...initial, isError: true }, actions.fetchRequest())
      expect(s.fetching).toBe(true)
      expect(s.isError).toBe(false)
    })

    it('successRequestFetch stores attachments and clears fetching', () => {
      const atts = [makePeriodAttachment()]
      const s = reducer({ ...initial, fetching: true }, actions.successRequestFetch(atts))
      expect(s.attachments).toEqual(atts)
      expect(s.fetching).toBe(false)
    })

    it('errorRequestFetch sets isError', () => {
      const s = reducer({ ...initial, fetching: true }, actions.errorRequestFetch())
      expect(s.fetching).toBe(false)
      expect(s.isError).toBe(true)
    })
  })

  describe('create', () => {
    it('createRequest sets saving', () => {
      expect(reducer(initial, actions.createRequest()).saving).toBe(true)
    })

    it('successRequestCreate appends attachment', () => {
      const a1 = makePeriodAttachment({ id: 'att-1' })
      const a2 = makePeriodAttachment({ id: 'att-2', name: 'otro.jpg' })
      const s = reducer(
        { ...initial, attachments: [a1], saving: true },
        actions.successRequestCreate(a2),
      )
      expect(s.attachments).toHaveLength(2)
      expect(s.attachments[1].id).toBe('att-2')
      expect(s.saving).toBe(false)
    })

    it('errorRequestCreate sets isError', () => {
      const s = reducer({ ...initial, saving: true }, actions.errorRequestCreate())
      expect(s.saving).toBe(false)
      expect(s.isError).toBe(true)
    })
  })

  describe('update', () => {
    it('updateRequest sets saving', () => {
      expect(reducer(initial, actions.updateRequest()).saving).toBe(true)
    })

    it('successRequestUpdate merges fields by id', () => {
      const a = makePeriodAttachment({ id: 'att-1', name: 'old.jpg' })
      const s = reducer(
        { ...initial, attachments: [a], saving: true },
        actions.successRequestUpdate({ id: 'att-1', name: 'new.jpg' }),
      )
      expect(s.attachments[0].name).toBe('new.jpg')
      expect(s.saving).toBe(false)
    })

    it('successRequestUpdate does not affect other attachments', () => {
      const a1 = makePeriodAttachment({ id: 'att-1' })
      const a2 = makePeriodAttachment({ id: 'att-2', name: 'keep.jpg' })
      const s = reducer(
        { ...initial, attachments: [a1, a2] },
        actions.successRequestUpdate({ id: 'att-1', name: 'changed.jpg' }),
      )
      expect(s.attachments.find((a) => a.id === 'att-2').name).toBe('keep.jpg')
    })

    it('errorRequestUpdate sets isError', () => {
      const s = reducer(initial, actions.errorRequestUpdate())
      expect(s.isError).toBe(true)
    })
  })

  describe('delete', () => {
    it('deleteRequest sets saving', () => {
      expect(reducer(initial, actions.deleteRequest()).saving).toBe(true)
    })

    it('successRequestDelete removes attachment by id', () => {
      const a1 = makePeriodAttachment({ id: 'att-1' })
      const a2 = makePeriodAttachment({ id: 'att-2', name: 'keep.jpg' })
      const s = reducer(
        { ...initial, attachments: [a1, a2], saving: true },
        actions.successRequestDelete({ id: 'att-1' }),
      )
      expect(s.attachments).toHaveLength(1)
      expect(s.attachments[0].id).toBe('att-2')
      expect(s.saving).toBe(false)
    })

    it('errorRequestDelete sets isError', () => {
      const s = reducer(initial, actions.errorRequestDelete())
      expect(s.isError).toBe(true)
    })
  })
})
