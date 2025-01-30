import { useDispatch } from 'react-redux';
import {
  calcMinutesLeft,
  formatCurrency,
  formatDate,
} from '../../utils/helpers';
import { repeatItem } from '../cart/cartSlice';
import { useNavigate } from 'react-router-dom';

function PastOrderItem({ order }) {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const {
    id,
    priorityPrice,
    cart,
    delivered,
    orderDate,
    orderPrice,
    estimatedDelivery,
  } = order;
  const deliveryIn = calcMinutesLeft(estimatedDelivery);
  function handleRepeatItem() {
    dispatch(repeatItem(cart));
    navigate('/cart');
  }
  return (
    <li className="mt-2 py-2">
      <div className="flex flex-col place-content-between justify-between gap-2 text-sm">
        <div className="flex justify-between">
          <div className="flex flex-col sm:flex-row">
            <span>Order Date:</span>
            <span>{formatDate(orderDate)}</span>
          </div>
          <span>
            {delivered ? (
              <p className="font-medium">Delivered✅</p>
            ) : (
              <>
                <p className="font-medium">
                  {deliveryIn >= 0
                    ? `Only ${calcMinutesLeft(estimatedDelivery)} minutes left...`
                    : 'Order should have arrived'}
                </p>
                <p className="hidden text-xs text-stone-500 sm:inline">
                  (Estimated delivery: {formatDate(estimatedDelivery)})
                </p>
              </>
            )}
          </span>
        </div>
        <div>
          {cart.map((cartItem) => (
            // <div className="flex justify-between" key={cartItem.pizzaId}>
            //   <p>
            //     <span>{cartItem.quantity}x </span>
            //     {cartItem.name}
            //   </p>
            //   <p>{formatCurrency(cartItem.totalPrice)}</p>
            // </div>
            <span key={cartItem.pizzaId}>
              {cartItem.quantity}x {cartItem.name},{' '}
            </span>
          ))}
        </div>
        <div className="flex justify-between">
          <div>
            <p>Order Price:{formatCurrency(orderPrice + priorityPrice)}</p>
          </div>
          <div className="flex gap-4">
            {delivered && (
              <button
                onClick={handleRepeatItem}
                className="inline-block rounded-full border-2 border-stone-300 px-2 py-1 text-sm font-semibold uppercase tracking-wide text-stone-400 transition-colors duration-300 hover:bg-stone-300 hover:text-stone-800 focus:bg-stone-300 focus:text-stone-800 focus:outline-none focus:ring focus:ring-stone-200 focus:ring-offset-2 disabled:cursor-not-allowed"
              >
                REPEAT
              </button>
            )}
            <button
              onClick={() => navigate(`/order/${id}`)}
              className="text-base"
            >
              ℹ️
            </button>
          </div>
        </div>
      </div>
    </li>
  );
}

export default PastOrderItem;
