import LinkButton from '../../ui/LinkButton';
import { getAllOrders } from '../../services/apiRestaurant';
import PastOrderItem from './PastOrderItem';
import { auth } from '../../services/firebaseConfig';
import { useLoaderData } from 'react-router-dom';

function PastOrders() {
  const allOrders = useLoaderData();
  return (
    <div className="py-2">
      <LinkButton to="/menu">⬅ Back to Menu</LinkButton>
      <p className="mt-2">All Orders</p>
      <ul className="divide-y divide-stone-200 py-4">
        {allOrders
          ? allOrders.map((order) => (
              <PastOrderItem key={order.id} order={order} />
            ))
          : 'Empty List'}
      </ul>
    </div>
  );
}

export default PastOrders;
export async function pastOrdersLoader() {
  const loginUid = auth?.currentUser?.uid || 'local';
  const localOrderIds = JSON.parse(localStorage.getItem('localOrders'));
  const getOrders = await getAllOrders(loginUid, localOrderIds);
  return getOrders;
}
