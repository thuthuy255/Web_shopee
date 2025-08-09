// features/slices/user.slice.ts
import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  id: "",
  fullName: "",
  email: "",
  role: "",
  avatar: "",
  isLocked: "",
};

const userSlice = createSlice({
  name: "user",
  initialState,
  reducers: {
    setUserState: (state, action) => {
      return { ...state, ...action.payload }; // ✅ Cập nhật đúng
    },
    resetUserState: () => initialState, // ✅ reset về trạng thái ban đầu
  },
});

export const { setUserState, resetUserState } = userSlice.actions;
export const InfoUserState = (state: any) => state.user;
export default userSlice.reducer;
