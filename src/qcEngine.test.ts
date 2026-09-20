import{describe,it,expect}from'vitest';import{evaluateConversation,scoreWorkflow,finalScore}from'./qcEngine';

describe('sampler conversation QC',()=>{
 it('extracts evidence and scores a complete coordination call',()=>{
  const q=evaluateConversation('سلام وقت بخیر، من نمونه گیر روبرا هستم. فردا صبح ساعت 8 خدمت شما می رسم. لطفا آدرس و پلاک و واحد را تایید می کنید؟ حدود ده دقیقه قبل از رسیدن تماس می گیرم. برای آزمایش ناشتا باشید، آب ساده مشکلی ندارد و در مورد دارو طبق دستور پزشک عمل کنید. سوال یا ابهامی دارید؟ پس هماهنگ شد، ممنون.');
  expect(q.conversationScore).not.toBeNull();
  expect(q.coverage).toBeGreaterThanOrEqual(80);
  expect(q.criticalFailures).toEqual([]);
  expect(q.findings.find(x=>x.ruleId==='C04')?.matched).toBe(true);
  expect(q.findings.find(x=>x.ruleId==='C06')?.matched).toBe(true);
 });
 it('flags critical missing preparation/address evidence',()=>{
  const q=evaluateConversation('سلام، فردا صبح میام. ممنون.');
  expect(q.criticalFailures).toContain('C04');
  expect(q.criticalFailures).toContain('C06');
  expect(['high','critical']).toContain(q.risk);
  expect(q.requiresHumanReview).toBe(true);
 });
 it('does not score insufficient transcript',()=>{
  const q=evaluateConversation('سلام');
  expect(q.conversationScore).toBeNull();
  expect(q.criticalFailures).toContain('TRANSCRIPT_INSUFFICIENT');
 });
});

describe('sampler workflow evidence',()=>{
 it('requires three night attempts, spacing, morning retry and final recording for no-answer flow',()=>{
  const w=scoreWorkflow({nightAttempts:3,twentyMinuteSpacing:'yes',morningRetry:'yes',userAnswered:'no',finalStatus:'no_answer_cancelled',coordinationRecorded:'yes',reviewerNote:'evidence'});
  expect(w.workflowScore).toBe(100);
  expect(w.issues).toEqual([]);
 });
 it('surfaces incomplete workflow instead of fabricating score evidence',()=>{
  const w=scoreWorkflow({nightAttempts:1,twentyMinuteSpacing:'unknown',morningRetry:'no',userAnswered:'no',finalStatus:'unknown',coordinationRecorded:'no',reviewerNote:''});
  expect(w.workflowScore).toBeLessThan(50);
  expect(w.issues.length).toBeGreaterThan(2);
 });
 it('combines only when both scores exist',()=>{
  expect(finalScore(80,90)).toBe(83);
  expect(finalScore(null,90)).toBeNull();
 });
});
