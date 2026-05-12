import { CartItem } from '../contexts/CartContext';

const BIN_ID = '6a034581c0954111d812033e';
const API_KEY = '$2a$10$qGjJzTXcxvG/xvDRQ.z4muLRUu1Ityf0BZ6.uvP.KogB7VaHVVGny';
const BASE_URL = 'https://api.jsonbin.io/v3/b';

// Função para obter todos os carrinhos
async function getAllCarts(): Promise<Record<string, CartItem[]>> {
  const response = await fetch(`${BASE_URL}/${BIN_ID}/latest`, {
    headers: {
      'X-Master-Key': API_KEY,
    },
  });
  if (!response.ok) throw new Error('Erro ao carregar carrinhos');
  const data = await response.json();
  return data.record.carts || {};
}

async function saveAllCarts(carts: Record<string, CartItem[]>): Promise<void> {
  const response = await fetch(`${BASE_URL}/${BIN_ID}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      'X-Master-Key': API_KEY,
    },
    body: JSON.stringify({ carts }),
  });
  if (!response.ok) throw new Error('Erro ao salvar carrinho');
}

export async function loadCart(userId: string): Promise<CartItem[]> {
  const all = await getAllCarts();
  return all[userId] || [];
}

export async function saveCart(userId: string, items: CartItem[]): Promise<void> {
  const all = await getAllCarts();
  all[userId] = items;
  await saveAllCarts(all);
}