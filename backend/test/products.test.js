const test = require('node:test');
const assert = require('node:assert/strict');
const http = require('node:http');
const fs = require('node:fs');
const path = require('node:path');

const { app } = require('../server');

test('GET /api/products returns product data', async () => {
  const server = http.createServer(app);
  await new Promise((resolve) => server.listen(0, resolve));
  const { port } = server.address();

  try {
    const response = await fetch(`http://127.0.0.1:${port}/api/products`);
    assert.equal(response.status, 200);
    const body = await response.json();
    assert.ok(Array.isArray(body));
    assert.ok(body.length > 0);
  } finally {
    await new Promise((resolve) => server.close(resolve));
  }
});

test('POST /api/admin/products accepts an uploaded image file', async () => {
  const dataFile = path.join(__dirname, '..', 'data', 'products.json');
  const uploadsDir = path.join(__dirname, '..', 'uploads');
  const original = fs.existsSync(dataFile) ? fs.readFileSync(dataFile, 'utf8') : null;

  try {
    fs.writeFileSync(dataFile, '[]');
    fs.mkdirSync(uploadsDir, { recursive: true });

    const server = http.createServer(app);
    await new Promise((resolve) => server.listen(0, resolve));
    const { port } = server.address();

    try {
      const form = new FormData();
      form.append('name', 'Upload Test');
      form.append('description', 'Stored via upload');
      form.append('price', '99');
      form.append('stock', '5');
      form.append('imageFile', new Blob(['fake-image'], { type: 'image/png' }), 'upload-test.png');

      const response = await fetch(`http://127.0.0.1:${port}/api/admin/products`, {
        method: 'POST',
        headers: { 'x-admin-password': process.env.ADMIN_PASSWORD || 'VEEZO2026' },
        body: form,
      });

      assert.equal(response.status, 201);
      const saved = JSON.parse(fs.readFileSync(dataFile, 'utf8'));
      assert.ok(saved.some((item) => item.name === 'Upload Test'));
      assert.ok(saved.some((item) => item.image && item.image.includes('/uploads/')));

      const uploadedFiles = fs.readdirSync(uploadsDir).filter((entry) => entry.endsWith('.png'));
      assert.ok(uploadedFiles.length > 0, 'Expected at least one uploaded image file to be written.');
    } finally {
      await new Promise((resolve) => server.close(resolve));
    }
  } finally {
    if (original === null) fs.rmSync(dataFile, { force: true });
    else fs.writeFileSync(dataFile, original);
  }
});

test('POST /api/admin/categories and /api/admin/collections supports CRUD flow', async () => {
  const server = http.createServer(app);
  await new Promise((resolve) => server.listen(0, resolve));
  const { port } = server.address();

  try {
    const createCategory = await fetch(`http://127.0.0.1:${port}/api/admin/categories`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'x-admin-password': process.env.ADMIN_PASSWORD || 'VEEZO2026' },
      body: JSON.stringify({ name: 'Spring' }),
    });
    assert.equal(createCategory.status, 201);

    const updateCategory = await fetch(`http://127.0.0.1:${port}/api/admin/categories/Spring`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json', 'x-admin-password': process.env.ADMIN_PASSWORD || 'VEEZO2026' },
      body: JSON.stringify({ name: 'Spring Edit' }),
    });
    assert.equal(updateCategory.status, 200);

    const createCollection = await fetch(`http://127.0.0.1:${port}/api/admin/collections`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'x-admin-password': process.env.ADMIN_PASSWORD || 'VEEZO2026' },
      body: JSON.stringify({ name: 'Capsule' }),
    });
    assert.equal(createCollection.status, 201);

    const deleteCollection = await fetch(`http://127.0.0.1:${port}/api/admin/collections/Capsule`, {
      method: 'DELETE',
      headers: { 'x-admin-password': process.env.ADMIN_PASSWORD || 'VEEZO2026' },
    });
    assert.equal(deleteCollection.status, 200);

    const deleteCategory = await fetch(`http://127.0.0.1:${port}/api/admin/categories/Spring%20Edit`, {
      method: 'DELETE',
      headers: { 'x-admin-password': process.env.ADMIN_PASSWORD || 'VEEZO2026' },
    });
    assert.equal(deleteCategory.status, 200);
  } finally {
    await new Promise((resolve) => server.close(resolve));
  }
});

test('POST /api/admin/products writes to the data file', async () => {
  const dataFile = path.join(__dirname, '..', 'data', 'products.json');
  const original = fs.existsSync(dataFile) ? fs.readFileSync(dataFile, 'utf8') : null;

  try {
    fs.writeFileSync(dataFile, '[]');

    const server = http.createServer(app);
    await new Promise((resolve) => server.listen(0, resolve));
    const { port } = server.address();

    try {
      const response = await fetch(`http://127.0.0.1:${port}/api/admin/products`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-admin-password': process.env.ADMIN_PASSWORD || 'VEEZO2026',
        },
        body: JSON.stringify({ name: 'Persistence Test', description: 'Stored in file', price: 99, stock: 5 }),
      });

      assert.equal(response.status, 201);
      const saved = JSON.parse(fs.readFileSync(dataFile, 'utf8'));
      assert.ok(saved.some((item) => item.name === 'Persistence Test'));
    } finally {
      await new Promise((resolve) => server.close(resolve));
    }
  } finally {
    if (original === null) fs.rmSync(dataFile, { force: true });
    else fs.writeFileSync(dataFile, original);
  }
});
