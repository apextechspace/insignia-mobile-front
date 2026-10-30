const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const ts = require('typescript');

function loadPayment(platform) {
  const assigned = [];
  const popups = [];
  const requests = [];
  const compiled = ts.transpileModule(fs.readFileSync(path.join(__dirname, '../services/payment.ts'), 'utf8'), {
    compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2020, esModuleInterop: true },
  }).outputText;
  const module = { exports: {} };
  const mocks = {
    './api': { post: async (...args) => { requests.push(args); return { data: { status: 'success' } }; } },
    'react-native': { Platform: { OS: platform } },
    'expo-linking': { createURL: route => `insignia://${route}` },
    'expo-web-browser': { WebBrowserResultType: { OPENED: 'opened' }, openAuthSessionAsync: async (...args) => { popups.push(args); return { type: 'success' }; } },
  };
  vm.runInNewContext(compiled, {
    exports: module.exports, module, URL,
    window: { location: { origin: 'https://stay.insigniacourts.com', assign: url => assigned.push(url) } },
    require: name => { if (!(name in mocks)) throw new Error(`Unexpected module ${name}`); return mocks[name]; },
  });
  return { service: module.exports.paymentService, assigned, popups, requests };
}

test('web checkout navigates in the same tab after async initialization without waiting for a popup', async () => {
  const app = loadPayment('web');
  await app.service.initializeFlutterwave('booking', 42);
  const url = 'https://checkout.flutterwave.com/v3/hosted/pay/example';
  const result = await app.service.openFlutterwaveCheckout(url);
  assert.equal(result.type, 'opened');
  assert.deepEqual(app.assigned, [url]);
  assert.equal(app.popups.length, 0);
  assert.equal(app.requests[0][1].redirect_url, 'https://stay.insigniacourts.com/payment-complete');
});

test('web checkout rejects insecure or executable navigation URLs', async () => {
  const app = loadPayment('web');
  for (const url of ['javascript:alert(1)', 'http://checkout.flutterwave.com/pay', 'not-a-url']) {
    await assert.rejects(app.service.openFlutterwaveCheckout(url));
  }
  assert.equal(app.assigned.length, 0);
  assert.equal(app.popups.length, 0);
});

test('native checkout retains the Expo auth session and native callback', async () => {
  const app = loadPayment('android');
  await app.service.initializeFlutterwave('booking', 42);
  await app.service.openFlutterwaveCheckout('https://checkout.flutterwave.com/v3/hosted/pay/example');
  assert.equal(app.assigned.length, 0);
  assert.equal(app.popups.length, 1);
  assert.equal(app.popups[0][1], 'insignia://payment-complete');
  assert.equal(app.requests[0][1].redirect_url, 'insignia://payment-complete');
});
