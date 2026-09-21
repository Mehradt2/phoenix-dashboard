import{describe,it,expect}from'vitest';import{evaluatePhysician,scorePhysicianWorkflow,emptyPhysicianWorkflow,type PhysicianWorkflowEvidence}from'./physicianQcEngine';

const resolved=(patch:Partial<PhysicianWorkflowEvidence>={}):PhysicianWorkflowEvidence=>({
 ...emptyPhysicianWorkflow,
 visitOutcome:'answered',visitAttempts:1,
 interpretationApplicable:'no',interpretationOutcome:'not_applicable',interpretationAttempts:0,
 responseRecorded:'yes',serviceChannel:'b2c',secondOrgPrescription:'not_applicable',
 cancelled:'no',cancellationDuringVisit:'not_applicable',goldenTests:'not_applicable',
 participantState:'patient_direct',patientAgeGroup:'adult',identityVerified:'yes',
 expectedBrand:'drsaina',duplicateContact:'no',rescheduleBoundary:'not_applicable',
 cancellationBoundary:'not_applicable',medicationDoseStatus:'not_applicable',
 clinicalHistoryComplete:'yes',audioIntelligibility:'good',communicationEnergy:'good',
 unsupportedMedicalCertainty:'no',speakerRoleResolved:'yes',lowConfidence:'no',
 reviewerNote:'test evidence',
 ...patch
});

describe('controlled physician PVQ-026..040',()=>{
 it('A02 no-answer is non-scorable and does not penalize physician',()=>{
  const ctx=resolved({visitOutcome:'no_answer',visitAttempts:3,participantState:'patient_unavailable',identityVerified:'unknown'});
  const q=evaluatePhysician('',0,ctx);
  expect(q.version).toBe('physician-qc-2.0.0');
  expect(q.scoreStatus).toBe('non_scorable');
  expect(q.conversationScore).toBeNull();
  expect(q.findings.find(x=>x.ruleId==='PVQ-026')?.status).toBe('pass');
  expect(q.criticalFailures).toEqual([]);
 });

 it('A12 unauthorized adult proxy triggers PVQ-029 Critical',()=>{
  const ctx=resolved({participantState:'companion_unverified',patientAgeGroup:'adult',identityVerified:'no'});
  const q=evaluatePhysician('سلام، بیمار حضور ندارد و من خواهر بیمار هستم. سابقه دیابت و انسولین دارد.',300,ctx);
  expect(q.findings.find(x=>x.ruleId==='PVQ-029')?.status).toBe('fail');
  expect(q.criticalFailures).toContain('PVQ-029');
  expect(q.risk).toBe('critical');
 });

 it('A14 minor with guardian is valid PVQ-028 exception',()=>{
  const ctx=resolved({participantState:'guardian_minor',patientAgeGroup:'minor',identityVerified:'yes'});
  const q=evaluatePhysician('سلام، من مادر کودک هشت ساله هستم و برای آزمایش او صحبت می‌کنم.',420,ctx);
  expect(q.findings.find(x=>x.ruleId==='PVQ-028')?.status).toBe('pass');
  expect(q.findings.find(x=>x.ruleId==='PVQ-029')?.status).toBe('not_applicable');
 });

 it('A17 wrong brand plus duplicate contact fails PVQ-030 and PVQ-031',()=>{
  const ctx=resolved({expectedBrand:'drsaina',duplicateContact:'yes'});
  const q=evaluatePhysician('سلام، از روبرا تماس می‌گیرم. این تماس پیگیری مجدد است.',300,ctx);
  expect(q.findings.find(x=>x.ruleId==='PVQ-030')?.status).toBe('fail');
  expect(q.findings.find(x=>x.ruleId==='PVQ-031')?.status).toBe('fail');
  expect(q.criticalFailures).not.toContain('PVQ-030');
 });

 it('A15 incomplete history fails PVQ-035 from structured adjudication',()=>{
  const q=evaluatePhysician('سلام، برای آزمایش تماس گرفتم.',90,resolved({clinicalHistoryComplete:'no'}));
  expect(q.findings.find(x=>x.ruleId==='PVQ-035')?.status).toBe('fail');
 });

 it('unknown speaker role remains Review, never hard Fail',()=>{
  const q=evaluatePhysician('Speaker A: سلام. Speaker B: بله.',120,resolved({speakerRoleResolved:'unknown'}));
  expect(q.findings.find(x=>x.ruleId==='PVQ-039')?.status).toBe('review');
  expect(q.reviewGates).toContain('PVQ-039');
 });

 it('low confidence remains Human Review gate',()=>{
  const q=evaluatePhysician('سلام، صدا نامشخص است.',120,resolved({lowConfidence:'yes'}));
  expect(q.findings.find(x=>x.ruleId==='PVQ-040')?.status).toBe('review');
  expect(q.reviewGates).toContain('PVQ-040');
 });

 it('keeps Vitamin D commitment distinct from registered prescription',()=>{
  const q=evaluatePhysician('برای ویتامین دی آزمایش بدهید؛ اگر موافقید داخل نسخه اضافه می‌کنم. بیمار گفت بله.',300,resolved());
  expect(q.vitaminD.mentioned).toBe(true);
  expect(q.vitaminD.prescriptionStatus).toBe('committed_to_register');
  expect(q.vitaminD.externalVerification).toBe('not_available');
 });

 it('records short call only as a separate signal',()=>{
  const q=evaluatePhysician('سلام، آزمایش را پیگیری می‌کنیم.',15,resolved());
  expect(q.durationSignals.under20).toBe(true);
  expect(q.warnings.some(x=>x.includes('۲۰ ثانیه'))).toBe(true);
 });
});

describe('physician operational + PVQ approval gate',()=>{
 it('passes only when operational and PVQ context are resolved',()=>{
  const r=scorePhysicianWorkflow(resolved());
  expect(r.ok).toBe(true);
  expect(r.issues).toEqual([]);
  expect(r.ruleCatalog).toContain('PVQ-026..040');
 });

 it('blocks incomplete proxy/brand/role/confidence evidence',()=>{
  const e=resolved({participantState:'companion_unverified',identityVerified:'unknown',expectedBrand:'unknown',duplicateContact:'unknown',speakerRoleResolved:'no',lowConfidence:'yes'});
  const r=scorePhysicianWorkflow(e);
  expect(r.ok).toBe(false);
  expect(r.issues.some(x=>x.includes('PVQ-027'))).toBe(true);
  expect(r.issues.some(x=>x.includes('PVQ-030'))).toBe(true);
  expect(r.issues.some(x=>x.includes('PVQ-039'))).toBe(true);
  expect(r.issues.some(x=>x.includes('PVQ-040'))).toBe(true);
 });

 it('requires three attempts for no-answer operational outcome',()=>{
  const r=scorePhysicianWorkflow(resolved({visitOutcome:'no_answer',visitAttempts:1}));
  expect(r.ok).toBe(false);
  expect(r.issues.some(x=>x.includes('۳ تلاش'))).toBe(true);
 });
});
