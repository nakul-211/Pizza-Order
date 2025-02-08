import {
  addDoc,
  collection,
  doc,
  getDocs,
  updateDoc,
} from 'firebase/firestore';
import { auth, db } from './firebaseConfig';
import { priorityPrice } from '../features/order/CreateOrder';

const menuCollectionRef = collection(db, 'Pizza-Menu');
const orderCollectionRef = collection(db, 'Pizza-Order');
export async function getMenu() {
  try {
    const menuData = await getDocs(menuCollectionRef);
    const filteredMenuData = menuData.docs.map((doc) => ({
      ...doc.data(),
      id: doc.id,
      // loginUid: auth?.currentUser?.uid || 'local',
    }));

    return filteredMenuData;
  } catch (err) {
    return err;
  }
}

export async function getOrder(id) {
  try {
    const orderData = await getDocs(orderCollectionRef);
    const filteredData = orderData.docs
      .map((doc) => ({
        ...doc.data(),
        id: doc.id,
      }))
      .find(
        (item) => item.id === id,
        // && item.loginUid === (auth?.currentUser?.uid || 'local'),
      );
    return filteredData;
  } catch (err) {
    return err;
  }
}
export async function getAllOrders(id, items) {
  try {
    const orderData = await getDocs(orderCollectionRef);
    const filteredData = orderData.docs
      .map((doc) => ({
        ...doc.data(),
        id: doc.id,
      }))
      .filter(
        (item) => {
          if (item.loginUid === 'local') {
            return items.includes(item.id);
          } else {
            return item.loginUid === id;
          }
        },

        // && item.loginUid === (auth?.currentUser?.uid || 'local'),
      );
    return filteredData;
  } catch (err) {
    return err;
  }
}
export async function createOrder(newOrder) {
  try {
    const data = await addDoc(orderCollectionRef, newOrder);
    return data;
  } catch (err) {
    throw Error('Failed creating your order');
  }
}

export async function updateOrder(id) {
  try {
    const loginUid = auth?.currentUser?.uid || 'local';
    const orderData = await getDocs(orderCollectionRef);
    const filteredData = orderData.docs
      .map((doc) => ({
        ...doc.data(),
        id: doc.id,
        // loginUid: auth?.currentUser?.uid || 'local',
      }))
      .find((item) => item.id === id && item.loginUid === loginUid);
    const orderDoc = doc(db, 'Pizza-Order', id);

    await updateDoc(orderDoc, {
      priorityPrice: filteredData.orderPrice * (priorityPrice / 100),
      priority: true,
    });
  } catch (err) {
    throw Error('Failed updating your order');
  }
}
