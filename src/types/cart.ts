export interface CartFullItem {
  quantity: number;
  product: {
    _id: string;
    name: string;
    price: number;
  };
  restaurant?: { name: string; address?: string; image?: string } | null;
  program?: { title: string; description?: string } | null;
}

export interface CartItem {
  user: {
    _id: string;
    username: string;
    email: string;
    role: string;
    profile?: any;
  };
  cartId: string;
  totalPrice: number;
  items: CartFullItem[];
}