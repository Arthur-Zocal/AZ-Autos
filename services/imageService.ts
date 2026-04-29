// services/imageService.ts
const IMGBB_API_KEY = 'd7ae0482e2e32bde038367e9ee1acbe7';

export const uploadImage = async (uri: string): Promise<string> => {
  const formData = new FormData();
  formData.append('image', {
    uri,
    type: 'image/jpeg',
    name: 'car.jpg',
  } as any);

  const response = await fetch(`https://api.imgbb.com/1/upload?key=${IMGBB_API_KEY}`, {
    method: 'POST',
    body: formData,
  });

  const data = await response.json();
  if (data.success) {
    return data.data.url; // link público da imagem
  } else {
    throw new Error('Falha no upload da imagem');
  }
};