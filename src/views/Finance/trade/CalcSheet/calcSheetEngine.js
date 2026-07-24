// Minimal spreadsheet formula engine: +, -, *, /, (), cell refs (A1) and
// SUM/AVG/MIN/MAX/COUNT over refs or ranges (A1:B3). No persistence, no external deps.

const CELL_RE = /^[A-Za-z]+\d+$/
const FUNCTIONS = new Set(['SUM', 'AVG', 'PROMEDIO', 'MIN', 'MAX', 'COUNT'])

export const colLetters = (col) => {
  let s = ''
  let n = col
  while (n > 0) {
    const rem = (n - 1) % 26
    s = String.fromCharCode(65 + rem) + s
    n = Math.floor((n - 1) / 26)
  }
  return s
}

const parseRef = (ref) => {
  const m = ref.match(/^([A-Za-z]+)(\d+)$/)
  let col = 0
  for (const ch of m[1].toUpperCase()) col = col * 26 + (ch.charCodeAt(0) - 64)
  return { col, row: parseInt(m[2], 10) }
}

const expandRange = (from, to) => {
  const a = parseRef(from)
  const b = parseRef(to)
  const c1 = Math.min(a.col, b.col)
  const c2 = Math.max(a.col, b.col)
  const r1 = Math.min(a.row, b.row)
  const r2 = Math.max(a.row, b.row)
  const cells = []
  for (let r = r1; r <= r2; r++) {
    for (let c = c1; c <= c2; c++) cells.push(`${colLetters(c)}${r}`)
  }
  return cells
}

function tokenize(src) {
  const tokens = []
  let i = 0
  while (i < src.length) {
    const c = src[i]
    if (/\s/.test(c)) {
      i++
      continue
    }
    if (/[0-9]/.test(c) || (c === '.' && /[0-9]/.test(src[i + 1] || ''))) {
      let j = i
      while (j < src.length && /[0-9.]/.test(src[j])) j++
      tokens.push({ type: 'num', value: parseFloat(src.slice(i, j)) })
      i = j
      continue
    }
    if (/[A-Za-z]/.test(c)) {
      let j = i
      while (j < src.length && /[A-Za-z0-9]/.test(src[j])) j++
      const word = src.slice(i, j).toUpperCase()
      tokens.push({ type: CELL_RE.test(word) ? 'ref' : 'ident', value: word })
      i = j
      continue
    }
    if ('+-*/(),:'.includes(c)) {
      tokens.push({ type: c, value: c })
      i++
      continue
    }
    throw new Error(`Carácter inválido: ${c}`)
  }
  return tokens
}

function parse(tokens) {
  let pos = 0
  const peek = () => tokens[pos]
  const next = () => tokens[pos++]

  function parseExpr() {
    let node = parseTerm()
    while (peek() && (peek().type === '+' || peek().type === '-')) {
      const op = next().type
      node = { type: 'binop', op, left: node, right: parseTerm() }
    }
    return node
  }

  function parseTerm() {
    let node = parseFactor()
    while (peek() && (peek().type === '*' || peek().type === '/')) {
      const op = next().type
      node = { type: 'binop', op, left: node, right: parseFactor() }
    }
    return node
  }

  function parseFactor() {
    const t = peek()
    if (!t) throw new Error('Expresión incompleta')
    if (t.type === '-') {
      next()
      return { type: 'neg', value: parseFactor() }
    }
    if (t.type === '+') {
      next()
      return parseFactor()
    }
    if (t.type === '(') {
      next()
      const node = parseExpr()
      if (!peek() || peek().type !== ')') throw new Error('Falta paréntesis')
      next()
      return node
    }
    if (t.type === 'num') {
      next()
      return { type: 'num', value: t.value }
    }
    if (t.type === 'ref') {
      next()
      return { type: 'ref', value: t.value }
    }
    if (t.type === 'ident') {
      next()
      if (!FUNCTIONS.has(t.value)) throw new Error(`Función desconocida: ${t.value}`)
      if (!peek() || peek().type !== '(') throw new Error('Falta paréntesis')
      next()
      const args = parseArgs()
      if (!peek() || peek().type !== ')') throw new Error('Falta paréntesis')
      next()
      return { type: 'call', name: t.value, args }
    }
    throw new Error('Token inesperado')
  }

  function parseArgs() {
    const args = []
    if (peek() && peek().type === ')') return args
    args.push(parseArg())
    while (peek() && peek().type === ',') {
      next()
      args.push(parseArg())
    }
    return args
  }

  function parseArg() {
    if (peek()?.type === 'ref' && tokens[pos + 1]?.type === ':') {
      const from = next().value
      next()
      const to = next().value
      return { type: 'range', from, to }
    }
    return parseExpr()
  }

  const node = parseExpr()
  if (pos !== tokens.length) throw new Error('Expresión inválida')
  return node
}

