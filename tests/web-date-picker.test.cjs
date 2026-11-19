const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const ts = require('typescript');
const React = require('react');
const Renderer = require('react-test-renderer');
global.IS_REACT_ACT_ENVIRONMENT = true;

function loadPicker(platform) {
  const module = { exports: {} };
  const compiled = ts.transpileModule(fs.readFileSync(path.join(__dirname, '../components/DateTimePicker.tsx'), 'utf8'), { compilerOptions: { jsx: ts.JsxEmit.React, module: ts.ModuleKind.CommonJS, esModuleInterop: true } }).outputText;
  vm.runInNewContext(compiled, { module, exports: module.exports, Date, require: name => {
    if (name === 'react') return React;
    if (name === 'react-native') return { Platform: { OS: platform }, View: 'View', Text: 'Text', TouchableOpacity: 'Button' };
    if (name === '@react-native-community/datetimepicker') return 'NativePicker';
    throw new Error(name);
  } });
  return module.exports.default;
}

test('web date selection rejects dates before the minimum and submits a local calendar date', async () => {
  const Picker = loadPicker('web'); const selected = []; let tree;
  await Renderer.act(async () => { tree = Renderer.create(React.createElement(Picker, { value: new Date(2026, 10, 20), minimumDate: new Date(2026, 10, 19), mode: 'date', onChange: (_, date) => selected.push(date) })); });
  await Renderer.act(async () => tree.root.findByType('input').props.onChange({ target: { value: '2026-11-18' } }));
  await Renderer.act(async () => tree.root.findByType('Button').props.onPress());
  assert.equal(selected.length, 0);
  assert.equal(tree.root.findAllByProps({ accessibilityRole: 'alert' }).length, 1);
  await Renderer.act(async () => tree.root.findByType('input').props.onChange({ target: { value: '2026-11-22' } }));
  await Renderer.act(async () => tree.root.findByType('Button').props.onPress());
  assert.equal(selected.length, 1);
  assert.equal(selected[0].getFullYear(), 2026); assert.equal(selected[0].getMonth(), 10); assert.equal(selected[0].getDate(), 22);
  await Renderer.act(async () => tree.unmount());
});

test('native date selection retains the platform date picker', async () => {
  const Picker = loadPicker('ios'); let tree;
  await Renderer.act(async () => { tree = Renderer.create(React.createElement(Picker, { value: new Date(), mode: 'date' })); });
  assert.equal(tree.root.findAllByType('NativePicker').length, 1);
  await Renderer.act(async () => tree.unmount());
});
