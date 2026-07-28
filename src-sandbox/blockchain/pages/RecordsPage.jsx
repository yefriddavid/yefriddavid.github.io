import { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import { createBlock, verifyChain } from '../lib/chain'
import { addBlock, loadChain, updateBlockDetail } from '../lib/storage'

export default function RecordsPage() {
  const [chain, setChain] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [verification, setVerification] = useState(null)
  const { register, handleSubmit, reset } = useForm({
    defaultValues: { title: '', description: '', content: '' },
  })

  useEffect(() => {
    loadChain()
      .then(setChain)
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false))
  }, [])

  const onSubmit = async ({ title, description, content }) => {
    const prevBlock = chain[chain.length - 1] ?? null
    const block = await createBlock(
      { header: { title, description }, detail: { content } },
      prevBlock,
    )
    try {
      await addBlock(block)
      setChain([...chain, block])
      setVerification(null)
      reset()
    } catch (e) {
      setError(e.message)
    }
  }

  const handleVerify = async () => {
    setVerification(await verifyChain(chain))
  }

  const tamper = async (i) => {
    const content = prompt('Nuevo contenido (simula manipulación, no recalcula el hash):')
    if (content === null) return
    const detail = { ...chain[i].detail, content }
    try {
      await updateBlockDetail(chain[i].index, detail)
      const next = [...chain]
      next[i] = { ...next[i], detail }
      setChain(next)
      setVerification(null)
    } catch (e) {
      setError(e.message)
    }
  }

  return (
    <div>
      {error && (
        <div style={{ background: '#3a1f1f', color: '#ff8a80', padding: 10, borderRadius: 6, marginBottom: 16 }}>
          Error de Firestore: {error}
        </div>
      )}

      <form onSubmit={handleSubmit(onSubmit)} style={{ marginBottom: 24, maxWidth: 420 }}>
        <div style={{ marginBottom: 8 }}>
          <input placeholder="Título (header)" {...register('title', { required: true })} style={inputStyle} />
        </div>
        <div style={{ marginBottom: 8 }}>
          <input placeholder="Descripción (header)" {...register('description')} style={inputStyle} />
        </div>
        <div style={{ marginBottom: 8 }}>
          <textarea placeholder="Contenido (detail)" {...register('content', { required: true })} style={{ ...inputStyle, minHeight: 60 }} />
        </div>
        <button type="submit">Agregar registro</button>
      </form>

      <div style={{ marginBottom: 16 }}>
        <button onClick={handleVerify} disabled={loading}>Verificar cadena</button>
        {verification && (
          <span style={{ marginLeft: 12, color: verification.valid ? '#4caf50' : '#e53935' }}>
            {verification.valid
              ? 'Cadena válida ✓'
              : `Cadena rota en el bloque #${verification.brokenAt} ✗`}
          </span>
        )}
      </div>

      {loading && <p>Cargando cadena desde Firestore…</p>}
      {!loading && chain.length === 0 && <p>Sin registros aún.</p>}

      {chain.map((block, i) => (
        <div
          key={block.hash + i}
          style={{
            border: '1px solid #262b36',
            borderRadius: 8,
            padding: 12,
            marginBottom: 10,
            fontSize: 13,
          }}
        >
          <div><strong>#{block.index}</strong> — {block.header.title}</div>
          {block.header.description && <div style={{ opacity: 0.7 }}>{block.header.description}</div>}
          <div style={{ margin: '6px 0' }}>{block.detail.content}</div>
          <div style={{ opacity: 0.5, wordBreak: 'break-all' }}>hash: {block.hash}</div>
          <div style={{ opacity: 0.5, wordBreak: 'break-all' }}>prevHash: {block.prevHash}</div>
          <button onClick={() => tamper(i)} style={{ marginTop: 6 }}>
            Simular manipulación
          </button>
        </div>
      ))}
    </div>
  )
}

const inputStyle = { width: '100%', padding: 8, background: '#161a22', color: '#e6e6e6', border: '1px solid #262b36', borderRadius: 6 }
