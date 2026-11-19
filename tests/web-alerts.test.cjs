const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const ts = require('typescript');

function load(platform, accepted = true) {
  const calls = [];
  const module = { exports: {} };
  const code = ts.transpileModule(fs.readFileSync(path.join(__dirname, '../utils/alerts.ts'), 'utf8'), { compilerOptions: { module: ts.ModuleKind.CommonJS } }).outputText;
  vm.runInNewContext(code, { module, exports: module.exports, require: () => ({ Platform: { OS: platform }, Alert: { alert: (...args) => calls.push(args) } }), window: { alert: message => calls.push(message), confirm: () => accepted, prompt: () => null } });
  return { alert: module.exports.Alert.alert, calls };
}

test('web alerts display errors and preserve success navigation callbacks', () => {
  const app = load('web'); let navigated = 0;
  app.alert('Saved', 'Profile updated', [{ text: 'OK', onPress: () => navigated++ }]);
  assert.equal(app.calls[0], 'Saved\n\nProfile updated');
  assert.equal(navigated, 1);
});

test('web confirmation never runs the action when cancelled', () => {
  let action = 0; let cancel = 0;
  const buttons = [{ text: 'Cancel', style: 'cancel', onPress: () => cancel++ }, { text: 'Delete', onPress: () => action++ }];
  load('web', false).alert('Confirm', undefined, buttons);
  assert.equal(action, 0); assert.equal(cancel, 1);
  load('web', true).alert('Confirm', undefined, buttons);
  assert.equal(action, 1); assert.equal(cancel, 1);
});

test('native alerts retain the native dialog implementation', () => {
  const app = load('ios'); app.alert('Native', 'Message');
  assert.equal(app.calls[0][0], 'Native');
  assert.equal(app.calls[0][1], 'Message');
});
