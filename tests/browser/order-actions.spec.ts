import { test, expect, type Page } from '@playwright/test';

const tunicLabel = 'Rahat Kesim Uzun Tunik, Lila, M beden';
const cropLabel = 'Bisiklet Yaka Basic Crop, Ekru, S beden';
const order = {
  id: 'DEMO-A11',
  date: '2026-10-03T12:00:00Z',
  status: 'received',
  rows: [
    { id: 'lila-tunik', size: 'M', color: 'Lila', quantity: 2 },
    { id: 'basic-crop', size: 'S', color: 'Ekru', quantity: 1 },
  ],
};

async function openOrder(page: Page) {
  await page.addInitScript((seed) => {
    sessionStorage.setItem('mosso-demo-session', 'preview');
    if (!sessionStorage.getItem('mosso-demo-orders-v1')) {
      sessionStorage.setItem('mosso-demo-orders-v1', JSON.stringify([seed]));
    }
  }, order);
  await page.goto('/siparislerim/?siparis=DEMO-A11');
  await expect(page.getByRole('button', { name: 'Ürün iptal et', exact: true })).toBeEnabled();
}

for (const action of ['cancel', 'return'] as const) {
  test(`${action}: consumed product quantities cannot be selected again, including after reload`, async ({
    page,
  }) => {
    await openOrder(page);
    await page
      .getByRole('button', {
        name: action === 'cancel' ? 'Ürün iptal et' : 'İade talebi oluştur',
        exact: true,
      })
      .click();
    const form = page.locator('#order-action-form');
    await form.getByRole('checkbox', { name: tunicLabel, exact: true }).check();
    await expect(form.getByRole('combobox', { name: `${tunicLabel} işlem adedi` })).toHaveValue(
      '2',
    );
    if (action === 'return')
      await form.getByLabel('İade nedeni', { exact: true }).selectOption('size');
    await form
      .getByRole('button', {
        name: action === 'cancel' ? 'Seçilen ürünleri iptal et' : 'İade talebini gönder',
      })
      .click();
    await page
      .getByRole('dialog')
      .getByRole('button', {
        name: action === 'cancel' ? 'Evet, ürünleri iptal et' : 'Evet, talebi gönder',
      })
      .click();
    await expect(page.getByRole('dialog')).toBeHidden();

    for (const reload of [false, true]) {
      if (reload) await page.reload();
      for (const name of ['Ürün iptal et', 'İade talebi oluştur']) {
        await page.getByRole('button', { name, exact: true }).click();
        await expect(form.getByRole('checkbox', { name: tunicLabel, exact: true })).toHaveCount(0);
        await expect(form.getByRole('checkbox', { name: cropLabel, exact: true })).toBeEnabled();
      }
    }
  });
}

test('partial cancellation leaves only the unprocessed quantity for a return', async ({ page }) => {
  await openOrder(page);
  await page.getByRole('button', { name: 'Ürün iptal et', exact: true }).click();
  const form = page.locator('#order-action-form');
  await form.getByRole('checkbox', { name: tunicLabel, exact: true }).check();
  await form.getByRole('combobox', { name: `${tunicLabel} işlem adedi` }).selectOption('1');
  await form.getByRole('button', { name: 'Seçilen ürünleri iptal et' }).click();
  await page.getByRole('dialog').getByRole('button', { name: 'Evet, ürünleri iptal et' }).click();
  await page.reload();
  await page.getByRole('button', { name: 'İade talebi oluştur', exact: true }).click();
  await form.getByRole('checkbox', { name: tunicLabel, exact: true }).check();
  const quantity = form.getByRole('combobox', { name: `${tunicLabel} işlem adedi` });
  await expect(quantity).toHaveValue('1');
  await expect(quantity.locator('option')).toHaveCount(1);
  await form.getByLabel('İade nedeni', { exact: true }).selectOption('size');
  await form.getByRole('button', { name: 'İade talebini gönder' }).click();
  await page.getByRole('dialog').getByRole('button', { name: 'Evet, talebi gönder' }).click();
  await page.reload();
  await page.getByRole('button', { name: 'Ürün iptal et', exact: true }).click();
  await expect(form.getByRole('checkbox', { name: tunicLabel, exact: true })).toHaveCount(0);
  await expect(form.getByRole('checkbox', { name: cropLabel, exact: true })).toBeEnabled();
});

