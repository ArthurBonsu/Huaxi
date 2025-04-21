import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

import { getAnalytics } from "firebase/analytics";
 const firebaseConfig = {
  apiKey: "AIzaSyBlrbUnh0Ggf-5X66dpwgSJ7coeF4hp7bI",
  authDomain: "energypricer.firebaseapp.com",
  projectId: "energypricer",
  storageBucket: "energypricer.appspot.com",
  messagingSenderId: "720397343474",
  appId: "1:720397343474:web:5373868b8bdc7487ef0e6b",
  measurementId: "G-1Z1R0XSGQ4"
};

const app = initializeApp(firebaseConfig);

 const auth = getAuth(app);
 const db = getFirestore(app);

 //const analytics = getAnalytics(app);

export { auth, db }