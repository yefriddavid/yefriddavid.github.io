import { describe, it, expect, vi, beforeEach } from 'vitest'

import { sendAuditMessage, hasAuditChatKey } from '../auditChat'

const PERIOD = { month: 6, year: 2026 }
const MESSAGES = [{ role: 'user', content: 'Audita este período' }]
const SETTLEMENTS = [{ date: '2026-06-13', plate: 'ABC123', driver: 'Alonso', amount: 85000 }]
const EXPENSES = [
  {
    date: '2026-06-13',
    plate: 'ABC123',
    category: 'Mantenimiento',
    description: 'Cambio de aceite',
    amount: 60000,
    paid: true,
  },
]
const ATTACHMENTS = [
  { id: 'a1', image: 'data:image/jpeg;base64,AAAA', description: 'Soporte gastos' },
]
const PERIOD_DRIVERS = [
  { name: 'Alonso', defaultVehicle: 'ABC123', defaultAmount: 85000, defaultAmountSunday: 95000 },
]
const AUDIT_DAYS = [
  {
    dateStr: '2026-06-13',
    status: 'full',
    isHoliday: false,
    isSunday: false,
    hasPicoPlaca: false,
    isFuture: false,
    missing: [],
    underpaidVehicles: [],
  },
  {
    dateStr: '2026-06-14',
    status: 'partial',
    isHoliday: false,
    isSunday: true,
    hasPicoPlaca: false,
    isFuture: false,
    missing: ['Vladimir'],
    underpaidVehicles: ['XYZ999'],
  },
  {
    dateStr: '2026-06-30',
    status: 'future',
    isHoliday: false,
    isSunday: false,
    hasPicoPlaca: false,
    isFuture: true,
    missing: [],
    underpaidVehicles: [],
  },
]

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

describe('hasAuditChatKey', () => {
  it('returns a boolean', () => {
    expect(typeof hasAuditChatKey()).toBe('boolean')
  })
})

