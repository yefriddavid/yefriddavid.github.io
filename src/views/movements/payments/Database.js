import React, { useState, useEffect } from 'react'
import { db } from './firebase' // Importa tu instancia de Firebase
import { collection, getDocs, query, 
  deleteDoc,
  where, setDoc, doc, addDoc 
} from 'firebase/firestore'
import { VaucherModalViewer } from './Controls'
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

function VaucherControlViewer({paymentId}) {
  const [documento, setDocumento] = useState(null)
  const [showModalVaucherViewer, setStateVaucherModal] = useState(false)
  //alert(paymentId)
  useEffect(() => {
    const obtenerDocumento = async () => {
      try {
        // const querySnapshot = await getDocs(collection(db, "paymentVauchers"))
        const q = query(collection(db, "paymentVauchers"), where("id", "==", parseInt(paymentId)))
        const querySnapshot = await getDocs(q)

        const newData = querySnapshot.docs.map((doc) => ({...doc.data() }))
        setDocumento(newData)
        //
        //const docRef = db.collection('paymentVauchers').doc('test');
        //const docSnap = await docRef.get();

        //if (docSnap.exists()) {
        //  setDocumento(docSnap.data());
        //} else {
        //  console.log('No se encontró el documento');
        //}
      } catch (error) {
        console.error('Error al obtener el documento:', error)
      }
    }

    obtenerDocumento()
  }, [])

  //{documento ? (
  return (
    <div>
      {documento ? (documento.map((i) =>
          <CCardImage key={crypto.randomUUID()} orientation="top" src={i.file} />
        )
      ) : (
        <center>
          <br />
        <CSpinner color="info" />
      </center>
      )}
    </div>
  )

  return (
    <div>
      {documento ? (documento.map((i) =>
        <div key={crypto.randomUUID()}>
          <img width="250" higth="500" src={i.file} />
          {/* Agrega aquí más campos a mostrar */}
          <VaucherModalViewer vaucher={i.file} visible={showModalVaucherViewer} name="showModalVaucherViewer" setVisible={setStateVaucherModal} />
          <br />
          <button onClick={ (e) => setStateVaucherModal(true) }>
            Show Vaucher
          </button>
        </div>
      )) : (
        <CSpinner />
      )}
    </div>
  );
}

export { VaucherControlViewer, CreatePaymentVaucher }