
//import firebase from 'firebase/app';
//import 'firebase/firestore'; // Importa los módulos necesarios


import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";

// Tu configuración de Firebase
const firebaseConfig = {
  apiKey: "AIzaSyBCul4mFCoDYWWKwBjNUrkPQSbmq6vXi4g",
  authDomain: "cashflow-9cbbc.firebaseapp.com",
  //databaseURL: "TU_DATABASE_URL",
  projectId: "cashflow-9cbbc",
  storageBucket: "cashflow-9cbbc.appspot.com",
  messagingSenderId: "221005846539",
  appId: "1:221005846539:web:b51908636c88cb25998f0e"
};

// Inicializa la aplicación de Firebase
//firebase.initializeApp(firebaseConfig);
//
//// Exporta las referencias a los servicios que necesites
//const db = firebase.firestore()
//export { db }

const app = initializeApp(firebaseConfig);
// Export firestore database
// It will be imported into your react app whenever it is needed
export const db = getFirestore(app);

//    apiKey: 'AIzaSyBCul4mFCoDYWWKwBjNUrkPQSbmq6vXi4g',
//    appId: '1:221005846539:web:b51908636c88cb25998f0e',
//    messagingSenderId: '221005846539',
//    projectId: 'cashflow-9cbbc',
//    authDomain: 'cashflow-9cbbc.firebaseapp.com',
//    storageBucket: 'cashflow-9cbbc.appspot.com',

