import { Form, redirect, useActionData, useNavigation } from 'react-router-dom';
import { createOrder } from '../../services/apiRestaurant';
import Button from '../../ui/button';
import { useDispatch, useSelector } from 'react-redux';
import { clearCart, getCart, getTotalCartPrice } from '../cart/cartSlice';
import EmptyCart from '../cart/EmptyCart';
import store from '../../store.js';
import { formatCurrency } from '../../utils/helpers';
import { useState } from 'react';
import { fetchAddress } from '../user/userSlice.js';
import { auth } from '../../services/firebaseConfig.js';
const isValidPhone = (str) =>
  /^\+?\d{1,4}?[-.\s]?\(?\d{1,3}?\)?[-.\s]?\d{1,4}[-.\s]?\d{1,4}[-.\s]?\d{1,9}$/.test(
    str,
  );
export const priorityPrice = 20;

function CreateOrder() {
  const navigation = useNavigation();
  const isSubmitting = navigation.state === 'submitting';
  const formErrors = useActionData();
  const {
    username,
    status: addressStatus,
    position,
    address,
    error: errorAddress,
  } = useSelector((state) => state.user);
  const isLoadingAddress = addressStatus === 'loading';
  const cart = useSelector(getCart);
  const loginUid = useSelector((state) => state.user.loginUid);
  const [withPriority, setWithPriority] = useState(false);
  const dispatch = useDispatch();
  const totalCartPrice = useSelector(getTotalCartPrice);

  const totalPrice = withPriority
    ? totalCartPrice * (1 + priorityPrice / 100)
    : totalCartPrice;
  if (!cart.length) return <EmptyCart />;
  return (
    <div>
      <h2 className="mb-8 text-xl font-semibold">Ready to order? Lets go!</h2>

      <Form method="POST" action="/order/new">
        <div className="mb-5 flex flex-col gap-2 sm:flex-row sm:items-center">
          <label className="sm:basis-40">First Name</label>
          <div className="grow">
            <input
              className="input w-full"
              type="text"
              name="customer"
              defaultValue={username}
              required
            />
          </div>
        </div>

        <div className="mb-5 flex flex-col gap-2 sm:flex-row sm:items-center">
          <label className="sm:basis-40">Phone number</label>
          <div className="grow">
            <input className="input w-full" type="tel" name="phone" required />

            {formErrors?.phone && (
              <p className="mt-2 rounded-md bg-red-100 p-2 text-xs text-red-700">
                {formErrors.phone}
              </p>
            )}
          </div>
        </div>

        <div className="mb-5 flex flex-col items-start gap-2 sm:flex-row">
          <label className="sm:basis-40">Address</label>

          {!position.latitude && !position.longitude && (
            <Button
              type="small"
              className="bg-yellow-100"
              disabled={isLoadingAddress}
              onClick={(e) => {
                e.preventDefault();
                dispatch(fetchAddress());
              }}
            >
              <div>GET POSITION</div>
            </Button>
          )}

          <div className="w-full grow">
            <input
              className="input w-full"
              type="text"
              disabled={isLoadingAddress}
              defaultValue={address}
              name="address"
              required
            />
            {addressStatus === 'error' && (
              <p className="mt-2 rounded-md bg-red-100 p-2 text-xs text-red-700">
                {errorAddress}
              </p>
            )}
          </div>
        </div>

        <div className="mb-12 flex items-center gap-5">
          <input
            className="h-6 w-6 accent-yellow-400 focus:outline-none focus:ring focus:ring-yellow-400 focus:ring-offset-2"
            type="checkbox"
            name="priority"
            id="priority"
            value={withPriority}
            onChange={(e) => setWithPriority(e.target.checked)}
          />
          <label className="font-medium" htmlFor="priority">
            Want to yo give your order priority?
          </label>
        </div>

        <div>
          <input type="hidden" name="cart" value={JSON.stringify(cart)} />

          <input
            type="hidden"
            name="position"
            value={
              position.longitude && position.latitude
                ? `${position.latitude} , ${position.longitude}`
                : ''
            }
          />

          <Button type="primary">
            {isSubmitting || isLoadingAddress
              ? 'Placing Order...'
              : `Order now from ${formatCurrency(totalPrice)}`}
          </Button>
        </div>
      </Form>
    </div>
  );
}

export async function action({ request }) {
  const formData = await request.formData();
  const data = Object.fromEntries(formData);
  const orderCart = JSON.parse(data.cart);
  const orderPrice = orderCart.reduce((acc, item) => {
    return acc + item.totalPrice;
  }, 0);
  const orderQuantity = orderCart.reduce((acc, item) => {
    return acc + item.quantity;
  }, 0);
  const currentDate = new Date();
  currentDate.setMinutes(currentDate.getMinutes() + 15 * orderQuantity);
  const estimatedTime = currentDate.toISOString();
  const order = {
    ...data,
    cart: orderCart,
    priority: data.priority === 'true',
    orderPrice: orderPrice,
    priorityPrice:
      data.priority === 'true'
        ? Math.ceil((priorityPrice / 100) * orderPrice)
        : 0,
    estimatedDelivery: estimatedTime,
    loginUid: auth?.currentUser?.uid || 'local',
  };

  const errors = {};
  if (!isValidPhone(order.phone))
    errors.phone =
      'Please give us your correct phone number. We might need it to contact you';

  if (Object.keys(errors).length > 0) return errors;
  const newOrder = await createOrder(order);

  store.dispatch(clearCart());
  return redirect(`/order/${newOrder.id}`);
}

export default CreateOrder;
