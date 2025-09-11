export interface ICart {
    sellerId: string;
    sellerName: string;
    items: ICartItem[];
}
export interface ICartItem {
    id: string;
    quantity: number;
    isSelected: boolean;
    productId: string;
    productName: string;
    thumbnail: string;
    productVariantId: string | null;
    stockQuantity: number;
    variantName: string | null;
    variantValue: string | null;
    price: number;
    fullName: string;
    sellerId: string;
}
