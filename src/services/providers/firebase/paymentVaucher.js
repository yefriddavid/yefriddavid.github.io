//import React, { useState, useEffect } from 'react'
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

import { of } from 'rxjs'
import { map } from 'rxjs/operators'
import { v4 as uuidv4 } from 'uuid'

const tablsPrefix = import.meta.env.VITE_APP_TABLES_PREFIX
const t = map( year => `${tablsPrefix}paymentVauchers-${year}` )
//console.log(import.meta.env);


const editVaucherPayment = async (payload) => {

  if (!payload.ID) {
    throw new Error("ID is required")
  }

  await createPaymentVaucher(payload)

  return await fetchVaucherPayment(payload)
  try {

    const { paymentId, vaucher, year = 2025 } = payload

    const collectionName = await of(year).pipe(t).toPromise()
    // const docRef = doc(db, 'paymentVauchers-' + year, 'new-user-id')
    const docRef = doc(db, collectionName, paymentId)
    const r = await setDoc(docRef, docRef)
    return { data: r }

  } catch (error) {
    console.error('Error al obtener el documento:', error)
  }
}

const deleteVaucherPayment = async (payload) => {

  try {

    const { id, year = 2025 } = payload

    //const collectionName = "paymentVauchers-2025" // await of(year).pipe(t).toPromise()
    const collectionName = await of(year).pipe(t).toPromise()
    //const collectionName = "test-paymentVauchers-2025"
    const docRef = doc(db, collectionName, id)
    const response = await deleteDoc(docRef)
    return { data: payload,  status: "ok" }

  } catch (e) {
    // console.error('Error al eliminar el vaucher:', error)
    //return e
    //console.log(e);
    return { data: 2 }
  }
}
const createPaymentVaucher = async ({ ID, paymentId, vaucher, year = 2025 }) => {
  try {

    const newId = ID ? ID: uuidv4();
    const collectionName = await of(year).pipe(t).toPromise()
    const newData = { id: paymentId, file: vaucher }
    const docRef = doc(db, collectionName, newId)
    const rs = await setDoc(docRef, newData)

    //console.log(rs)
    return { status: true }

    // const docRef = await addDoc(collection(db, collectionName), newData)
    return rs //await setDoc(docRef, { id: paymentId, file: vaucher })
  } catch (error) {
    console.error('Error al crear el documento:', error)
  }
}

const fetchVaucherPaymentMultiple = async (payments) => {

  const year = 2025
  // const querySnapshot = await getDocs(collection(db, "paymentVauchers"))

  const tableName = await of(year).pipe(t).toPromise()
  const paymentIds = payments.map((o) => {
    return parseInt(o.paymentId)
  })

  const q = query(collection(db, tableName), where("id", "in", paymentIds))
  const querySnapshot = await getDocs(q)

  const documentResponse = querySnapshot.docs.map((doc) => ({...doc.data() }))

  return documentResponse.map((o) => {
    return { vaucher: o.file, paymentId: o.id }
  })
}

const fetchVaucherPayment = async (payment) => {
  // const querySnapshot = await getDocs(collection(db, "paymentVauchers"))

  const { year, id } = payment

  const collectionName = await of(year).pipe(t).toPromise()
  //console.log(collectionName);
  const q = query(collection(db, collectionName), where("id", "==", parseInt(id)))
  // const q = query(collection(db, tableName), where("id", "==", id))
  const querySnapshot = await getDocs(q)

  const documentResponse = querySnapshot.docs.map((doc) => ({...doc.data() }))

  //console.log(documentResponse);
  if (documentResponse.length) {

    return { data: { vaucher: documentResponse[0].file, paymentId: id, status: "ok" } }

  }
  else {
    return { data: { paymentId: id }, status: "ok" }

  }

}

export {
  createPaymentVaucher
  , editVaucherPayment
  , fetchVaucherPayment
  , fetchVaucherPaymentMultiple
  , deleteVaucherPayment
}
