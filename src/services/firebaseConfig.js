import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: 'AIzaSyDtG72tM7UMZzkamE1uA35q_lb76I5hFak',
  authDomain: 'nakul-s-fast-react-app.firebaseapp.com',
  projectId: 'nakul-s-fast-react-app',
  storageBucket: 'nakul-s-fast-react-app.firebasestorage.app',
  messagingSenderId: '735861381697',
  appId: '1:735861381697:web:e757eb7d001c5a228b04c0',
  measurementId: 'G-2H3175826Y',
};
const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore();
