import{describe,expect,it}from'vitest';
import{compactQcContext}from'./localAi';

describe('local AI grounding context',()=>{
 it('only carries bounded deterministic QC evidence into the Copilot prompt',()=>{
  const qc={version:'sampler-conversation-qc-1.1.0',risk:'high',conversationScore:72.4,criticalFailures:['C04'],findings:[
   {ruleId:'C04',label:'آدرس',status:'fail',critical:true,excerpts:['آدرس نامشخص']},
   {ruleId:'C06',label:'ناشتایی',status:'pass',critical:true,excerpts:['ناشتا باشید','آب ساده مجاز است','extra']}
  ]};
  const out=compactQcContext(qc);
  expect(out.risk).toBe('high');
  expect(out.conversationScore).toBe(72.4);
  expect(out.criticalFailures).toEqual(['C04']);
  expect(out.findings[1].excerpts).toHaveLength(2);
 });
 it('does not invent missing scores or findings',()=>{
  const out=compactQcContext({});
  expect(out.conversationScore).toBeNull();
  expect(out.findings).toEqual([]);
  expect(out.criticalFailures).toEqual([]);
 });
});
