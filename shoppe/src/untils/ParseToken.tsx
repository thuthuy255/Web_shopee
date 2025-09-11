import { jwtDecode } from "jwt-decode";

interface DecodedToken {
    "http://schemas.xmlsoap.org/ws/2005/05/identity/claims/nameidentifier"?: string;
    "http://schemas.xmlsoap.org/ws/2005/05/identity/claims/name"?: string;
    "http://schemas.microsoft.com/ws/2008/06/identity/claims/role"?: string;
    exp?: number;
    [key: string]: any; // fallback cho các key khác nếu có
}

interface ParsedUserInfo {
    userId?: string;
    email?: string;
    role?: string;
    exp?: number;
}

export const parseToken = (token: string): ParsedUserInfo | null => {
    try {
        const decoded = jwtDecode<DecodedToken>(token);

        const userId =
            decoded[
            "http://schemas.xmlsoap.org/ws/2005/05/identity/claims/nameidentifier"
            ];
        const email =
            decoded[
            "http://schemas.xmlsoap.org/ws/2005/05/identity/claims/name"
            ];
        const role =
            decoded[
            "http://schemas.microsoft.com/ws/2008/06/identity/claims/role"
            ];
        const exp = decoded.exp;

        return { userId, email, role, exp };
    } catch (error) {
        console.error("Token không hợp lệ:", error);
        return null;
    }
};