describe('sendAuditMessage', () => {
  it('calls fetch with correct URL and POST method', async () => {
    mockFetch({ content: [{ text: 'Todo en orden.' }] })
    await sendAuditMessage({
      messages: MESSAGES,
      period: PERIOD,
      settlements: SETTLEMENTS,
      expenses: EXPENSES,
      attachments: ATTACHMENTS,
      periodDrivers: PERIOD_DRIVERS,
      auditDays: AUDIT_DAYS,
    })

    expect(fetch).toHaveBeenCalledWith(
      'https://api.anthropic.com/v1/messages',
      expect.objectContaining({ method: 'POST' }),
    )
  })

  it('sends required headers including the direct-browser-access flag', async () => {
    mockFetch({ content: [{ text: 'Todo en orden.' }] })
    await sendAuditMessage({
      messages: MESSAGES,
      period: PERIOD,
      settlements: SETTLEMENTS,
      expenses: EXPENSES,
      attachments: ATTACHMENTS,
      periodDrivers: PERIOD_DRIVERS,
      auditDays: AUDIT_DAYS,
    })

    const [, options] = fetch.mock.calls[0]
    expect(options.headers['anthropic-version']).toBe('2023-06-01')
    expect(options.headers['anthropic-dangerous-direct-browser-access']).toBe('true')
    expect(options.headers).toHaveProperty('x-api-key')
  })

  it('includes period and settlement rows in the context block', async () => {
    mockFetch({ content: [{ text: 'Todo en orden.' }] })
    await sendAuditMessage({
      messages: MESSAGES,
      period: PERIOD,
      settlements: SETTLEMENTS,
      expenses: EXPENSES,
      attachments: [],
      periodDrivers: PERIOD_DRIVERS,
      auditDays: AUDIT_DAYS,
    })

    const body = JSON.parse(fetch.mock.calls[0][1].body)
    const contextText = body.messages[0].content[0].text
    expect(contextText).toContain('6/2026')
    expect(contextText).toContain('ABC123')
    expect(contextText).toContain('Alonso')
  })

  it('includes expense rows in the context block', async () => {
    mockFetch({ content: [{ text: 'Todo en orden.' }] })
    await sendAuditMessage({
      messages: MESSAGES,
      period: PERIOD,
      settlements: [],
      expenses: EXPENSES,
      attachments: [],
      periodDrivers: PERIOD_DRIVERS,
      auditDays: AUDIT_DAYS,
    })

    const body = JSON.parse(fetch.mock.calls[0][1].body)
    const contextText = body.messages[0].content[0].text
    expect(contextText).toContain('Cambio de aceite')
    expect(contextText).toContain('Mantenimiento')
    expect(contextText).toContain('pagado')
  })

  it('shows a placeholder when there are no expenses', async () => {
    mockFetch({ content: [{ text: 'Todo en orden.' }] })
    await sendAuditMessage({
      messages: MESSAGES,
      period: PERIOD,
      settlements: [],
      expenses: [],
      attachments: [],
      periodDrivers: PERIOD_DRIVERS,
      auditDays: AUDIT_DAYS,
    })

    const body = JSON.parse(fetch.mock.calls[0][1].body)
    const contextText = body.messages[0].content[0].text
    expect(contextText).toContain('sin gastos en este período')
  })

  it('includes driver expected amounts in the context block', async () => {
    mockFetch({ content: [{ text: 'Todo en orden.' }] })
    await sendAuditMessage({
      messages: MESSAGES,
      period: PERIOD,
      settlements: [],
      expenses: [],
      attachments: [],
      periodDrivers: PERIOD_DRIVERS,
      auditDays: [],
    })

    const body = JSON.parse(fetch.mock.calls[0][1].body)
    const contextText = body.messages[0].content[0].text
    expect(contextText).toContain('Alonso')
    expect(contextText).toContain('85000')
    expect(contextText).toContain('95000')
  })

  it('includes the already-computed day coverage status, excluding future days', async () => {
    mockFetch({ content: [{ text: 'Todo en orden.' }] })
    await sendAuditMessage({
      messages: MESSAGES,
      period: PERIOD,
      settlements: [],
      expenses: [],
      attachments: [],
      periodDrivers: [],
      auditDays: AUDIT_DAYS,
    })

    const body = JSON.parse(fetch.mock.calls[0][1].body)
    const contextText = body.messages[0].content[0].text
    expect(contextText).toContain('2026-06-13 | estado: full')
    expect(contextText).toContain('domingo')
    expect(contextText).toContain('faltan: Vladimir')
    expect(contextText).toContain('pago insuficiente en placa(s): XYZ999')
    expect(contextText).not.toContain('2026-06-30')
  })

  it('shows a placeholder when there are no past audit days', async () => {
    mockFetch({ content: [{ text: 'Todo en orden.' }] })
    await sendAuditMessage({
      messages: MESSAGES,
      period: PERIOD,
      settlements: [],
      expenses: [],
      attachments: [],
      periodDrivers: [],
      auditDays: [],
    })

    const body = JSON.parse(fetch.mock.calls[0][1].body)
    const contextText = body.messages[0].content[0].text
    expect(contextText).toContain('sin días transcurridos en este período')
  })

  it('includes attachment images as base64 blocks with their description', async () => {
    mockFetch({ content: [{ text: 'Todo en orden.' }] })
    await sendAuditMessage({
      messages: MESSAGES,
      period: PERIOD,
      settlements: [],
      expenses: [],
      attachments: ATTACHMENTS,
      periodDrivers: PERIOD_DRIVERS,
      auditDays: AUDIT_DAYS,
    })

    const body = JSON.parse(fetch.mock.calls[0][1].body)
    const blocks = body.messages[0].content
    const imageBlock = blocks.find((b) => b.type === 'image')
    expect(imageBlock.source).toEqual({ type: 'base64', media_type: 'image/jpeg', data: 'AAAA' })
    expect(blocks.some((b) => b.type === 'text' && b.text.includes('Soporte gastos'))).toBe(true)
  })

  it('skips attachments with a malformed data URL', async () => {
    mockFetch({ content: [{ text: 'Todo en orden.' }] })
    await sendAuditMessage({
      messages: MESSAGES,
      period: PERIOD,
      settlements: [],
      expenses: [],
      attachments: [{ id: 'bad', image: 'not-a-data-url', description: 'x' }],
      periodDrivers: PERIOD_DRIVERS,
      auditDays: AUDIT_DAYS,
    })

    const body = JSON.parse(fetch.mock.calls[0][1].body)
    const blocks = body.messages[0].content
    expect(blocks.some((b) => b.type === 'image')).toBe(false)
  })

  it('shows a placeholder when there are no settlements', async () => {
    mockFetch({ content: [{ text: 'Todo en orden.' }] })
    await sendAuditMessage({
      messages: MESSAGES,
      period: PERIOD,
      settlements: [],
      expenses: [],
      attachments: [],
      periodDrivers: PERIOD_DRIVERS,
      auditDays: AUDIT_DAYS,
    })

    const body = JSON.parse(fetch.mock.calls[0][1].body)
    const contextText = body.messages[0].content[0].text
    expect(contextText).toContain('sin liquidaciones en este período')
  })

  it('appends the conversation messages after the context block', async () => {
    mockFetch({ content: [{ text: 'Todo en orden.' }] })
    await sendAuditMessage({
      messages: MESSAGES,
      period: PERIOD,
      settlements: SETTLEMENTS,
      expenses: EXPENSES,
      attachments: [],
      periodDrivers: PERIOD_DRIVERS,
      auditDays: AUDIT_DAYS,
    })

    const body = JSON.parse(fetch.mock.calls[0][1].body)
    const lastMessage = body.messages[body.messages.length - 1]
    expect(lastMessage).toEqual(MESSAGES[0])
  })

  it('returns the assistant text from the response', async () => {
    mockFetch({ content: [{ text: 'Hallé 2 inconsistencias.' }] })
    const result = await sendAuditMessage({
      messages: MESSAGES,
      period: PERIOD,
      settlements: SETTLEMENTS,
      expenses: EXPENSES,
      attachments: [],
      periodDrivers: PERIOD_DRIVERS,
      auditDays: AUDIT_DAYS,
    })
    expect(result).toBe('Hallé 2 inconsistencias.')
  })

  it('throws with error message on non-ok response', async () => {
    mockFetch({ error: { message: 'invalid_api_key' } }, false, 401)
    await expect(
      sendAuditMessage({
        messages: MESSAGES,
        period: PERIOD,
        settlements: SETTLEMENTS,
        expenses: EXPENSES,
        attachments: [],
        periodDrivers: PERIOD_DRIVERS,
        auditDays: AUDIT_DAYS,
      }),
    ).rejects.toThrow('invalid_api_key')
  })

  it('throws with status code when error body is not parseable', async () => {
    global.fetch = vi.fn().mockResolvedValue({
      ok: false,
      status: 500,
      json: () => Promise.reject(new Error('not json')),
    })
    await expect(
      sendAuditMessage({
        messages: MESSAGES,
        period: PERIOD,
        settlements: SETTLEMENTS,
        expenses: EXPENSES,
        attachments: [],
        periodDrivers: PERIOD_DRIVERS,
        auditDays: AUDIT_DAYS,
      }),
    ).rejects.toThrow('Error 500')
  })
})
