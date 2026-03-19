import { test, expect } from '@playwright/test';
import { startServer, stopServer } from './helpers/server';
import fs from 'fs';

test.beforeAll(async () => {
  await startServer();
});

test.afterAll(async () => {
  await stopServer();
});

test('upload file via API and verify it lands in workspace', async ({ request }) => {
  const res = await request.post('/api/upload', {
    multipart: {
      files: {
        name: 'e2e-upload-test.txt',
        mimeType: 'text/plain',
        buffer: Buffer.from('E2E upload test content'),
      },
    },
  });

  expect(res.status()).toBe(200);
  const body = await res.json();
  expect(body.files).toHaveLength(1);
  expect(body.files[0].name).toBe('e2e-upload-test.txt');
  expect(body.files[0].size).toBeGreaterThan(0);

  const filePath = '/tmp/ops-kb-e2e-workspace/e2e-upload-test.txt';
  expect(fs.existsSync(filePath)).toBe(true);
  expect(fs.readFileSync(filePath, 'utf-8')).toBe('E2E upload test content');
});

test('upload file via UI button', async ({ page }) => {
  await page.goto('/');

  const tmpFile = '/tmp/e2e-ui-upload.txt';
  fs.writeFileSync(tmpFile, 'UI upload test');

  const fileInput = page.locator('input[type="file"]');
  await fileInput.setInputFiles(tmpFile);

  await expect(page.getByText('[Uploaded: e2e-ui-upload.txt]')).toBeVisible({ timeout: 10_000 });
});

test('upload rejects path traversal filenames', async ({ request }) => {
  const res = await request.post('/api/upload', {
    multipart: {
      files: {
        name: '../../etc/passwd',
        mimeType: 'text/plain',
        buffer: Buffer.from('malicious content'),
      },
    },
  });

  expect(res.status()).toBe(200);
  const body = await res.json();
  expect(body.files[0].path).toContain('ops-kb-e2e-workspace');
  expect(body.files[0].path).not.toContain('/etc/');
});
