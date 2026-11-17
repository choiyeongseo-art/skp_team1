const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');
const path = require('node:path');
const root = path.join(__dirname, '../../busan-drop');
function initialize(language, savedLanguage, languages) {
  const context = {
    navigator: {language, languages},
    location: {pathname:'/busandrop/login'},
    window: {BUSAN_CONTENT:{brands:[],deals:[]}},
    localStorage: {getItem:()=>JSON.stringify({language:savedLanguage})},
    document: {querySelector(){}},
    validVisitDate:()=>false,normalizeShoppingTypes:()=>[],validStoreKey:()=>false
  };
  vm.createContext(context);
  vm.runInContext(fs.readFileSync(path.join(root, 'language.js'), 'utf8'), context);
  const app = fs.readFileSync(path.join(root, 'app.js'), 'utf8').split('const persist=')[0];
  vm.runInContext(app, context);
  return vm.runInContext('({language:state.language,pending:state.pendingLanguage})', context);
}
test('first login screen uses the preferred device language and falls back to English', () => {
  const cases = [
    ['ko-KR','ko'],['ko','ko'],['ja-JP','ja'],['en-US','en'],['en-GB','en'],
    ['zh','zh'],['zh-CN','zh'],['zh-SG','zh'],['zh-Hans','zh'],['zh-Hans-HK','zh'],
    ['zh-TW','zh-TW'],['zh-HK','zh-TW'],['zh-MO','zh-TW'],['zh-Hant','zh-TW'],
    ['zh-Hant-CN','zh-TW'],['ZH_hant_TW','zh-TW'],
    ['fr-FR','en'],['th-TH','en'],['vi-VN','en'],['de-DE','en'],['','en']
  ];
  for (const [device, expected] of cases) {
    const result = initialize(device);
    assert.equal(result.language, expected, device);
    assert.equal(result.pending, expected, device);
  }
});
test('first preferred language determines the result even when a supported secondary language exists', () => {
  assert.equal(initialize('ko-KR', undefined, ['fr-FR','ko-KR']).language, 'en');
  assert.equal(initialize('en-US', undefined, ['ja-JP','en-US']).language, 'ja');
});
test('saved manual language choices remain selected and invalid old values fall back to the device', () => {
  for (const value of ['ko','ja','zh','zh-TW','en']) {
    assert.equal(initialize('fr-FR', value).language, value);
  }
  assert.equal(initialize('ja-JP', 'invalid').language, 'ja');
});
