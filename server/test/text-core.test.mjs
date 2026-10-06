import test from 'node:test';
import assert from 'node:assert/strict';
import { normalizeFa, extractEntities, analyzePhysician, analyzeSampler, analyzeVoc } from '../src/text-core.mjs';

test('Persian normalization unifies Arabic letters and digits', () => {
  assert.equal(normalizeFa('ديابت ۱۲۳'), 'دیابت 123');
});

test('medical entity extraction tolerates common Persian ASR variants', () => {
  const e = extractEntities('بیمار دیابت دارد و انسولین و پلویکس و لوسارتان مصرف می کند');
  assert.ok(e.some(x => x.canonical === 'diabetes'));
  assert.ok(e.some(x => x.canonical === 'insulin'));
  assert.ok(e.some(x => x.canonical === 'clopidogrel'));
  assert.ok(e.some(x => x.canonical === 'losartan'));
});

test('negation does not create positive disease evidence', () => {
  const e = extractEntities('دیابت ندارم');
  assert.equal(e.find(x => x.canonical === 'diabetes')?.negated, true);
});

test('physician no-answer is non-scorable', () => {
  const q = analyzePhysician('', { durationSeconds: 15, workflow: { visitOutcome: 'no_answer' } });
  assert.equal(q.scoreStatus, 'non_scorable');
  assert.equal(q.conversationScore, null);
});

test('adult unauthorized companion is critical', () => {
  const q = analyzePhysician('من همسر بیمار هستم و بیمار الان حضور ندارد', {
    workflow: { patientAgeGroup: 'adult', participantState: 'companion_unverified', identityVerified: 'no' }
  });
  assert.ok(q.criticalFailures.includes('PVQ-029'));
  assert.equal(q.risk, 'critical');
});

test('physician extraction catches diabetes CABG and key medications', () => {
  const q = analyzePhysician(
    'سلام. خودتون بیمار هستید؟ سابقه دیابت و عمل قلب باز دارید. انسولین و پلاویکس و لوزارتان مصرف می کنید؟ برای آزمایش ناشتا باشید و فقط آب ساده مجاز است. سوالی دارید؟ ممنون',
    { workflow: { identityVerified: 'yes', participantState: 'patient_direct', patientAgeGroup: 'adult', expectedBrand: 'not_applicable', clinicalHistoryComplete: 'yes', medicationDoseStatus: 'complete' } }
  );
  assert.ok(q.signals.medications.includes('insulin'));
  assert.ok(q.signals.medications.includes('clopidogrel'));
  assert.ok(q.signals.medications.includes('losartan'));
  assert.ok(q.signals.conditions.includes('diabetes'));
  assert.ok(q.signals.conditions.includes('cabg'));
  assert.ok(q.conversationScore !== null);
});

test('physician extraction catches prolactin and PCOS', () => {
  const q = analyzePhysician(
    'سلام وقت بخیر، خودتون بیمار هستید؟ برای تنبلی تخمدان پیگیری دارید و درخواست تست پرولاکتین مطرح شده. سوال دیگری دارید؟ ممنون',
    { workflow: { identityVerified: 'yes', participantState: 'patient_direct', patientAgeGroup: 'adult', expectedBrand: 'not_applicable' } }
  );
  assert.ok(q.signals.tests.includes('prolactin'));
  assert.ok(q.signals.conditions.includes('pcos'));
});

test('sampler critical address time and prep rules can pass', () => {
  const q = analyzeSampler('سلام من نمونه گیر هستم. فردا ساعت 8 خدمت می رسم. آدرس و پلاک و واحد را تایید می کنید؟ لطفا ناشتا باشید و فقط آب ساده بخورید. سوالی دارید؟ پس هماهنگ شد ممنون');
  assert.equal(q.criticalFailures.length, 0);
  assert.ok((q.conversationScore || 0) > 70);
});

test('VOC classifies sampler delay and dissatisfaction', () => {
  const q = analyzeVoc('خیلی ناراضی هستم، نمونه گیر هنوز نرسیده و تاخیر دارد و کسی هم پیگیری نکرده');
  assert.equal(q.topic.id, 'sampler_delay');
  assert.equal(q.satisfaction.label, 'dissatisfied');
  assert.equal(q.resolution, 'unresolved');
});
