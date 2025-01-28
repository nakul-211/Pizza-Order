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
    console.log('Logout');
    await signOut(auth);
    dispatch(handleLogout());
    navigate('/');
  };
  onAuthStateChanged(auth, (user) => {
    dispatch(
      handleLogin({
        method: user?.providerData[0].providerId || '',
        uid: user?.providerData[0].uid || '',
      }),
    );
  });
  return (
    <header className="px flex items-center justify-between border-b border-stone-200 bg-yellow-500 px-4 py-3 uppercase sm:px-6">
      <Link to="/" className="tracking-widest">
        Fast React Pizza Company
      </Link>
      <div className="flex flex-row items-center justify-center gap-4">
        {/* <SearchOrder /> */}

        {method === '' ? (
          ''
        ) : (
          <button
            className="inline-block rounded-full bg-red-600 px-2 py-1 text-xs font-semibold uppercase tracking-wide text-stone-50 transition-colors duration-300 hover:bg-red-700 focus:bg-red-300 focus:outline-none focus:ring focus:ring-red-300 focus:ring-offset-2 disabled:cursor-not-allowed"
            onClick={onLogoutButton}
          >
            Logout
          </button>
        )}

        <Username />
      </div>
    </header>
  );
}

export default Header;
