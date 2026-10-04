import test from'node:test';import assert from'node:assert/strict';import{parseDateInput,jalaliToGregorian}from'../src/calendar.mjs';
test('jalali new year conversion',()=>{assert.deepEqual(jalaliToGregorian(1405,1,1),{gy:2026,gm:3,gd:21})});
test('parse Gregorian',()=>assert.equal(parseDateInput('2026-10-04','gregorian'),'2026-10-04'));
test('parse Jalali',()=>assert.equal(parseDateInput('1405-07-12','jalali'),'2026-10-04'));