for (const width of [390, 1440]) {
  test(`checkout confirmation scrolls into view and receives focus at ${width}px`, async ({
    page,
  }) => {
    await page.setViewportSize({ width, height: 700 });
    await page.addInitScript(() => {
      sessionStorage.setItem('mosso-demo-session', 'preview');
      localStorage.setItem(
        'mosso-preview-v1',
        JSON.stringify({ cart: [{ id: 'lila-tunik', size: 'M', color: 'Lila', quantity: 1 }] }),
      );
    });
    await page.goto('/odeme/');
    await page.getByLabel('Adres başlığı', { exact: true }).fill('Test adresi');
    await page.getByLabel('Ad soyad', { exact: true }).fill('Test Müşteri');
    await page.getByLabel('Telefon', { exact: true }).fill('05320000000');
    await page.getByRole('combobox', { name: 'İl', exact: true }).selectOption('Sakarya');
    await page.getByRole('combobox', { name: 'İlçe', exact: true }).selectOption('Serdivan');
    await page.getByLabel('Açık adres', { exact: true }).fill('Test Mahallesi, Test Sokak No: 1');
    await page.getByRole('button', { name: 'Adresi kaydet ve seç' }).click();
    await page.getByRole('radio', { name: 'iyzico', exact: true }).check();
    await page.locator('#checkout-agreement').check();
    await page.locator('#privacy-info').scrollIntoViewIfNeeded();
    await page.getByRole('button', { name: 'Ödeme yap', exact: true }).click();
    const heading = page.getByRole('heading', { name: 'Siparişiniz alındı.', exact: true });
    await expect(heading).toBeFocused();
    await expect(heading).toBeInViewport();
    expect((await heading.boundingBox())!.y).toBeLessThan(350);
  });
}

test('mobile payment dock stays reachable while products collapse; desktop keeps its sidebar', async ({
  page,
}) => {
  await page.addInitScript(() => {
    sessionStorage.setItem('mosso-demo-session', 'preview');
    localStorage.setItem(
      'mosso-preview-v1',
      JSON.stringify({ cart: [{ id: 'lila-tunik', size: 'M', color: 'Lila', quantity: 1 }] }),
    );
  });
  await page.setViewportSize({ width: 320, height: 700 });
  await page.goto('/odeme/');
  const products = page.locator('#checkout-products-list');
  const payment = page.getByRole('button', { name: 'Ödeme yap', exact: true });
  const dock = page.locator('.checkout-submit-panel');
  await expect(products).toBeHidden();
  await page.getByRole('button', { name: 'Sepetteki ürünleri göster' }).click();
  await expect(products).toBeVisible();
  await page.getByRole('button', { name: 'Sepetteki ürünleri gizle' }).click();
  for (const width of [320, 390, 760]) {
    await page.setViewportSize({ width, height: 700 });
    for (const selector of ['#delivery-title', '#payment-title', '#privacy-info']) {
      await page.locator(selector).scrollIntoViewIfNeeded();
      await expect(payment).toBeInViewport();
      await expect(page.locator('#checkout-agreement')).toBeInViewport();
      await expect(dock).toHaveCSS('position', 'fixed');
      const box = (await payment.boundingBox())!;
      expect(box.y + box.height).toBeLessThanOrEqual(700);
      expect(box.y + box.height).toBeGreaterThan(650);
    }
    await page.evaluate(() =>
      window.scrollTo({ top: document.documentElement.scrollHeight, behavior: 'instant' }),
    );
    const footer = (await page.locator('.footer-bottom').boundingBox())!;
    const dockBox = (await dock.boundingBox())!;
    expect(footer.y + footer.height).toBeLessThanOrEqual(dockBox.y);
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(
      true,
    );
  }
  await page.setViewportSize({ width: 1440, height: 900 });
  await expect(dock).toHaveCSS('position', 'static');
  await expect(page.getByRole('button', { name: 'Sepetteki ürünleri göster' })).toBeHidden();
  await expect(products).toBeVisible();
});
