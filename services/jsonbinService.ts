const JSONBIN_URL = 'https://api.jsonbin.io/v3/b/69f22c3036566621a8074290';
const JSONBIN_API_KEY = '$2a$10$qGjJzTXcxvG/xvDRQ.z4muLRUu1Ityf0BZ6.uvP.KogB7VaHVVGny';

export interface Car {
  id: string;
  name: string;
  brand: string;
  model: string;
  year: number;
  km: number;
  price: number;
  image: string;
  createdAt?: string;
  updatedAt?: string;
}
export const fetchCars = async (): Promise<Car[]> => {
  const response = await fetch(JSONBIN_URL, {
    headers: { 'X-Master-Key': JSONBIN_API_KEY },
  });
  const data = await response.json();
  return data.record;
};

export const updateCars = async (cars: Car[]): Promise<void> => {
  await fetch(JSONBIN_URL, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      'X-Master-Key': JSONBIN_API_KEY,
    },
    body: JSON.stringify(cars),
  });
};