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
  const { lastInfoName, lastInfoPhone, lastInfoAddress, lastInfoPosition } =
    JSON.parse(localStorage.getItem('lastInfo')) || {};
  const {
    username,
    status: addressStatus,
    position,
    error: errorAddress,
  } = useSelector((state) => state.user);
  console.log(
    lastInfoName,
    lastInfoPhone,
    lastInfoAddress,
    lastInfoPosition,
    'lastInfo',
  );

  const isLoadingAddress = addressStatus === 'loading';
  const cart = useSelector(getCart);
  const [withPriority, setWithPriority] = useState(false);
  const dispatch = useDispatch();
  const totalCartPrice = useSelector(getTotalCartPrice);
  // const [resetCurrPos, setResetCurrPos] = useState(false);

  const totalPrice = withPriority
    ? totalCartPrice * (1 + priorityPrice / 100)
    : totalCartPrice;
  if (!cart.length) return <EmptyCart />;
  return (
    <div>
      <h2 className="mb-8 text-xl font-semibold">Ready to order? Lets go!</h2>

      <Form autoComplete="on" method="POST" action="/order/new">
        <div className="mb-5 flex flex-col gap-2 sm:flex-row sm:items-center">
          <label className="sm:basis-40">First Name</label>
          <div className="grow">
            <input
              className="input w-full"
              type="text"
              placeholder="name..."
              name="customer"
              defaultValue={lastInfoName || username}
              required
            />
          </div>
        </div>

        <div className="mb-5 flex flex-col gap-2 sm:flex-row sm:items-center">
          <label className="sm:basis-40">Phone number</label>
          <div className="grow">
            <input
              className="input w-full"
              type="tel"
              name="phone"
              placeholder="enter a 10 digit phone no."
              defaultValue={lastInfoPhone || ''}
              required
              pattern="[0-9]{10}"
            />

            {formErrors?.phone && (
              <p className="mt-2 rounded-md bg-red-100 p-2 text-xs text-red-700">
                {formErrors.phone}
              </p>
            )}
          </div>
        </div>

        <div className="mb-5 flex flex-col gap-2 sm:flex-row sm:items-start">
          <label className="py-1.5 sm:basis-40 md:py-3">Address</label>
          <div className="flex grow items-start gap-2">
            <Button
              type="small"
              disabled={isLoadingAddress}
              onClick={(e) => {
                e.preventDefault();
                dispatch(fetchAddress());
              }}
            >
              <div className="flex flex-col sm:flex-row sm:gap-1">
                {lastInfoPosition ? <div>Reset</div> : <div>GET </div>}

                <div> POSITION</div>
              </div>
            </Button>

            <div className="w-full grow">
              <input
                className="input w-full"
                type="text"
                disabled={isLoadingAddress}
                pattern="^[a-zA-Z0-9\s.,#\-\/]+$"
                defaultValue={lastInfoAddress || ''}
                name="address"
                required
              />
              {addressStatus === 'error' ? (
                <p className="mt-2 rounded-md bg-red-100 p-2 text-xs text-red-700">
                  {errorAddress}
                </p>
              ) : (
                lastInfoPosition &&
                !Object.keys(position).length && (
                  <p className="mt-2 rounded-md bg-stone-100 p-2 text-xs text-stone-700">
                    Click reset Position to send your current location
                  </p>
                )
              )}
            </div>
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
                : lastInfoPosition
            }
          />

          <Button
            type="primary"
            disabled={isLoadingAddress || isLoadingAddress}
          >
            {isSubmitting || isLoadingAddress
              ? isLoadingAddress
                ? 'fetching Address..'
                : 'Placing Order...'
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
  const loginUid = auth?.currentUser?.uid || 'local';
  const orderStoredValue =
    JSON.parse(localStorage.getItem('localOrders')) || [];
  const orderPrice = orderCart.reduce((acc, item) => {
    return acc + item.totalPrice;
  }, 0);
  const orderQuantity = orderCart.reduce((acc, item) => {
    return acc + item.quantity;
  }, 0);
  let estimatedTime = new Date();
  estimatedTime.setMinutes(estimatedTime.getMinutes() + 15 * orderQuantity);

  estimatedTime = estimatedTime.toISOString();

  let currentDate = new Date();
  currentDate = currentDate.toISOString();
  const order = {
    ...data,
    cart: orderCart,
    priority: data.priority === 'true',
    orderPrice: orderPrice,
    priorityPrice:
      data.priority === 'true'
        ? Math.ceil((priorityPrice / 100) * orderPrice)
        : 0,
    orderDate: currentDate,
    estimatedDelivery: estimatedTime,
    delivered: false,
    loginUid,
  };

  const errors = {};
  if (!isValidPhone(order.phone))
    errors.phone =
      'Please give us your correct phone number. We might need it to contact you';

  if (Object.keys(errors).length > 0) return errors;
  const newOrder = await createOrder(order);
  loginUid !== 'local' ||
    localStorage.setItem(
      'localOrders',
      JSON.stringify([...orderStoredValue, newOrder.id]),
    );
  localStorage.setItem(
    'lastInfo',
    JSON.stringify({
      lastInfoName: order.customer,
      lastInfoPhone: order.phone,
      lastInfoAddress: order.address,
      lastInfoPosition: order.position || '',
    }),
  );
  store.dispatch(clearCart());
  return redirect(`/order/${newOrder.id}`);
}

export default CreateOrder;
