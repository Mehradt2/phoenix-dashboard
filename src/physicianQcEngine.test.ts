import{describe,it,expect}from'vitest';import{evaluatePhysician}from'./physicianQcEngine';
describe('physician evidence-first QC',()=>{
 it('extracts grounded physician evidence and keeps signals isolated',()=>{
  const q=evaluatePhysician('سلام وقت بخیر، من دکتر هستم. با خود بیمار صحبت می‌کنم؟ برای چه مشکلی تماس گرفتید؟ از کی این درد شروع شده؟ سابقه دیابت یا عمل جراحی دارید؟ چه دارویی مصرف می‌کنید و چند میلی‌گرم؟ حساسیت دارویی دارید؟ مرحله بعد آزمایش است. سوال دیگری دارید؟ ممنون.');
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
 it('fails closed on insufficient transcript',()=>{const q=evaluatePhysician('سلام');expect(q.conversationScore).toBeNull();expect(q.criticalFailures).toContain('TRANSCRIPT_INSUFFICIENT')})
});
