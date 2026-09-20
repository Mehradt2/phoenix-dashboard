import{describe,it,expect}from'vitest';import{evaluatePhysician,scorePhysicianWorkflow,emptyPhysicianWorkflow}from'./physicianQcEngine';

describe('physician evidence-first QC',()=>{
 it('extracts grounded physician evidence and keeps signals isolated',()=>{
  const q=evaluatePhysician('سلام وقت بخیر، من دکتر هستم. با خود بیمار صحبت می‌کنم؟ الان وقت مناسبی برای صحبت است؟ برای چه مشکلی تماس گرفتید؟ از کی این درد شروع شده؟ سابقه دیابت یا عمل جراحی دارید؟ چه دارویی مصرف می‌کنید و چند میلی‌گرم؟ حساسیت دارویی دارید؟ مرحله بعد آزمایش است و نسخه را ثبت می‌کنم. سوال دیگری دارید؟ ممنون.');
  expect(q.conversationScore).not.toBeNull();expect(q.findings.find(x=>x.ruleId==='P02')?.status).toBe('pass');expect(q.tone.isolatedFromQcScore).toBe(true)
 });
 it('does not convert a future prescription commitment into registered',()=>{
  const q=evaluatePhysician('برای ویتامین دی بهتر است آزمایش بدهید، اگر موافقید داخل نسخه اضافه می‌کنم. بیمار گفت بله برای انجام آزمایش موافقم.');
  expect(q.vitaminD.mentioned).toBe(true);expect(q.vitaminD.prescriptionStatus).toBe('committed_to_register');expect(q.vitaminD.prescriptionStatus).not.toBe('registered')
 });
 it('registers only explicit past/performed wording',()=>{
  const q=evaluatePhysician('ویتامین D را داخل نسخه اضافه کردم و بیمار گفت برای انجام آزمایش موافقم.');
  expect(q.vitaminD.prescriptionStatus).toBe('registered');expect(q.vitaminD.externalVerification).toBe('not_available')
 });
 it('flags short-call duration without fabricating a failed medical rule',()=>{
  const q=evaluatePhysician('سلام وقت بخیر، من پزشک هستم. با خود بیمار صحبت می‌کنم؟ مرحله بعد آزمایش و پیگیری است. سوالی دارید؟ ممنون.',15);
  expect(q.durationSignals?.under20).toBe(true);expect(q.warnings.some(x=>x.includes('۲۰ ثانیه'))).toBe(true)
 });
 it('fails closed on insufficient transcript',()=>{const q=evaluatePhysician('سلام');expect(q.conversationScore).toBeNull();expect(q.criticalFailures).toContain('TRANSCRIPT_INSUFFICIENT')})
});

describe('physician operational workflow gate',()=>{
 it('passes a complete answered visit with non-applicable interpretation',()=>{
  const e={...emptyPhysicianWorkflow,visitOutcome:'answered' as const,visitAttempts:1 as const,interpretationApplicable:'no' as const,interpretationOutcome:'not_applicable' as const,responseRecorded:'yes' as const,serviceChannel:'b2c' as const,secondOrgPrescription:'not_applicable' as const,cancelled:'no' as const,cancellationDuringVisit:'not_applicable' as const,goldenTests:'not_applicable' as const};
  const r=scorePhysicianWorkflow(e);expect(r.ok).toBe(true);expect(r.issues).toEqual([])
 });
 it('requires three attempts for no-answer and blocks invalid interpretation channel',()=>{
  const e={...emptyPhysicianWorkflow,visitOutcome:'no_answer' as const,visitAttempts:1 as const,interpretationApplicable:'yes' as const,interpretationOutcome:'no_answer' as const,interpretationAttempts:2 as const,responseRecorded:'no' as const,serviceChannel:'b2c' as const,secondOrgPrescription:'yes' as const,cancelled:'yes' as const,cancellationDuringVisit:'no' as const,goldenTests:'failed' as const};
  const r=scorePhysicianWorkflow(e);expect(r.ok).toBe(false);expect(r.issues.length).toBeGreaterThanOrEqual(6)
 });
});
