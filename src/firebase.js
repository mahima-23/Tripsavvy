import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyAniCpNDkEKFuzC4akLDLtyQgczRLUo4tc",
  authDomain: "fir-auth-8ba5e.firebaseapp.com",
  projectId: "fir-auth-8ba5e",
  storageBucket: "fir-auth-8ba5e.appspot.com",
  messagingSenderId: "1067238815703",
  appId: "1:1067238815703:web:cba599cf5a54f0641fbd92",
  measurementId: "G-MSCWGW42DW"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);

export default app;