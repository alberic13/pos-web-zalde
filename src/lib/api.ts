const API_BASE = '/api';

export async function fetchApi<T>(endpoint: string, options?: RequestInit): Promise<T> {
  const res = await fetch(`${API_BASE}${endpoint}`, {
    headers: {
      'Content-Type': 'application/json',
      ...options?.headers,
    },
    ...options,
  });

  const json = await res.json();
  if (!res.ok || json.success === false) {
    throw new Error(json.error || 'Terjadi kesalahan pada server');
  }

  return json.data as T;
}

export const api = {
  // Dashboard
  getDashboardStats: () => fetchApi<any>('/dashboard/stats'),

  // Products
  getProducts: (search?: string, categoryId?: string) => {
    const params = new URLSearchParams();
    if (search) params.append('search', search);
    if (categoryId) params.append('categoryId', categoryId);
    const query = params.toString() ? `?${params.toString()}` : '';
    return fetchApi<any>(`/products${query}`);
  },
  createProduct: (data: any) =>
    fetchApi<any>('/products', { method: 'POST', body: JSON.stringify(data) }),
  updateProduct: (id: string, data: any) =>
    fetchApi<any>(`/products/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  deleteProduct: (id: string) =>
    fetchApi<any>(`/products/${id}`, { method: 'DELETE' }),

  // Categories
  getCategories: () => fetchApi<any>('/categories'),
  createCategory: (name: string) =>
    fetchApi<any>('/categories', { method: 'POST', body: JSON.stringify({ name }) }),
  updateCategory: (id: string, name: string) =>
    fetchApi<any>(`/categories/${id}`, { method: 'PUT', body: JSON.stringify({ name }) }),
  deleteCategory: (id: string) =>
    fetchApi<any>(`/categories/${id}`, { method: 'DELETE' }),

  // Orders / Checkout
  createOrder: (orderData: { items: { productId: string; quantity: number }[]; paymentAmount: number; paymentMethod?: string }) =>
    fetchApi<any>('/orders', { method: 'POST', body: JSON.stringify(orderData) }),
  getOrders: (search?: string) => {
    const query = search ? `?search=${encodeURIComponent(search)}` : '';
    return fetchApi<any>(`/orders${query}`);
  },
  getOrderById: (id: string) => fetchApi<any>(`/orders/${id}`),
};
