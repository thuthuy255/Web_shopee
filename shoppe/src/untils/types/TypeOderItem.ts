import type { IAddress } from "./TypeAddress";

export interface IOrderItem {
    id: string;
    productId: string;
    productName: string;
    productImage: string;
    quantity: number;
    price: number;
}

export interface IOrder {
    id: string;
    status: string;
    totalAmount: number;
    created: string; // ISO string
    orderItems: IOrderItem[];
    address?: IAddress;
}