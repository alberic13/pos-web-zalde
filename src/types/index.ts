export interface Category {
  id: string;
  name: string;
  productCount?: number;
  createdAt: string;
}

export interface Product {
  id: string;
  sku: string;
  name: string;
  price: number;
  costPrice?: number | null;
  stock: number; // Stok Etalase / Kasir
  warehouseStock: number; // Stok Cadangan Gudang
  categoryId: string;
  category?: Category;
  imageUrl?: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface OrderItem {
  id: string;
  orderId: string;
  productId: string;
  product?: Product;
  quantity: number;
  price: number;
}

export interface Order {
  id: string;
  orderNumber: string;
  totalAmount: number;
  paymentAmount: number;
  changeAmount: number;
  paymentMethod: string;
  items: OrderItem[];
  createdAt: string;
}

export interface DashboardStats {
  todayRevenue: number;
  todayOrdersCount: number;
  monthRevenue: number;
  monthOrdersCount: number;
  totalProductsCount: number;
  lowStockCount: number;
  lowStockProducts: Product[];
  recentOrders: Order[];
  topProducts: {
    id: string;
    name: string;
    category: string;
    soldCount: number;
    price: number;
    imageUrl?: string | null;
  }[];
  salesChart: {
    date: string;
    revenue: number;
    orders: number;
  }[];
}

export interface CartItem {
  product: Product;
  quantity: number;
}
