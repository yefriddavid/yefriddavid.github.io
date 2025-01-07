import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyBCul4mFCoDYWWKwBjNUrkPQSbmq6vXi4g",
  authDomain: "cashflow-9cbbc.firebaseapp.com",
  //databaseURL: "TU_DATABASE_URL",
  projectId: "cashflow-9cbbc",
  storageBucket: "cashflow-9cbbc.appspot.com",
  messagingSenderId: "221005846539",
  appId: "1:221005846539:web:b51908636c88cb25998f0e"
}

const app = initializeApp(firebaseConfig)
export const db = getFirestore(app)