const asNumber = (v) => {
  if (typeof v === 'number') return v
  throw new Error('#VALOR!')
}

function evaluateNode(node, getValue) {
  switch (node.type) {
    case 'num':
      return node.value
    case 'neg':
      return -asNumber(evaluateNode(node.value, getValue))
    case 'ref':
      return getValue(node.value)
    case 'binop': {
      const l = asNumber(evaluateNode(node.left, getValue))
      const r = asNumber(evaluateNode(node.right, getValue))
      if (node.op === '+') return l + r
      if (node.op === '-') return l - r
      if (node.op === '*') return l * r
      if (r === 0) throw new Error('#DIV/0!')
      return l / r
    }
    case 'call': {
      const values = []
      for (const arg of node.args) {
        if (arg.type === 'range') {
          for (const id of expandRange(arg.from, arg.to)) values.push(getValue(id))
        } else {
          values.push(evaluateNode(arg, getValue))
        }
      }
      const nums = values.filter((v) => typeof v === 'number')
      if (node.name === 'SUM') return nums.reduce((a, b) => a + b, 0)
      if (node.name === 'AVG' || node.name === 'PROMEDIO') {
        return nums.length ? nums.reduce((a, b) => a + b, 0) / nums.length : 0
      }
      if (node.name === 'MIN') return nums.length ? Math.min(...nums) : 0
      if (node.name === 'MAX') return nums.length ? Math.max(...nums) : 0
      return nums.length // COUNT
    }
    default:
      throw new Error('Nodo inválido')
  }
}

function resolveCell(id, data, cache, visiting) {
  if (cache.has(id)) {
    const cached = cache.get(id)
    if (cached.error) throw new Error(cached.error)
    return cached.value
  }
  const raw = (data[id] || '').trim()
  if (raw === '') {
    cache.set(id, { value: 0 })
    return 0
  }
  if (visiting.has(id)) throw new Error('#CICLO!')
  visiting.add(id)
  try {
    let value
    if (raw.startsWith('=')) {
      const ast = parse(tokenize(raw.slice(1)))
      value = evaluateNode(ast, (ref) => resolveCell(ref, data, cache, visiting))
    } else {
      const n = Number(raw.replace(',', '.'))
      value = raw !== '' && !isNaN(n) ? n : raw
    }
    cache.set(id, { value })
    return value
  } catch (e) {
    const error = e.message.startsWith('#') ? e.message : '#ERROR!'
    cache.set(id, { error })
    throw new Error(error)
  } finally {
    visiting.delete(id)
  }
}

// Returns { [cellId]: { value, error } } for every cell that has raw content.
export function computeSheet(data) {
  const cache = new Map()
  const results = {}
  for (const id of Object.keys(data)) {
    if (!(data[id] || '').trim()) continue
    try {
      results[id] = { value: resolveCell(id, data, cache, new Set()), error: null }
    } catch (e) {
      results[id] = { value: null, error: e.message }
    }
  }
  return results
}
