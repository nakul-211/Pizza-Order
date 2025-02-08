import { formatCurrency } from '../../utils/helpers';
import { useDispatch, useSelector } from 'react-redux';
import { addItem } from '../cart/cartSlice';
import DeleteItem from '../cart/DeleteItem';
import UpdateItemQuantity from '../cart/UpdateItemQuantity';
import Button from '../../ui/button';
function MenuItem({ pizza }) {
  const { id, name, unitPrice, ingredients, soldOut, imageUrl } = pizza;
  const dispatch = useDispatch();
  const itemQuantity = useSelector((state) => state.cart.cart).find(
    (item) => item.pizzaId === id && item.quantity > 0,
  )?.quantity;
  function handleAddToCart() {
    const newItem = {
      pizzaId: id,
      name,
      quantity: 1,
      unitPrice,
      totalPrice: unitPrice * 1,
    };
    dispatch(addItem(newItem));
  }
  return (
    <li className="flex gap-4 py-2">
      <img
        src={imageUrl}
        alt={name}
        className={`h-16 sm:h-20 md:h-24 ${soldOut ? 'opacity-70 grayscale' : ''}`}
      />
      <div className="flex w-full flex-col pt-0.5">
        <p className="text-sm font-medium md:text-base">{name}</p>
        <p className="text-xs capitalize italic text-stone-500 sm:text-sm">
          {ingredients.join(', ')}
        </p>
        <div className="mt-auto flex items-center justify-between">
          {!soldOut ? (
            <p className="text-sm font-medium uppercase text-stone-500">
              {formatCurrency(unitPrice)}
            </p>
          ) : (
            <p className="text-sm sm:text-base">Sold out</p>
          )}

          {!soldOut && itemQuantity && (
            <div className="flex items-center gap-4 sm:gap-8">
              <UpdateItemQuantity pizzaId={id} currentQuantity={itemQuantity} />
              <DeleteItem pizzaId={id} />
            </div>
          )}
          {!soldOut && !itemQuantity && (
            <Button type="small" onClick={handleAddToCart}>
              ADD TO CART
            </Button>
          )}
        </div>
      </div>
    </li>
  );
}

export default MenuItem;
