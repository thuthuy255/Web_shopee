import { useEffect } from "react";
import { BrowserRouter } from "react-router-dom";
import { useDispatch } from "react-redux";
import { getUserInfo } from "./api/user.api";
import { showError, showWarning } from "./untils/ShowToast";
import { setUserState } from "./features/slices/user.slice";
import { setAppState } from "./features/slices/app.slice";
import AppRoutes from "./routes/AppRoutes";
import { getUserCartItems } from "./api/cartitem/cartitem.api";
import { setCart } from "./features/slices/cart.slice";
import { ROLE } from "./constants";

function App() {
  const dispatch = useDispatch();

  const token = localStorage.getItem("access_token");
  const fetchUserInfo = async () => {
    try {
      const res: any = await getUserInfo();
      if (res?.success) {
        dispatch(setUserState(res?.data));
        dispatch(
          setAppState({
            role_id: res?.data?.role,
            token: token || "",
          })
        );
        if (res?.data?.role === ROLE.USER) {
          fetchCart();
        }
      } else {
        showWarning(res?.message || "Đăng nhập thất bại");
      }
    } catch {
      showError("Lấy thông tin người dùng thất bại");
    }
  };

  const fetchCart = async () => {
    try {
      const body = {
        pageInfo: {
          page: 1,
          pageSize: 5
        },
        keyWord: ""
      }
      const res: any = await getUserCartItems(body);
      dispatch(setCart(res));
    } catch (error) {
      console.error("Failed to fetch cart items:", error);
    }
  }
  useEffect(() => {
    if (token) {
      fetchUserInfo();

    }
  }, [token]);
  return (
    <BrowserRouter>
      <AppRoutes />
    </BrowserRouter>
  );
}

export default App;
