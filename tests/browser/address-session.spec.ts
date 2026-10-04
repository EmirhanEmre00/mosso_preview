import { test, expect, type Page } from '@playwright/test';

async function fillAddress(page: Page, title: string) {
  await page.getByLabel('Adres başlığı', { exact: true }).fill(title);
  await page.getByLabel('Ad soyad', { exact: true }).fill('Test Müşteri');
  await page.getByLabel('Telefon', { exact: true }).fill('05320000000');
  await page.getByRole('combobox', { name: 'İl', exact: true }).selectOption('Sakarya');
  await page.getByRole('combobox', { name: 'İlçe', exact: true }).selectOption('Serdivan');
  await page.getByRole('combobox', { name: 'Mahalle', exact: true }).selectOption('Kemalpaşa');
  await page
    .getByRole('textbox', { name: 'Açık adres', exact: true })
    .fill('Test Mahallesi, Test Sokak No: 1');
}

async function openPayment(page: Page, width: number) {
  await page.goto('/odeme/');
  if (width <= 760) await page.getByRole('button', { name: 'Sepeti onayla', exact: true }).click();
}

for (const width of [390, 1440]) {
  test(`addresses survive navigation, reload and a second checkout at ${width}px`, async ({
    page,
  }) => {
    await page.setViewportSize({ width, height: 800 });
    await page.addInitScript(() => {
      sessionStorage.setItem('mosso-demo-session', 'preview');
      if (!localStorage.getItem('mosso-preview-v1'))
        localStorage.setItem(
          'mosso-preview-v1',
          JSON.stringify({ cart: [{ id: 'lila-tunik', size: 'M', color: 'Lila', quantity: 1 }] }),
        );
    });
    await openPayment(page, width);
    await fillAddress(page, 'Ev');
    await page.getByRole('radio', { name: 'Kurumsal', exact: true }).check();
    await page.getByRole('button', { name: 'Adresi kaydet ve seç' }).click();
    await page.goto('/adreslerim/');
    const addresses = page.locator('.account-addresses article');
    await expect(addresses).toHaveCount(1);
    await expect(addresses).toContainText('Ev');
    await expect(addresses).toContainText('Kemalpaşa');
    await expect(addresses).toContainText('Kurumsal');
    await expect(addresses).toContainText('+90 532 000 0000');
    await page.reload();
    await expect(addresses).toHaveCount(1);
    await addresses.getByRole('button', { name: 'Düzenle', exact: true }).click();
    await page.getByLabel('Adres başlığı', { exact: true }).fill('Güncel ev');
    await expect(page.getByRole('combobox', { name: 'Mahalle', exact: true })).toHaveValue(
      'Kemalpaşa',
    );
    await expect(page.getByRole('radio', { name: 'Kurumsal', exact: true })).toBeChecked();
    await page.getByRole('textbox', { name: 'Açık adres', exact: true }).fill('Güncel Sokak No: 2');
    await page.getByRole('button', { name: 'Adresi kaydet', exact: true }).click();
    await page.getByRole('button', { name: 'Yeni adres ekle', exact: true }).click();
    await fillAddress(page, 'İş');
    await page.getByRole('button', { name: 'Adresi kaydet', exact: true }).click();
    await page.goto('/?favoriler=1');
    await openPayment(page, width);
    const options = page.locator('.checkout-address-option');
    await expect(options).toHaveCount(2);
    const home = options.filter({ hasText: 'Güncel ev' });
    await expect(home).toContainText('Güncel Sokak No: 2');
    await expect(home).toContainText('Kemalpaşa');
    await expect(home).toContainText('Kurumsal');
    await expect(options.filter({ hasText: 'İş' })).toContainText('Bireysel');
    await expect(home.getByRole('radio')).toBeChecked();
    await expect(page.getByLabel('Adres başlığı', { exact: true })).toHaveCount(0);
    await page.getByRole('radio', { name: 'iyzico', exact: true }).check();
    await page.locator('#checkout-agreement').check();
    await page.getByRole('button', { name: 'Ödeme yap', exact: true }).click();
    await expect(page.getByRole('heading', { name: 'Siparişiniz alındı.' })).toBeVisible();
    const order = await page.evaluate(
      () => JSON.parse(sessionStorage.getItem('mosso-demo-orders-v1') || '[]')[0],
    );
    expect(order.deliveryAddress.neighborhood).toBe('Kemalpaşa');
    expect(order.deliveryAddress.addressType).toBe('corporate');
    expect(order.deliveryAddress.postalCode).toBeUndefined();
    expect(order.billingAddress).toContain('Kemalpaşa');
    expect(order.deliveryAddress.phone).toBe('05320000000');
    await page.goto('/?urun=basic-crop');
    await page.getByRole('button', { name: 'M', exact: true }).click();
    await page.getByRole('button', { name: 'Sepete ekle', exact: true }).click();
    await page.getByRole('button', { name: 'Ödeme adımlarına geç' }).click();
    if (width <= 760)
      await page.getByRole('button', { name: 'Sepeti onayla', exact: true }).click();
    await expect(options).toHaveCount(2);
    await options.filter({ hasText: 'İş' }).getByRole('radio').check();
    await expect(options.filter({ hasText: 'İş' }).getByRole('radio')).toBeChecked();
    await page.goto('/adreslerim/');
    await page.getByRole('button', { name: 'İş adresini sil', exact: true }).click();
    await page.reload();
    await expect(addresses).toHaveCount(1);
    await openPayment(page, width);
    await expect(options).toHaveCount(1);
    await expect(home.getByRole('radio')).toBeChecked();
    await page.goto('/adreslerim/');
    await page.locator('.profile-menu > button').click();
    await page.getByRole('button', { name: 'Çıkış yap', exact: true }).click();
    expect(await page.evaluate(() => sessionStorage.getItem('mosso-demo-addresses-v1'))).toBeNull();
  });

  test(`profile and communication choices survive navigation at ${width}px`, async ({ page }) => {
    await page.setViewportSize({ width, height: 800 });
    await page.addInitScript(() => sessionStorage.setItem('mosso-demo-session', 'preview'));
    await page.goto('/hesabim/');
    await page.getByLabel('Ad', { exact: true }).fill('Test');
    await page.getByLabel('Soyad', { exact: true }).fill('Müşteri');
    await page.getByLabel('E-posta', { exact: true }).fill('test@example.com');
    const phone = page.getByLabel('Telefon', { exact: true });
    await phone.fill('+90 532 324 4356');
    await expect(phone).toHaveValue('532 324 4356');
    await expect(phone.locator('..').locator('.phone-country')).toHaveText('+90');
    await phone.evaluate((input) => (input as HTMLInputElement).setSelectionRange(4, 4));
    await phone.press('Backspace');
    await expect(phone).toHaveValue('533 244 356');
    await phone.fill('');
    await phone.pressSequentially('5320000000');
    await expect(phone).toHaveValue('532 000 0000');
    await phone.pressSequentially('987654');
    await expect(phone).toHaveValue('532 000 0000');
    await phone.fill('05320000000987654');
    await expect(phone).toHaveValue('532 000 0000');
    await page.getByLabel('Doğum tarihi').fill('2000-01-02');
    await page.getByRole('radio', { name: 'Belirtmek istemiyorum' }).check();
    await page.getByRole('button', { name: 'Bilgileri kaydet' }).click();
    await page.getByRole('switch', { name: 'SMS bildirimleri' }).click();
    await page.getByRole('switch', { name: 'İndirim haberleri' }).click();
    await page.getByRole('button', { name: 'Tercihleri kaydet' }).click();
    await page.getByRole('button', { name: 'Adreslerim', exact: true }).click();
    await page
      .getByRole('navigation', { name: 'Hesap bölümleri' })
      .getByRole('button', { name: 'Hesabım', exact: true })
      .click();
    await page.reload();
    await expect(page.getByLabel('Ad', { exact: true })).toHaveValue('Test');
    await expect(page.getByLabel('Soyad', { exact: true })).toHaveValue('Müşteri');
    await expect(page.getByLabel('E-posta', { exact: true })).toHaveValue('test@example.com');
    await expect(page.getByLabel('Telefon', { exact: true })).toHaveValue('532 000 0000');
    await expect(page.getByLabel('Doğum tarihi')).toHaveValue('2000-01-02');
    await expect(page.getByRole('radio', { name: 'Belirtmek istemiyorum' })).toBeChecked();
    await expect(page.getByRole('switch', { name: 'SMS bildirimleri' })).not.toBeChecked();
    await expect(page.getByRole('switch', { name: 'İndirim haberleri' })).not.toBeChecked();
    await expect(page.getByRole('switch', { name: 'Sipariş güncellemeleri' })).toBeChecked();
    await page.goto('/');
    await page.getByRole('button', { name: 'Destek', exact: true }).click();
    const support = page.getByRole('dialog', { name: 'Nasıl yardımcı olalım?' });
    await expect(support.getByLabel('Ad soyad')).toHaveValue('Test Müşteri');
    await expect(support.getByLabel('E-posta')).toHaveValue('test@example.com');
    await expect(support.getByLabel('Telefon')).toHaveValue('532 000 0000');
    expect(
      await support
        .locator('form')
        .evaluate((form) => new FormData(form as HTMLFormElement).get('phone')),
    ).toBe('05320000000');
    await page.getByRole('button', { name: 'Destek penceresini kapat' }).click();
    await page.locator('.profile-menu > button').click();
    await page.getByRole('button', { name: 'Çıkış yap', exact: true }).click();
    expect(await page.evaluate(() => sessionStorage.getItem('mosso-demo-account-v1'))).toBeNull();
    await page.goto('/hesabim/');
    await expect(page.getByLabel('Ad', { exact: true })).toHaveValue('');
    await expect(page.getByRole('switch', { name: 'SMS bildirimleri' })).toBeChecked();
  });
}

