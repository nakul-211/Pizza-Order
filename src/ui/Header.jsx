import { Link, useNavigate } from 'react-router-dom';
// import SearchOrder from '../features/order/SearchOrder';
import Username from '../features/user/Username';
import { onAuthStateChanged, signOut } from 'firebase/auth';
import { auth } from '../services/firebaseConfig';
import { useDispatch, useSelector } from 'react-redux';
import { handleLogin, handleLogout } from '../features/user/userSlice';
function Header() {
  const dispatch = useDispatch();
  const method = useSelector((state) => state.user.loginMethod);
  const navigate = useNavigate();
  const onLogoutButton = async function () {
    // console.log('Logout');
    await signOut(auth);
    dispatch(handleLogout());
    navigate('/');
  };
  const onPastOrdersButton = function () {
    navigate('/pastorders');
  };

  onAuthStateChanged(auth, async (user) => {
    const loginUid = user?.reloadUserInfo.localId || 'local';
    //   const allOrders = await getAllOrders(loginUid, items);
    dispatch(
      handleLogin({
        method: user?.providerData[0].providerId || '',
        uid: loginUid,
        // orders: allOrders || items,
      }),
    );
    // console.log(allOrders);
  });
  return (
    <header className="flex items-center justify-between border-b border-stone-200 bg-yellow-500 px-3 py-2 uppercase sm:px-6">
      <Link to="/" className="text-sm tracking-widest">
        Fast React Pizza Company
      </Link>
      <div className="flex flex-row items-center justify-center gap-4">
        {' '}
        <Username />
        <button
          onClick={onPastOrdersButton}
          className="inline-block rounded-full bg-green-600 px-2 py-1 text-xs font-semibold uppercase tracking-wide text-stone-50 transition-colors duration-300 hover:bg-green-700 focus:bg-green-700 disabled:cursor-not-allowed"
        >
          Orders
        </button>
        {method === '' ? (
          ''
        ) : (
          <button
            className="inline-block rounded-full bg-red-600 px-2 py-1 text-xs font-semibold uppercase tracking-wide text-stone-50 transition-colors duration-300 hover:bg-red-700 focus:bg-red-700 focus:outline-none focus:ring focus:ring-red-700 focus:ring-offset-2 disabled:cursor-not-allowed"
            onClick={onLogoutButton}
          >
            Logout
          </button>
        )}
      </div>
    </header>
  );
}

export default Header;
