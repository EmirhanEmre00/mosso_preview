import { validPhone } from './contact-validation.mjs';
export const supportTopics = ['Ürün hakkında', 'Sipariş ve teslimat', 'İade ve değişim', 'Diğer'];

export function supportEndpoint(value = '') {
  return /^https:\/\/formspree\.io\/f\/[a-zA-Z0-9]+$/.test(value) ? value : '';
}

export async function sendSupportMessage(endpoint, fields, request = fetch) {
  if (!supportEndpoint(endpoint)) throw new Error('Destek mesajı gönderimi henüz aktif değil.');
  const text = (key) => (typeof fields[key] === 'string' ? fields[key].trim() : '');
  const payload = {
    name: text('name'),
    email: text('email'),
    phone: text('phone'),
    topic: text('topic'),
    order_number: text('order_number'),
    message: text('message'),
    _gotcha: text('_gotcha'),
  };
  if (
    !payload.name ||
    payload.name.length > 100 ||
    !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(payload.email) ||
    payload.email.length > 254 ||
    !validPhone(payload.phone, true) ||
    payload.order_number.length > 60 ||
    !supportTopics.includes(payload.topic) ||
    payload.message.length < 10 ||
    payload.message.length > 3000
  ) {
    throw new Error(
      'Adını, e-posta adresini, telefonunu ve en az 10 karakterlik mesajını kontrol et.',
    );
  }
  const response = await request(endpoint, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
    body: JSON.stringify(payload),
    signal: AbortSignal.timeout(15000),
    credentials: 'omit',
    referrerPolicy: 'no-referrer',
  });
  if (!response.ok)
    throw new Error('Mesaj gönderilemedi. Biraz sonra tekrar dene veya WhatsApp’tan yaz.');
  const result = await response.json();
  if (result.ok !== true) throw new Error('Mesajın alındığı doğrulanamadı. Lütfen tekrar dene.');
}