test('location changes clear stale neighborhoods and failed lists can be retried', async ({
  page,
}) => {
  await page.addInitScript(() => sessionStorage.setItem('mosso-demo-session', 'preview'));
  await page.goto('/adreslerim/');
  await page.getByRole('button', { name: 'Yeni adres ekle', exact: true }).click();
  await expect(page.getByRole('radio', { name: 'Bireysel', exact: true })).toBeChecked();
  await fillAddress(page, 'Ev');
  const city = page.getByRole('combobox', { name: 'İl', exact: true });
  const district = page.getByRole('combobox', { name: 'İlçe', exact: true });
  const neighborhood = page.getByRole('combobox', { name: 'Mahalle', exact: true });
  await district.selectOption('Adapazarı');
  await expect(neighborhood).toHaveValue('');
  await neighborhood.selectOption({ label: 'Abalı' });
  await page.route('**/data/neighborhoods/42.json', (route) =>
    route.fulfill({ status: 503, body: '' }),
  );
  await city.selectOption('Konya');
  await expect(district).toHaveValue('');
  await expect(neighborhood).toHaveValue('');
  await district.selectOption('Ereğli');
  await expect(neighborhood).toBeDisabled();
  await expect(page.getByRole('alert').filter({ hasText: 'Mahalle listesi' })).toContainText(
    'Mahalle listesi yüklenemedi',
  );
  await page.unroute('**/data/neighborhoods/42.json');
  await page.getByRole('button', { name: 'Tekrar dene', exact: true }).click();
  await expect(neighborhood).toBeEnabled();
  await neighborhood.selectOption({ index: 1 });
  const selected = await neighborhood.inputValue();
  await page.getByRole('button', { name: 'Adresi kaydet', exact: true }).click();
  await expect(page.locator('.account-addresses article')).toContainText(selected);
  await page.goto('/');
  await page.setViewportSize({ width: 390, height: 800 });
  await expect(page.locator('.brand-story')).toBeHidden();
  await page.setViewportSize({ width: 1440, height: 800 });
  await expect(page.locator('.brand-story')).toBeVisible();
});
