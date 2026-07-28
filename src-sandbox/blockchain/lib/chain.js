const ORIGIN_HASH = '0'.repeat(64)

async function computeHash({ index, timestamp, prevHash, header, detail }) {
  const payload = JSON.stringify({ index, timestamp, prevHash, header, detail })
  const digest = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(payload))
  return Array.from(new Uint8Array(digest))
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('')
}

// factory: pure state-transition (prevBlock, data) => newBlock
export async function createBlock({ header, detail }, prevBlock) {
  const index = prevBlock ? prevBlock.index + 1 : 0
  const prevHash = prevBlock ? prevBlock.hash : ORIGIN_HASH
  const timestamp = Date.now()
  const hash = await computeHash({ index, timestamp, prevHash, header, detail })
  return { index, timestamp, prevHash, header, detail, hash }
}

export async function verifyChain(blocks) {
  for (let i = 0; i < blocks.length; i++) {
    const block = blocks[i]
    const expectedPrevHash = i === 0 ? ORIGIN_HASH : blocks[i - 1].hash
    const recomputed = await computeHash(block)
    if (block.prevHash !== expectedPrevHash || recomputed !== block.hash) {
      return { valid: false, brokenAt: i }
    }
  }
  return { valid: true, brokenAt: -1 }
}
