import React, { useState, useEffect } from 'react'
import { db } from './settings'
import {
  collection,
  getDocs,
  query,
  deleteDoc,
  or,
  where,
  setDoc,
  doc,
  addDoc,
} from 'firebase/firestore'
import { CCardImage } from '@coreui/react'

import { CSpinner } from '@coreui/react'

const EditPaymentVaucher = async ({ paymentId, vaucher, year = 2025 }) => {
  try {
    const docRef = doc(db, 'paymentVauchers-' + year, 'new-user-id')
    await setDoc(docRef, docRef)
  } catch (error) {
    console.error('Error al obtener el documento:', error)
  }
}

const RemovePaymentVaucher = async ({ vaucherId, year = 2025 }) => {
  try {
    const collectionName = 'paymentVauchers-' + year
    const docRef = doc(db, collectionName, vaucherId)
    return await deleteDoc(docRef)
  } catch (error) {
    console.error('Error al eliminar el vaucher:', error)
  }
}
const CreatePaymentVaucher = async ({ paymentId, vaucher, year = 2025 }) => {
  try {
    const newData = { id: paymentId, file: vaucher }
    const docRef = await addDoc(collection(db, "paymentVauchers-" + year), newData)
    return docRef //await setDoc(docRef, { id: paymentId, file: vaucher })
  } catch (error) {
    console.error('Error al crear el documento:', error)
  }
}

const fetchVaucherPaymentMultiple = async (payments) => {
  // const querySnapshot = await getDocs(collection(db, "paymentVauchers"))

  const paymentIds = payments.map((o) => {
    return parseInt(o.paymentId)
  })

  const q = query(collection(db, "paymentVauchers-2025"), where("id", "in", paymentIds))
  const querySnapshot = await getDocs(q)

  const documentResponse = querySnapshot.docs.map((doc) => ({...doc.data() }))

  return documentResponse.map((o) => {
    return { vaucher: o.file, paymentId: o.id }
  })
}

const fetchVaucherPayment = async (paymentId) => {
  // const querySnapshot = await getDocs(collection(db, "paymentVauchers"))
  const q = query(collection(db, "paymentVauchers-2025"), where("id", "==", parseInt(paymentId)))
  const querySnapshot = await getDocs(q)

  const documentResponse = querySnapshot.docs.map((doc) => ({...doc.data() }))
  if (documentResponse.length){
    return { vaucher: documentResponse[0].file, paymentId }

  }
  else {
    return { paymentId }

  }

}

export {
  CreatePaymentVaucher,
  fetchVaucherPayment,
  fetchVaucherPaymentMultiple
}
