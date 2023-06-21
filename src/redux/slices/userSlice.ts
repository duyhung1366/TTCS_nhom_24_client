import { createAsyncThunk, createSlice, PayloadAction } from "@reduxjs/toolkit";
import { RootState } from "../store";
import { UserInfo } from "../../submodule/models/user";
import { apiLogin, apiLoginWithGoogle, apiRegister } from "../../api/auth";
import {
  apiChangePassword,
  apiGetUserFromToken,
  apiUpdateStudiedForUser,
  apiUpdateUser,
} from "../../api/user";
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
  loadingCheckLogin: true,
};

export const requestLogin = createAsyncThunk(
  "auth/login",
  async (props: { account: string; password: string }) => {
    const res = await apiLogin(props);
    return res.data;
  }
);

export const requestRegister = createAsyncThunk(
  "auth/register",
  async (props: { userInfo: UserInfo }) => {
    const res = await apiRegister(props);
    return res.data;
  }
);

export const requestLoginWithGoogle = createAsyncThunk(
  "auth/loginGoogle",
  async (props: {
    name: string;
    account: string;
    googleId: string;
    avatar: string;
    email: string;
  }) => {
    const res = await apiLoginWithGoogle(props);
    return res.data;
  }
);

export const requestGetUserFromToken = createAsyncThunk(
  "user/requestGetUserFromToken",
  async (props: { token: string }) => {
    const res = await apiGetUserFromToken(props.token);
    return res.data;
  }
);

export const requestUpdateUserInfo = createAsyncThunk(
  "user/updateUserInfo",
  async (props: { token: any; userInfo: any }) => {
    const res = await apiUpdateUser(props);
    return res.data;
  }
);

export const requestChangePassword = createAsyncThunk(
  "user/changePassword",
  async (props: { token: any; password: string; newPassword: string }) => {
    const res = await apiChangePassword(props);
    return res.data;
  }
);

export const requestUpdateStudiedForUser = createAsyncThunk(
  "user/updateStudiedForUser",
  async (props: {
    idTopic: string;
    idCourse: string;
    idUser: string;
    status?: number;
    timeStudy: number;
    score?: number;
    correctQuestion?: number;
    answers?: Array<{
      idQuestion: string;
      idAnswer: string;
    }>;
  }) => {
    const res = await apiUpdateStudiedForUser(props);
    return res.data;
  }
);

export const authSlice = createSlice({
  name: "user",
  initialState,
  reducers: {
    loadUserInfo: (state, action: PayloadAction<UserInfo>) => {
      state.userInfo = action.payload;
    },
    setLoadingCheckLogin: (state, action: PayloadAction<boolean>) => {
      state.loadingCheckLogin = action.payload
    }
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
    builder.addCase(
      requestGetUserFromToken.fulfilled,
      (
        state,
        action: PayloadAction<{
          status: number;
          userInfo: UserInfo;
        }>
      ) => {
        state.userInfo = action.payload.userInfo;
        state.loadingCheckLogin = false;
      }
    );
    builder.addCase(requestGetUserFromToken.rejected, (state) => {
      state.loadingCheckLogin = false;
    });

    /**
     * register
     */
    builder.addCase(requestRegister.pending, (state) => {
      state.loading = true;
    });
    builder.addCase(
      requestRegister.fulfilled,
      (state, action: PayloadAction<any>) => {
        state.loading = false;
        if (action.payload.loginCode === TTCSconfig.STATUS_SUCCESS)
          state.userInfo = new UserInfo(action.payload.info);
      }
    );
    builder.addCase(
      requestRegister.rejected,
      (state, action: PayloadAction<any>) => {
        state.loading = false;
      }
    );

    /**
     * loginWithGoogle
     */
    builder.addCase(requestLoginWithGoogle.pending, (state) => {
      state.loading = true;
    });
    builder.addCase(
      requestLoginWithGoogle.fulfilled,
      (state, action: PayloadAction<any>) => {
        state.loading = false;
        if (action.payload.loginCode === TTCSconfig.STATUS_SUCCESS)
          state.userInfo = new UserInfo(action.payload.userInfo);
      }
    );
    builder.addCase(
      requestLoginWithGoogle.rejected,
      (state, action: PayloadAction<any>) => {
        state.loading = false;
      }
    );

    /**
     * updateUser
     */
    builder.addCase(requestUpdateUserInfo.pending, (state) => {
      state.loading = true;
    });
    builder.addCase(
      requestUpdateUserInfo.fulfilled,
      (state, action: PayloadAction<any>) => {
        state.loading = false;
        state.userInfo = new UserInfo(action.payload.userInfo);
      }
    );

    /**
     * changePassword
     */
    builder.addCase(requestChangePassword.pending, (state) => {
      state.loading = true;
    });
    builder.addCase(
      requestChangePassword.fulfilled,
      (state, action: PayloadAction<any>) => {
        state.loading = false;
        if (action.payload.loginCode === TTCSconfig.STATUS_SUCCESS)
          state.userInfo = new UserInfo(action.payload.UserInfo);
      }
    );

    /**
     * updateStudiedUser
     */
    builder.addCase(requestUpdateStudiedForUser.pending, (state) => {
      state.loading = true;
    });
    builder.addCase(
      requestUpdateStudiedForUser.fulfilled,
      (state, action: PayloadAction<any>) => {
        state.userInfo = new UserInfo(action.payload.data);
      }
    );
  },
});

export const authState = (state: RootState) => state.authState;

export const { loadUserInfo, setLoadingCheckLogin } = authSlice.actions;
export default authSlice.reducer;
