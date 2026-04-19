import { db } from './settings'
import { collection, addDoc, setDoc, doc, serverTimestamp } from 'firebase/firestore'
import { hashPassword } from './security/users'

const slugify = (str) =>
  str
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')

export const registerNewTenant = async ({ name, username, password, company, email }) => {
  const tenantRef = await addDoc(collection(db, 'Admin_Tenants'), {
    name: company,
    slug: slugify(company),
    plan: 'basic',
    contactName: name,
    contactEmail: email || null,
    active: false,
    createdAt: serverTimestamp(),
  })

  const passwordHash = await hashPassword(password)

  await setDoc(doc(db, 'users', username), {
    name,
    role: 'admin',
    email: email || null,
    avatar: null,
    active: false,
    passwordHash,
    tenantId: tenantRef.id,
    createdAt: serverTimestamp(),
  })

  return tenantRef.id
}
