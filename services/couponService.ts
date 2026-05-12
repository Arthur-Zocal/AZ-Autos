export interface Coupon {
  type: 'percentage' | 'free_shipping';
  value: number;
  active: boolean;
  description: string;
}

const COUPON_BIN_URL = 'https://api.jsonbin.io/v3/b/6a03481fadc21f119a8cd88c';
const API_KEY = '$2a$10$qGjJzTXcxvG/xvDRQ.z4muLRUu1Ityf0BZ6.uvP.KogB7VaHVVGny';

export const fetchCoupons = async (): Promise<Record<string, Coupon>> => {
  const response = await fetch(COUPON_BIN_URL, {
    headers: { 'X-Master-Key': API_KEY },
  });
  const data = await response.json();
  return data.record?.coupons || {};
};

export const updateCoupons = async (coupons: Record<string, Coupon>): Promise<void> => {
  await fetch(COUPON_BIN_URL, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      'X-Master-Key': API_KEY,
    },
    body: JSON.stringify({ coupons }),
  });
};

export const saveCoupon = async (code: string, coupon: Coupon): Promise<void> => {
  const all = await fetchCoupons();
  all[code.toUpperCase()] = coupon;
  await updateCoupons(all);
};

export const deleteCoupon = async (code: string): Promise<void> => {
  const all = await fetchCoupons();
  delete all[code.toUpperCase()];
  await updateCoupons(all);
};