import { useState } from 'react';
import Button from '../../ui/button';
import { useDispatch, useSelector } from 'react-redux';
import { handleLogin, updateName } from './userSlice';
import { useNavigate } from 'react-router-dom';
import {
  auth,
  googleProvider,
  gitHubProvider,
} from '../../services/firebaseConfig';
import { signInWithPopup } from 'firebase/auth';

function CreateUser() {
  const [username, setUsername] = useState('');
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const method = useSelector((state) => state.user.loginMethod);
  const loginUid = useSelector((state) => state.user.loginUid);

  function handleSubmit(e) {
    e.preventDefault();
    if (!username && !loginUid) return;
    loginUid === '' ? dispatch(handleLogin({ method: 'Local' })) : '';
    dispatch(updateName(username));
    navigate('/menu');
  }
  const onGoogleLoginButton = async function (e) {
    e.preventDefault();
    const user = await signInWithPopup(auth, googleProvider);
    const googleUsername = user.user.displayName;
    setUsername(googleUsername);
  };
  const onGithubLoginButton = async function (e) {
    e.preventDefault();

    const user = await signInWithPopup(auth, gitHubProvider);
    const githubUsername = user.user.displayName;
    setUsername(githubUsername);
  };

  return (
    <form onSubmit={handleSubmit}>
      <p className="mb-4 text-sm text-stone-600 md:text-base">
        👋 Welcome! Please start by telling us your name:
      </p>
      <input
        type="text"
        placeholder="Your full name"
        value={username}
        onChange={(e) => setUsername(e.target.value)}
        className="input mb-3 w-72"
      />
      <div>
        OR
        <br />
        <button
          disabled={auth?.currentUser?.uid}
          onClick={onGoogleLoginButton}
          className="mt-3 w-80 border-stone-800 bg-stone-50 px-4 py-2 transition-all hover:bg-stone-100"
        >
          {method === 'google.com' ? (
            <span>Logged In</span>
          ) : (
            <span>Login to Google</span>
          )}
        </button>
        <br />
        <button
          disabled={auth?.currentUser?.uid}
          onClick={onGithubLoginButton}
          className="mb-4 mt-2 w-80 border-stone-800 bg-stone-50 px-4 py-2 transition-all hover:bg-stone-100"
        >
          {method === 'github.com' ? (
            <span>Logged In</span>
          ) : (
            <span>Login to Github</span>
          )}
        </button>
      </div>
      {(username !== '' || auth?.currentUser) && (
        <div>
          <Button type="primary">Start ordering</Button>
        </div>
      )}
    </form>
  );
}

export default CreateUser;
