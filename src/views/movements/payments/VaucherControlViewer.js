import React, { useState, useEffect } from 'react'
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

  const { paymentId, vaucher } = payment
console.log(payment);
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
        <center>
          <br />
          N/D
      </center>
      )

  }

  return (
    <CCardImage key={crypto.randomUUID()} orientation="top" src={vaucher} />
  )

}

export { VaucherControlViewer, CreatePaymentVaucher }
