import { createAsyncThunk, createSlice, PayloadAction } from "@reduxjs/toolkit";
import { RootState } from "../store";
import { UserInfo } from "../../submodule/models/user";
import { apiLogin, apiRegister } from "../../api/services";
import { apiGetUserFromToken } from "../../api/user";
import TTCSconfig from "../../submodule/common/config";
// import _ from "lodash";

export interface UserState {
  userInfo: UserInfo | null;
  loading: boolean;
  loadingCheckLogin: boolean;
}

const initialState: UserState = {
  userInfo: null,
  loading: false,
  loadingCheckLogin: true
};

export const requestLogin = createAsyncThunk("auth/login", async (props: { account: string; password: string }) => {
    const res = await apiLogin(props);
    return res.data;
  }
);


export const requestRegister = createAsyncThunk("auth/register", async (props: { userInfo: UserInfo }) => {
  const res = await apiRegister(props);
  return res.data
})

export const requestGetUserFromToken = createAsyncThunk("user/requestGetUserFromToken", async (props: { token: string }) => {
  const res = await apiGetUserFromToken(props.token);
  return res.data
})

export const authSlice = createSlice({
  name: "user",
  initialState,
  reducers: {
    loadUserInfo: (state, action: PayloadAction<UserInfo>) => {
      state.userInfo = action.payload;
    },
  },
  extraReducers: (builder) => {
    /**
     * login
     */
    builder.addCase(requestLogin.pending, (state) => {
      state.loading = true;
    });
    builder.addCase(
      requestLogin.fulfilled,
      (state, action: PayloadAction<any>) => {
        state.loading = false;
        state.userInfo = new UserInfo(action.payload.userLogin);
      }
    );
    // requestGetUserFromToken
    builder.addCase(requestGetUserFromToken.pending, (state) => {
      state.loadingCheckLogin = true;
    });
    builder.addCase(requestGetUserFromToken.fulfilled, (state, action: PayloadAction<{
      status: number,
      userInfo: UserInfo
    }>) => {
      console.log(action.payload);

      state.userInfo = action.payload.userInfo;
      state.loadingCheckLogin = false
    });

    /**
     * register
     */
    builder.addCase(requestRegister.pending, (state) => {
      state.loading = true;
    });
    builder.addCase(requestRegister.fulfilled, (state, action: PayloadAction<any>) => {
      state.loading = false;
      if(action.payload.loginCode === TTCSconfig.STATUS_SUCCESS)
      state.userInfo = new UserInfo(action.payload.info);
    });
    builder.addCase(requestRegister.rejected, (state, action: PayloadAction<any>) => {
      state.loading = false;
    })
  },
});

export const authState = (state: RootState) => state.authState;

export const { loadUserInfo } = authSlice.actions;
export default authSlice.reducer;
