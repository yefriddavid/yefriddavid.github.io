import { describe, it, expect, vi, beforeEach } from 'vitest'

import { sendDesignMessage } from '../designChat'

const CANVAS = { width: 20, height: 15, unit: 'cm' }
const MESSAGES = [{ role: 'user', content: 'Agrega un rectángulo' }]

const mockFetch = (body, ok = true, status = 200) => {
  global.fetch = vi.fn().mockResolvedValue({
    ok,
    status,
    json: () => Promise.resolve(body),
  })
}

beforeEach(() => {
  vi.clearAllMocks()
})

// ── sendDesignMessage ─────────────────────────────────────────────────────────

describe('sendDesignMessage', () => {
  it('calls fetch with correct URL and POST method', async () => {
    mockFetch({ content: [{ text: '"action":"message","message":"Ok"}' }] })
    await sendDesignMessage({ messages: MESSAGES, canvasConfig: CANVAS, nodes: [] })

    expect(fetch).toHaveBeenCalledWith(
      'https://api.anthropic.com/v1/messages',
      expect.objectContaining({ method: 'POST' }),
    )
  })

  it('sends required headers', async () => {
    mockFetch({ content: [{ text: '"action":"message","message":"Ok"}' }] })
    await sendDesignMessage({ messages: MESSAGES, canvasConfig: CANVAS, nodes: [] })

    const [, options] = fetch.mock.calls[0]
    expect(options.headers['Content-Type']).toBe('application/json')
    expect(options.headers['anthropic-version']).toBe('2023-06-01')
    expect(options.headers).toHaveProperty('x-api-key')
  })

  it('sends Content-Type application/json', async () => {
    mockFetch({ content: [{ text: '"action":"message","message":"Ok"}' }] })
    await sendDesignMessage({ messages: MESSAGES, canvasConfig: CANVAS, nodes: [] })

    const [, options] = fetch.mock.calls[0]
    expect(options.headers['Content-Type']).toBe('application/json')
  })

  it('includes canvas dimensions in the context message', async () => {
    mockFetch({ content: [{ text: '"action":"message","message":"Ok"}' }] })
    await sendDesignMessage({ messages: MESSAGES, canvasConfig: CANVAS, nodes: [] })

    const body = JSON.parse(fetch.mock.calls[0][1].body)
    const contextMsg = body.messages[0].content
    expect(contextMsg).toContain('20×15 cm')
  })

  it('includes lean nodes in the context message', async () => {
    mockFetch({ content: [{ text: '"action":"message","message":"Ok"}' }] })
    const nodes = [{ id: 'n1', type: 'rect', x: 10, y: 20, w: 100, h: 50, rotation: 0, fill: '#ff0000', stroke: '#000', fillOpacity: 1, strokeWidth: 2, visible: true, locked: false }]

    await sendDesignMessage({ messages: MESSAGES, canvasConfig: CANVAS, nodes })

    const body = JSON.parse(fetch.mock.calls[0][1].body)
    const contextMsg = body.messages[0].content
    expect(contextMsg).toContain('n1')
    expect(contextMsg).toContain('rect')
  })

  it('prepends "{" from prefill to response text before parsing', async () => {
    mockFetch({ content: [{ text: '"action":"message","message":"Hola"}' }] })
    const result = await sendDesignMessage({ messages: MESSAGES, canvasConfig: CANVAS, nodes: [] })
    expect(result).toEqual({ action: 'message', message: 'Hola' })
  })

  it('returns update_nodes response correctly', async () => {
    const newNodes = [{ id: 'n1', type: 'rect' }]
    mockFetch({ content: [{ text: `"action":"update_nodes","nodes":${JSON.stringify(newNodes)},"message":"Listo."}` }] })

    const result = await sendDesignMessage({ messages: MESSAGES, canvasConfig: CANVAS, nodes: [] })
    expect(result.action).toBe('update_nodes')
    expect(result.nodes).toEqual(newNodes)
    expect(result.message).toBe('Listo.')
  })

  it('throws with error message on non-ok response', async () => {
    mockFetch({ error: { message: 'invalid_api_key' } }, false, 401)
    await expect(sendDesignMessage({ messages: MESSAGES, canvasConfig: CANVAS, nodes: [] }))
      .rejects.toThrow('invalid_api_key')
  })

  it('throws with status code when error body is not parseable', async () => {
    global.fetch = vi.fn().mockResolvedValue({
      ok: false,
      status: 500,
      json: () => Promise.reject(new Error('not json')),
    })
    await expect(sendDesignMessage({ messages: MESSAGES, canvasConfig: CANVAS, nodes: [] }))
      .rejects.toThrow('Error 500')
  })

  it('falls back to safe response when JSON is completely invalid', async () => {
    mockFetch({ content: [{ text: 'texto plano sin json' }] })
    const result = await sendDesignMessage({ messages: MESSAGES, canvasConfig: CANVAS, nodes: [] })
    expect(result.action).toBe('message')
    expect(result.message).toContain('No pude generar')
  })

  it('recovers partial JSON using last-} fallback', async () => {
    mockFetch({ content: [{ text: '"action":"message","message":"Parcial"} texto extra ignorado' }] })
    const result = await sendDesignMessage({ messages: MESSAGES, canvasConfig: CANVAS, nodes: [] })
    expect(result.action).toBe('message')
    expect(result.message).toBe('Parcial')
  })

  it('includes user messages in the request body', async () => {
    mockFetch({ content: [{ text: '"action":"message","message":"Ok"}' }] })
    await sendDesignMessage({ messages: MESSAGES, canvasConfig: CANVAS, nodes: [] })

    const body = JSON.parse(fetch.mock.calls[0][1].body)
    const userMessages = body.messages.filter((m) => m.role === 'user' && m.content === 'Agrega un rectángulo')
    expect(userMessages).toHaveLength(1)
  })
})

