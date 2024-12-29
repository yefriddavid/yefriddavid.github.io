import React, { useState, useEffect } from 'react';
import { db } from './firebase'; // Importa tu instancia de Firebase
import { collection, getDocs, query, where } from "firebase/firestore";


function DocumentoFirebase({paymentId}) {
  const [documento, setDocumento] = useState(null);
  //alert(paymentId)
  useEffect(() => {
    const obtenerDocumento = async () => {
      try {
        // const querySnapshot = await getDocs(collection(db, "paymentVauchers"))
        const q = query(collection(db, "paymentVauchers"), where("id", "==", parseInt(paymentId)));
        const querySnapshot = await getDocs(q);

        const newData = querySnapshot.docs.map((doc) => ({...doc.data() }));
        setDocumento(newData);
        //const docRef = db.collection('paymentVauchers').doc('test');
        //const docSnap = await docRef.get();

        //if (docSnap.exists()) {
        //  setDocumento(docSnap.data());
        //} else {
        //  console.log('No se encontró el documento');
        //}
      } catch (error) {
        console.error('Error al obtener el documento:', error);
      }
    };

    obtenerDocumento();
  }, []);

  //{documento ? (
  return (
    <div>
      {documento ? (documento.map((i) =>
        <div>
          <img width="250" higth="500" src={i.file} />
          {/* Agrega aquí más campos a mostrar */}
        </div>
      )) : (
        <p>Cargando documento...</p>
      )}
    </div>
  );
}

export default DocumentoFirebase;
