import { Flex, Image, Dropdown, Menu, Badge, Button } from 'antd';
import { memo, useEffect } from 'react';
import { BiBell, BiCart } from 'react-icons/bi';
import { BsQuestionCircle } from 'react-icons/bs';
import logo from '../assets/img/logoshopee.png';
import ShopeeSearch from './ShopeeSearch';
import { useSelector, useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import type { RootState } from '../features/store';
import { InfoUserState, resetUserState } from '../features/slices/user.slice';
import { getTokenState, resetLogin } from '../features/slices/app.slice';
import { getUserCartItems } from '../api/cartitem/cartitem.api';
import { resetCart, setCartItems } from '../features/slices/cart.slice';
import { COLOR_DEFAULT } from '../constants/Color';

function Header() {
    const token = useSelector(getTokenState);
    const user = useSelector(InfoUserState);
    const groupedItems = useSelector((state: RootState) => state.cart.groupedItems);
    const navigate = useNavigate();
    const dispatch = useDispatch();

    // Gộp tất cả sản phẩm trong giỏ từ từng nhóm seller thành 1 mảng
    const allCartItems = groupedItems.flatMap(group => group.items);

    useEffect(() => {
        if (token) {
            fetchCart();
        }
    }, [token]);

    const fetchCart = async () => {
        try {
            const res = await getUserCartItems();
            console.log("🚀 ~ fetchCart ~ res:", res)
            dispatch(setCartItems(res.data));
        } catch (err) {
            console.error(err);
        }
    };

    const handleLogout = () => {
        localStorage.removeItem('access_token');
        dispatch(resetUserState());
        dispatch(resetCart());
        dispatch(resetLogin());
        navigate('/user');
    };
    const handleCartPage = () => {
        navigate('/user/cart');
    }
    const userMenu = [
        {
            key: '1',
            label: <span onClick={() => navigate('/user/profile')}>Trang cá nhân</span>
        },
        {
            key: '2',
            label: <span onClick={handleLogout}>Đăng xuất</span>
        }
    ];

    const cartMenu = (
        <Menu>
            {allCartItems.length > 0 ? (
                <>
                    {allCartItems.map(item => (
                        <Menu.Item key={item.id} style={{ whiteSpace: 'normal' }}>
                            <Flex gap={10}>
                                <img
                                    src={item?.thumbnail || '/fallback.jpg'}
                                    alt={item?.productName || 'Sản phẩm không xác định'}
                                    width={50}
                                    height={50}
                                    style={{ objectFit: 'cover' }}
                                />
                                <div>
                                    <div>{item?.productName || 'Sản phẩm không xác định'}</div>
                                    <div style={{ color: 'gray' }}>Số lượng: {item.quantity}</div>
                                </div>
                            </Flex>
                        </Menu.Item>
                    ))}

                    <Menu.Divider />
                    <Menu.Item key="view-cart" style={{ textAlign: 'center' }}>
                        <Flex justify='space-between' align="center">
                            Sản phẩm trong giỏ hàng: {allCartItems.reduce((total, item) => total + item.quantity, 0)}
                            <Button type="primary" onClick={handleCartPage} style={{ backgroundColor: COLOR_DEFAULT }}>
                                Xem giỏ hàng
                            </Button>
                        </Flex>
                    </Menu.Item>
                </>
            ) : (
                <Menu.Item key="empty" disabled>
                    Không có sản phẩm nào trong giỏ
                </Menu.Item>
            )}
        </Menu>
    );

    return (
        <div style={{ backgroundColor: COLOR_DEFAULT }}>
            {/* Thanh trên */}
            <Flex justify='space-between' style={{ padding: '10px 20px' }}>
                <Flex gap={15}>
                    <a style={{ color: 'white' }}>Kênh người bán</a>
                    <a style={{ color: 'white' }}>Trở thành người bán hàng</a>
                    <a style={{ color: 'white' }}>Tải ứng dụng</a>
                    <Flex>
                        <span style={{ color: 'white' }}>
                            Kết nối
                        </span>
                    </Flex>
                </Flex>

                <Flex gap={10} align='center'>
                    <a>
                        <Flex align='center' gap={5}>
                            <BiBell style={{ fontSize: '20px', color: 'white' }} />
                            <span style={{ color: 'white' }}>Thông báo</span>
                        </Flex>
                    </a>
                    <a>
                        <Flex align='center' gap={5}>
                            <BsQuestionCircle style={{ fontSize: '20px', color: 'white' }} />
                            <span style={{ color: 'white' }}>Hỗ trợ</span>
                        </Flex>
                    </a>
                    {!token ? (
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
            <Flex align='center' justify='space-between' style={{ padding: '10px 40px' }}>
                <Image src={logo} style={{ width: '150px' }} preview={false} />
                <ShopeeSearch />

                <Dropdown overlay={cartMenu} trigger={['click']} placement="bottomRight">
                    <div style={{ cursor: 'pointer' }}>
                        <Badge
                            count={allCartItems.reduce((total, item) => total + item.quantity, 0)}
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
