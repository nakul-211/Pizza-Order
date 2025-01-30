import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import { getAddress } from '../../services/apiGeocoding';
function getPosition() {
  return new Promise(function (resolve, reject) {
    navigator.geolocation.getCurrentPosition(resolve, reject);
  });
}

export const fetchAddress = createAsyncThunk(
  'user/fetchAddress',
  async function () {
    // 1) We get the user's geolocation position
    const positionObj = await getPosition();
    const position = {
      latitude: positionObj.coords.latitude,
      longitude: positionObj.coords.longitude,
    };

    const addressObj = await getAddress(position);
    const address = `${addressObj?.locality}, ${addressObj?.city} ${addressObj?.postcode}, ${addressObj?.countryName}`;

    return { position, address };
  },
);
const initialState = {
  loginMethod: '',
  loginUid: '',
  username: '',
  status: 'idle',
  position: {},
  address: '',
  error: '',
  //  prevOrders: [],
};

const userSlice = createSlice({
  name: 'user',
  initialState,
  reducers: {
    updateName(state, action) {
      state.username = action.payload;
    },
    handleLogin(state, action) {
      state.loginMethod = action.payload.method;
      state.loginUid = action.payload.uid;
      //      state.prevOrders = action.payload.orders;
    },
    handleLogout(state) {
      state.loginMethod = '';
      state.loginUid = 'local';
      state.username = '';
      state.status = 'idle';
      state.position = {};
      state.address = '';
      state.error = '';
    },
  },
  extraReducers: (builder) =>
    builder
      .addCase(fetchAddress.pending, (state) => {
        state.status = 'loading';
      })
      .addCase(fetchAddress.fulfilled, (state, action) => {
        state.position = action.payload.position;
        state.address = action.payload.address;
        state.status = 'idle';
      })
      .addCase(fetchAddress.rejected, (state, action) => {
        state.status = 'error';
        state.error = action.error.message;
      }),
});

export const { updateName, handleLogin, handleLogout } = userSlice.actions;
export default userSlice.reducer;
