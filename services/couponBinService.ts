const COUPON_BIN_ID = '6a03481fadc21f119a8cd88c';
const API_KEY = '$2a$10$qGjJzTXcxvG/xvDRQ.z4muLRUu1Ityf0BZ6.uvP.KogB7VaHVVGny';
const BASE_URL = 'https://api.jsonbin.io/v3/b';

export interface Coupon {
  type: 'percentage' | 'free_shipping';
  value: number;
  active: boolean;
  description: string;
}

export async function getAllCoupons(): Promise<Record<string, Coupon>> {
  const response = await fetch(`${BASE_URL}/${COUPON_BIN_ID}/latest`, {
    headers: {
      'X-Master-Key': API_KEY,
    },
  });
  if (!response.ok) throw new Error('Erro ao carregar cupons');
  const data = await response.json();
  return data.record.coupons || {};
}

export async function saveAllCoupons(coupons: Record<string, Coupon>): Promise<void> {
  const response = await fetch(`${BASE_URL}/${COUPON_BIN_ID}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      'X-Master-Key': API_KEY,
    },
    body: JSON.stringify({ coupons }),
  });
  if (!response.ok) throw new Error('Erro ao salvar cupons');
}

export async function saveCoupon(code: string, coupon: Coupon): Promise<void> {
  const all = await getAllCoupons();
  all[code.toUpperCase()] = coupon;
  await saveAllCoupons(all);
}

export async function deleteCoupon(code: string): Promise<void> {
  const all = await getAllCoupons();
  delete all[code.toUpperCase()];
  await saveAllCoupons(all);
}