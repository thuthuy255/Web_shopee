import { Button, Flex, Menu } from "antd";
import { memo } from "react";
import { COLOR_DEFAULT } from "../constants/Color";
import type { ICart, ICartItem } from "../untils/types/TypeCartItem";

interface ICartMenuHeader {
    cartItems: ICart[];
    totalCartItem: number;
    handleCartPage: () => void;
}

function CartMenuHeader(props: ICartMenuHeader) {
    const { cartItems, totalCartItem, handleCartPage } = props;

    // build menu items
    const menuItems =
        cartItems.length > 0
            ? [
                // flatten cart -> item
                ...cartItems.flatMap((cart: ICart) =>
                    cart.items?.map((item: ICartItem, index: number) => ({
                        key: item.id ?? `${cart.sellerId}-${item.productId}-${index}`,
                        label: (
                            <Flex gap={10}>
                                <img
                                    src={item?.thumbnail || "/fallback.jpg"}
                                    alt={item?.productName || "Sản phẩm"}
                                    width={50}
                                    height={50}
                                    style={{ objectFit: "cover" }}
                                />
                                <div>
                                    <div>{item?.productName || "Sản phẩm không xác định"}</div>
                                    <div style={{ color: "gray" }}>
                                        Số lượng: {item?.quantity}
                                    </div>
                                </div>
                            </Flex>
                        ),
                    }))
                ),

                { type: "divider" as const },

                {
                    key: "view-cart",
                    label: (
                        <Flex justify="space-between" align="center">
                            <span>Sản phẩm trong giỏ hàng: {totalCartItem}</span>
                            <Button
                                type="primary"
                                onClick={handleCartPage}
                                style={{ backgroundColor: COLOR_DEFAULT }}
                            >
                                Xem giỏ hàng
                            </Button>
                        </Flex>
                    ),
                },
            ]
            : [
                {
                    key: "empty",
                    label: "Không có sản phẩm nào trong giỏ",
                    disabled: true,
                },
            ];

    return <Menu items={menuItems} />;
}

export default memo(CartMenuHeader);
