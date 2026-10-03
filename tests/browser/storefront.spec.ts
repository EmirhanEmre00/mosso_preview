import { test, expect } from '@playwright/test';

for (const width of [320, 360, 390, 430, 768, 1024, 1440, 1920]) {
  test(`logo is fully visible and header has no overflow at ${width}px`, async ({ page }) => {
    await page.setViewportSize({ width, height: 900 });
    await page.goto('/');
    const logo = page.getByRole('link', { name: 'mos’so ana sayfa' }).locator('.brand-wordmark');
    await expect(logo).toBeVisible();
    await page.evaluate(() => document.fonts.ready);
    const layout = await logo.evaluate((img) => {
      const rect = img.getBoundingClientRect();
      const parent = img.parentElement!.getBoundingClientRect();
      return {
        text: img.textContent,

        contained:
          rect.left >= parent.left &&
          rect.right <= parent.right &&
          rect.top >= parent.top &&
          rect.bottom <= parent.bottom,
        viewport: rect.left >= 0 && rect.right <= window.innerWidth,
        overflow: document.documentElement.scrollWidth > window.innerWidth,
      };
    });
    expect(layout).toEqual({
      text: 'mos’so',
      contained: true,
      viewport: true,
      overflow: false,
    });
    const tagline = page.getByRole('link', { name: 'mos’so ana sayfa' }).locator('.brand-tagline');
    await expect(tagline).toBeVisible();
    expect(
      await tagline.evaluate((el) => {
        const rect = el.getBoundingClientRect();
        const parent = el.parentElement!.getBoundingClientRect();
        return (
          rect.left >= parent.left &&
          rect.right <= parent.right &&
          rect.top >= parent.top &&
          rect.bottom <= parent.bottom
        );
      }),
    ).toBe(true);
  });
}

test('size is required, cart survives reload and checkout opens as a page', async ({ page }) => {
  await page.goto('/?urun=lila-tunik');
  await page.getByRole('button', { name: 'Sepete ekle', exact: true }).click();
  await expect(page.getByText('Sepete eklemek için bir beden seçmelisin.')).toBeVisible();
  await page.getByRole('button', { name: 'M', exact: true }).click();
  await page.getByRole('button', { name: 'Sepete ekle', exact: true }).click();
  const dialog = page.getByRole('dialog');
  await expect(dialog).toContainText('Lila / M');
  await page.getByRole('button', { name: 'Rahat Kesim Uzun Tunik adedini artır' }).click();
  await expect(dialog).toContainText('₺1.798');
  await page.reload();
  await page.getByRole('button', { name: 'Sepetim (2)', exact: true }).click();
  await expect(dialog).toContainText('₺1.798');
  await page.getByRole('button', { name: 'Ödeme adımlarına geç' }).click();
  await expect(page).toHaveURL(/\/odeme\/?$/);
  await expect(page.getByRole('heading', { name: 'Seçimlerini tamamla.' })).toBeVisible();
  await expect(page.getByRole('contentinfo')).toHaveCount(0);
  await page.getByRole('button', { name: 'Sepetim (2)', exact: true }).click();
  await page.getByRole('button', { name: 'Rahat Kesim Uzun Tunik sepetten kaldır' }).click();
  await expect(dialog).toContainText('Güzel seçimlere yer var.');
});

test('mobile search and a size filter produce a meaningful empty state', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto('/');
  await page.getByRole('button', { name: 'Aramayı aç' }).click();
  await page.getByRole('textbox', { name: 'Mobil ürün ara' }).fill('jean');
  await page.getByRole('button', { name: 'Ara', exact: true }).click();
  await expect(page.getByRole('main')).toContainText('1 ürün');
  await page.getByRole('button', { name: 'Filtrele', exact: true }).click();
  const panel = page.getByRole('dialog', { name: 'Filtrele', exact: true });
  expect(
    await panel.locator('.filter-content').evaluate((el) => el.scrollWidth <= el.clientWidth),
  ).toBe(true);
  await page.getByRole('combobox', { name: 'Beden filtresi' }).selectOption('S');
  await page.getByRole('button', { name: '0 ürünü göster' }).click();
  await expect(page.getByRole('main')).toContainText('Aradığın ürünü bulamadık.');
});

test('compact mobile hero and footer preserve access to all content', async ({ page }) => {
  await page.setViewportSize({ width: 320, height: 900 });
  await page.goto('/');
  const hero = await page.locator('.hero').boundingBox();
  const footer = page.getByRole('contentinfo');
  const before = await footer.boundingBox();
  expect(hero!.height).toBeLessThanOrEqual(490);
  expect(before!.height).toBeLessThan(380);
  const toggle = footer.getByRole('button', { name: 'Koleksiyonu keşfet' });
  await expect(toggle).toHaveAttribute('aria-expanded', 'false');
  await toggle.click();
  await expect(footer.getByRole('button', { name: 'Tesettür', exact: true })).toBeVisible();
  await toggle.click();
  await expect(footer.getByRole('button', { name: 'Tesettür', exact: true })).toBeHidden();
});

test('expanded catalog, combined price/color filters, and clear action', async ({ page }) => {
  await page.goto('/?kategori=Tümü');
  await expect(page.getByRole('main')).toContainText('40 ürün');
  await expect(page.locator('.product-card')).toHaveCount(12);
  await page.getByRole('button', { name: 'Daha fazla ürün göster' }).click();
  await expect(page.locator('.product-card')).toHaveCount(24);
  await page.getByRole('button', { name: 'Filtrele', exact: true }).click();
  const dialog = page.getByRole('dialog', { name: 'Filtrele', exact: true });
  await dialog.getByRole('button', { name: 'Mor', exact: true }).click();
  await dialog.getByRole('spinbutton', { name: 'En yüksek fiyat' }).fill('500');
  await dialog.getByRole('button', { name: '2 ürünü göster' }).click();
  await expect(page.locator('.product-card')).toHaveCount(2);
  await expect(page.getByRole('main')).toContainText('Günlük Dökümlü Şal');
  await page.getByRole('button', { name: 'Tümünü temizle', exact: true }).click();
  await expect(page.getByRole('main')).toContainText('40 ürün');
});

test('landscape phone keeps filter actions reachable', async ({ page }) => {
  await page.setViewportSize({ width: 844, height: 390 });
  await page.goto('/?kategori=Tümü');
  await page.getByRole('button', { name: 'Filtrele', exact: true }).click();
  const apply = page.getByRole('button', { name: '40 ürünü göster' });
  await expect(apply).toBeVisible();
  const box = await apply.boundingBox();
  expect(box!.y + box!.height).toBeLessThanOrEqual(390);
  await page.getByRole('button', { name: 'Filtreleri kapat' }).click();
  await expect(page.getByRole('dialog', { name: 'Filtrele' })).toBeHidden();
});
