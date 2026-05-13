import { initializeApp } from 'firebase/app';
import { getFirestore, collection, addDoc } from 'firebase/firestore';

// Firebase config (from src/environments/environment.ts)
const firebaseConfig = {
  apiKey: "AIzaSyDcj4iyVh3D5LR7Dk0jaNpZayN36oDh2I8",
  authDomain: "camino-ae620.firebaseapp.com",
  projectId: "camino-ae620",
  storageBucket: "camino-ae620.firebasestorage.app",
  messagingSenderId: "1052801805310",
  appId: "1:1052801805310:web:fe9560540584ed7b502eaf",
  measurementId: "G-QVRET2NS1W"
};

async function run() {
  try {
    const app = initializeApp(firebaseConfig);
    const db = getFirestore(app);

    const ref = collection(db, 'messages');
    const docRef = await addDoc(ref, {
      name: 'Automated Test',
      text: 'This is a test message sent by the helper script.',
      created: new Date().toISOString()
    });

    console.log('Successfully added message with id:', docRef.id);
  } catch (err) {
    console.error('Failed to add test message:', err);
    process.exitCode = 1;
  }
}

run();
