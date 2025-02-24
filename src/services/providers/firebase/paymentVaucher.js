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
import * as yup from 'yup'


const tablsPrefix = import.meta.env.VITE_APP_TABLES_PREFIX
const t = map( year => `${tablsPrefix}paymentVauchers-${year}` )
//console.log(import.meta.env);

const schemaBasic = yup.object().shape({
  year: yup.number().required('Year is required').typeError('Year must be a number'),
  paymentId: yup.number().required('paymentId is required').typeError('Year must be a number'),
})

const schemaCreateAndEdit = yup.object().shape({
  // ID: yup.string().required('ID is required').typeError('Year must be a string'),
  vaucher: yup.string().required('vaucher is required').typeError('Year must be a string'),
}).concat(schemaBasic)


const editVaucherPayment = async (payload) => {

  await schemaCreateAndEdit.validate(payload)
  const { paymentId, vaucher, year } = payload

  const newId = paymentId
  const collectionName = await of(year).pipe(t).toPromise()
  const newData = { file: vaucher }
  //const docRef = doc(db, collectionName, newId)
  //const rs = await setDoc(docRef, newData)

  return { status: true }

}

const deleteVaucherPayment = async (payload) => {

  await schemaBasic.validate(payload);
  const { id, year = 2025 } = payload

  //const collectionName = "paymentVauchers-2025" // await of(year).pipe(t).toPromise()
  const collectionName = await of(year).pipe(t).toPromise()
  //const collectionName = "test-paymentVauchers-2025"
  const docRef = doc(db, collectionName, id)
  const response = await deleteDoc(docRef)
  return { data: payload,  status: "ok" }

}
const createPaymentVaucher = async (payload) => {

  await schemaCreateAndEdit.validate(payload)
  const { paymentId, vaucher, year } = payload

  const newId = paymentId // ID ? ID: uuidv4();
  const collectionName = await of(year).pipe(t).toPromise()
  const newData = { file: vaucher }
  console.log(newData)
  console.log(collectionName)
  //const docRef = doc(db, collectionName, newId)
  //// const rs = await setDoc(docRef, newData)

  //return { status: true }

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
