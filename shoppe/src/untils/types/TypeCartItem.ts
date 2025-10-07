export interface ICart {
    sellerId: string;
    sellerName: string;
    items: ICartItem[];
}
export interface IProductVariant {
    id: string;
    variantName: string;
    variantValue: string;
    imageUrl?: string;
    price: number;
    stockQuantity: number;
}

export interface ICartItem {
    id: string;
    productId: string;
    productName: string;
    thumbnail?: string;
    productVariantId?: string | null;
    productVariant?: IProductVariant | null;  // ✅ Thêm vào đây
    quantity: number;
    price: number;           // giá mặc định (có thể là của product)
    stockQuantity: number;   // tồn kho
    sellerId: string;
    fullName: string;
    isSelected: boolean;
}

