import { useEffect, useState } from 'react';
import LinkButton from '../../ui/LinkButton';
import { getAllOrders } from '../../services/apiRestaurant';
import { useSelector } from 'react-redux';

function PastOrders() {
  const loginUid = useSelector((state) => state.user.loginUid);
  const localOrderIds = JSON.parse(localStorage.getItem('localOrders'));
  const [orders, setOrders] = useState([]);
  useEffect(() => {
    async function fetchOrders() {
      const getOrders = await getAllOrders(loginUid, localOrderIds);
      getOrders.sort(
        (a, b) => new Date(b.currentDate) - new Date(a.currentDate),
      );
      setOrders(getOrders);
      return;
    }
    fetchOrders();
  }, [loginUid]);
  console.log(orders);

  return (
    <div>
      <LinkButton to="/menu">⬅ Menu</LinkButton>
    </div>
  );
}

export default PastOrders;
