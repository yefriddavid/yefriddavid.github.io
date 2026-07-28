import { createBlock, verifyChain } from './chain.js'

const b0 = await createBlock({ header: { title: 'Genesis' }, detail: { content: 'first' } }, null)
const b1 = await createBlock({ header: { title: 'Second' }, detail: { content: 'second' } }, b0)

const ok = await verifyChain([b0, b1])
console.assert(ok.valid === true, 'expected a freshly built chain to verify as valid')

const tampered = [b0, { ...b1, detail: { content: 'HACKED' } }]
const broken = await verifyChain(tampered)
console.assert(
  broken.valid === false && broken.brokenAt === 1,
  'expected tampering with block 1 to be detected at index 1',
)

console.log('chain.check.mjs: OK')
