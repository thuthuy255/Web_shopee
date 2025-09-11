import { createSlice, type PayloadAction } from "@reduxjs/toolkit";
import type { RootState } from "../store";

interface AppState {
  token: string | null;
  role_id: string | null;
}

const initialState: AppState = {
  token: null,
  role_id: null,
};
const appSlice = createSlice({
  name: "app",
  initialState,
  reducers: {
    setAppState: (
      state,
      action: PayloadAction<{ token: string; role_id: string }>
    ) => {
      state.token = action.payload.token;
      state.role_id = action.payload.role_id;
    },
    resetLogin: (state) => {
      state.token = null;
      state.role_id = null;
    },
    setToken: (state, action: PayloadAction<string>) => {
      state.token = action.payload;
    },
    setRole: (state, action: PayloadAction<string | null>) => {
      state.role_id = action.payload;
    },
  },
});

export const { setAppState, resetLogin, setToken, setRole } = appSlice.actions;
export const getTokenState = (state: RootState) => state.app.token;
export const getRoleIdState = (state: RootState) => state.app.role_id;
export const getStateApp = (state: RootState) => state.app;
export default appSlice.reducer;