// ── leanNode (via sendDesignMessage body inspection) ─────────────────────────

describe('leanNode serialization', () => {
  const fullNode = {
    id: 'n1', type: 'rect', name: 'Box',
    x: 10.456, y: 20.789, w: 100.123, h: 50.001,
    rotation: 45.6,
    fill: '#ff0000', stroke: '#000000',
    fillOpacity: 0.8, strokeWidth: 3,
    visible: true, locked: false, groupId: null,
    text: 'Hola', fontSize: 14, fontColor: '#ffffff',
    _internalProp: 'should be stripped',
  }

  const getLeanNode = async (node) => {
    mockFetch({ content: [{ text: '"action":"message","message":"Ok"}' }] })
    await sendDesignMessage({ messages: MESSAGES, canvasConfig: CANVAS, nodes: [node] })
    const body = JSON.parse(fetch.mock.calls[0][1].body)
    const contextMsg = body.messages[0].content
    const nodesJson = contextMsg.slice(contextMsg.indexOf('['))
    return JSON.parse(nodesJson)[0]
  }

  it('rounds x, y, w, h to 1 decimal', async () => {
    const lean = await getLeanNode(fullNode)
    expect(lean.x).toBe(10.5)
    expect(lean.y).toBe(20.8)
    expect(lean.w).toBe(100.1)
    expect(lean.h).toBe(50)
  })

  it('rounds rotation to integer', async () => {
    const lean = await getLeanNode(fullNode)
    expect(lean.rotation).toBe(46)
  })

  it('includes text fields when present', async () => {
    const lean = await getLeanNode(fullNode)
    expect(lean.text).toBe('Hola')
    expect(lean.fontSize).toBe(14)
    expect(lean.fontColor).toBe('#ffffff')
  })

  it('omits text fields when not present in node', async () => {
    const { text: _t, fontSize: _fs, fontColor: _fc, ...nodeWithoutText } = fullNode
    const lean = await getLeanNode(nodeWithoutText)
    expect(lean).not.toHaveProperty('text')
    expect(lean).not.toHaveProperty('fontSize')
    expect(lean).not.toHaveProperty('fontColor')
  })

  it('strips unknown properties', async () => {
    const lean = await getLeanNode(fullNode)
    expect(lean).not.toHaveProperty('_internalProp')
  })

  it('normalizes undefined groupId to null', async () => {
    const { groupId: _g, ...nodeWithoutGroup } = fullNode
    const lean = await getLeanNode(nodeWithoutGroup)
    expect(lean.groupId).toBeNull()
  })
})
