import { collection, doc, getDocs, orderBy, query, setDoc, updateDoc } from 'firebase/firestore'
import { authReady, db } from './firebase'
import { COL_SANDBOX_BLOCKCHAIN_CHAIN } from './settings'

export async function loadChain() {
  await authReady
  const snap = await getDocs(query(collection(db, COL_SANDBOX_BLOCKCHAIN_CHAIN), orderBy('index')))
  return snap.docs.map((d) => d.data())
}

export async function addBlock(block) {
  await authReady
  await setDoc(doc(db, COL_SANDBOX_BLOCKCHAIN_CHAIN, String(block.index)), block)
}

export async function updateBlockDetail(index, detail) {
  await authReady
  await updateDoc(doc(db, COL_SANDBOX_BLOCKCHAIN_CHAIN, String(index)), { detail })
}
