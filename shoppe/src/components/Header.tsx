import { Flex, Image, Dropdown, Menu, Badge, Button } from 'antd';
import { memo, useCallback } from 'react';
import { BiBell, BiCart } from 'react-icons/bi';
import { BsQuestionCircle } from 'react-icons/bs';
import logo from '../assets/img/logo_home.png';
import ShopeeSearch from './ShopeeSearch';
import { useSelector, useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { InfoUserState, resetUserState } from '../features/slices/user.slice';
import { resetLogin } from '../features/slices/app.slice';
import { COLOR_DEFAULT } from '../constants/Color';
import { getCartState } from '../features/slices/cart.slice';
import CartMenuHeader from './CartMenuHeader';


function Header() {
    const user = useSelector(InfoUserState);
    const navigate = useNavigate();
    const dispatch = useDispatch();
    const { data: cartItems, totalCartItem } = useSelector(getCartState);
    const handleLogout = () => {
        localStorage.removeItem('access_token');
        dispatch(resetUserState());
        dispatch(resetLogin());
        navigate('/auth/login');
    };
    const cartMenuComponent = useCallback(() => {
        return <CartMenuHeader
            cartItems={cartItems}
            totalCartItem={totalCartItem}
            handleCartPage={handleCartPage}
        />
    }, [cartItems, totalCartItem]);
    const handleCartPage = () => {
        navigate('/user/cart');
    };
    const handleBackToHome = () => {
        navigate('/user');
    }

    const userMenu = user && user.id
        ? [
            {
                key: "1",
                label: <span onClick={() => navigate("/user/profile")}>Trang cá nhân</span>,
            },
            {
                key: "2",
                label: <span onClick={() => navigate("/user/orderstatus")}>Đơn mua</span>,
            },
            {
                key: "3",
                label: <span onClick={handleLogout}>Đăng xuất</span>,
            },
        ]
        : [
            {
                key: "1",
                label: <span onClick={() => navigate("/auth/login")}>Đăng nhập</span>,
            },
        ];





    return (
        <div style={{ backgroundColor: COLOR_DEFAULT }}>
            {/* Thanh trên */}
            <Flex justify="space-between" style={{ padding: '0 20px', paddingTop: 10 }}>
                <Flex gap={15}>
                    <a style={{ color: 'white' }}>Kênh người bán</a>
                    <a style={{ color: 'white' }}>Trở thành người bán hàng</a>
                    <a style={{ color: 'white' }}>Tải ứng dụng</a>
                    <Flex>
                        <span style={{ color: 'white' }}>Kết nối</span>
                    </Flex>
                </Flex>

                <Flex gap={10} align="center">
                    <a>
                        <Flex align="center" gap={5}>
                            <BiBell style={{ fontSize: '20px', color: 'white' }} />
                            <span style={{ color: 'white' }}>Thông báo</span>
                        </Flex>
                    </a>
                    <a>
                        <Flex align="center" gap={5}>
                            <BsQuestionCircle style={{ fontSize: '20px', color: 'white' }} />
                            <span style={{ color: 'white' }}>Hỗ trợ</span>
                        </Flex>
                    </a>
                    {!user ? (
                        <a onClick={() => navigate('/auth/login')} style={{ color: 'white' }}>
                            Đăng nhập
                        </a>
                    ) : (
                        <Dropdown menu={{ items: userMenu }} placement="bottomRight">
                            <span style={{ color: 'white', cursor: 'pointer' }}>
                                Xin chào, {user?.fullName || 'User'}
                            </span>
                        </Dropdown>
                    )}
                </Flex>
            </Flex>

            {/* Thanh giữa */}
            <Flex align="center" justify="space-between" style={{ padding: '3px 40px' }}>
                <Image
                    src={logo}
                    style={{ width: 150, cursor: "pointer", display: "block" }}
                    preview={false}
                    onClick={handleBackToHome}
                />
                <ShopeeSearch />

                {/* Cart dropdown */}
                <Dropdown overlay={cartMenuComponent} trigger={['click']} placement="bottomRight">
                    <div style={{ cursor: 'pointer' }}>
                        <Badge
                            count={totalCartItem}
                            offset={[0, 0]}
                            showZero
                            style={{ backgroundColor: COLOR_DEFAULT }}
                        >
                            <BiCart style={{ fontSize: '40px', color: 'white' }} />
                        </Badge>
                    </div>
                </Dropdown>
            </Flex>
        </div>
    );
}

export default memo(Header);
