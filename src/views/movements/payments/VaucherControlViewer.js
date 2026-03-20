import React from 'react'
import { useTranslation } from 'react-i18next'
import { db } from './firebase' // Importa tu instancia de Firebase
import { collection, getDocs, query,
  deleteDoc,
  where, setDoc, doc, addDoc
} from 'firebase/firestore'
//import { VaucherModalViewer } from './Controls'
import { CCardImage } from '@coreui/react'

import { CSpinner } from '@coreui/react'

const EditPaymentVaucher = async ({paymentId, vaucher}) => {

  try {
    //const q = addDoc(collection(db, "paymentVauchers"), where("id", "==", parseInt(paymentId)))

    const docRef = doc(db, 'paymentVauchers', 'new-user-id')
    console.log(paymentId)
    console.log(vaucher)
    await setDoc(docRef, docRef)

  } catch (error) {

    console.error('Error al obtener el documento:', error)
  }

}
const RemovePaymentVaucher = async ({vaucherId}) => {

  try {
    const collectionName = 'paymentVauchers'
    const docRef = doc(db, collectionName, vaucherId)
    return await deleteDoc(docRef)
  } catch (error) {
    console.error('Error al eliminar el vaucher:', error)
  }

}
const CreatePaymentVaucher = async ({paymentId, vaucher}) => {

  try {
    const newData = { id: paymentId, file: vaucher }
    const docRef = await addDoc(collection(db, "paymentVauchers"), newData)
    return docRef //await setDoc(docRef, { id: paymentId, file: vaucher })
  } catch (error) {
    console.error('Error al crear el documento:', error)
  }

}

function VaucherControlViewer({payment}) {
  const { t } = useTranslation()
  const { paymentId, vaucher } = payment
  if(vaucher === false){
    return (
        <center>
          <br />
          <CSpinner color="info" />
      </center>
      )

  }

  if(vaucher === ""){
    return (
      <div style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        height: 120,
        background: '#f1f3f5',
        color: '#adb5bd',
        gap: 8,
      }}>
        <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.2}>
          <rect x="3" y="3" width="18" height="18" rx="2" strokeLinecap="round" strokeLinejoin="round"/>
          <circle cx="8.5" cy="8.5" r="1.5"/>
          <path strokeLinecap="round" strokeLinejoin="round" d="M21 15l-5-5L5 21"/>
        </svg>
        <span style={{ fontSize: 11, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
          {t('voucher.noVoucher')}
        </span>
      </div>
    )
  }

  return (
    <CCardImage key={crypto.randomUUID()} orientation="top" src={vaucher} />
  )

}

export { VaucherControlViewer, CreatePaymentVaucher }
