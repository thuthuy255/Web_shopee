import { useDispatch } from "react-redux";
import { useCallback, useEffect, useState } from "react";
import { setAppState } from "../features/slices/app.slice";
import { showError } from "../untils/ShowToast";
import { jwtDecode } from "jwt-decode";

interface UseAuthTokenResult {
  infoAuth: {
    token: string;
    role_id: string;
  };
}

export default function useAuthToken(token: string | null): UseAuthTokenResult {
  const [infoAuth, setInfoAuth] = useState({ token: "", role_id: "" });
  const dispatch = useDispatch();

  const handleAuthTokenDispatch = useCallback(
    (token: string) => {
      try {
        if (!token || typeof token !== "string")
          throw new Error("Token không hợp lệ");

        const decoded: any = jwtDecode(token);
        const role =
          decoded.role_id ||
          decoded[
          "http://schemas.microsoft.com/ws/2008/06/identity/claims/role"
          ];

        if (!role) throw new Error("Missing role_id trong token");

        setInfoAuth({ token, role_id: role });
        dispatch(setAppState({ token, role_id: role }));
      } catch (error) {
        console.error("Decode JWT error:", error);
        showError("Token không hợp lệ hoặc thiếu role.");
        setInfoAuth({ token: "", role_id: "" });
      }
    },
    [dispatch]
  );

  useEffect(() => {
    if (token) {
      handleAuthTokenDispatch(token);
    } else {
      setInfoAuth({ token: "", role_id: "" });
    }
  }, [token, handleAuthTokenDispatch]);

  return { infoAuth };
}
