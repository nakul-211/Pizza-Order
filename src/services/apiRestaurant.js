import {
  addDoc,
  collection,
  doc,
  getDocs,
  updateDoc,
} from 'firebase/firestore';
import { db } from './firebaseConfig';
import { priorityPrice } from '../features/order/CreateOrder';

const menuCollectionRef = collection(db, 'Pizza-Menu');
const orderCollectionRef = collection(db, 'Pizza-Order');
export async function getMenu() {
  try {
    const menuData = await getDocs(menuCollectionRef);
    const filteredMenuData = menuData.docs.map((doc) => ({
      ...doc.data(),
      id: doc.id,
    }));

    return filteredMenuData;
  } catch (err) {
    return err;
  }
}

export async function getOrder(id) {
  const orderData = await getDocs(orderCollectionRef);
  const filteredData = orderData.docs
    .map((doc) => ({
      ...doc.data(),
      id: doc.id,
    }))
    .find((item) => item.id === id);
  return filteredData;
}

export async function createOrder(newOrder) {
  try {
    const data = await addDoc(orderCollectionRef, newOrder);
    return data;
  } catch (err) {
    throw Error('Failed creating your order');
  }
}

export async function updateOrder(id, updateObj) {
  try {
    const orderData = await getDocs(orderCollectionRef);
    const filteredData = orderData.docs
      .map((doc) => ({
        ...doc.data(),
        id: doc.id,
      }))
      .find((item) => item.id === id);
    const orderDoc = doc(db, 'Pizza-Order', id);

    await updateDoc(orderDoc, {
      priorityPrice: filteredData.orderPrice * (priorityPrice / 100),
      priority: true,
    });
  } catch (err) {
    throw Error('Failed updating your order');
  }
}
