import{describe,it,expect}from'vitest';import{evaluateVoc}from'./vocEngine';
describe('VOC Persian intelligence',()=>{
 it('detects dissatisfaction and result delay',()=>{const q=evaluateVoc('از تاخیر جواب آزمایش خیلی ناراضی هستم و هنوز نتیجه نیامده');expect(q.satisfaction).toBe('dissatisfied');expect(q.topics.some(x=>x.code==='result_delay')).toBe(true)});
 it('detects positive satisfaction',()=>{const q=evaluateVoc('همه چیز خیلی خوب بود و از نمونه گیر راضی بودم ممنون');expect(q.satisfaction).toBe('satisfied')});
 it('fails closed on very short transcript',()=>{const q=evaluateVoc('سلام');expect(q.scoreStatus).toBe('non_scorable');expect(q.requiresHumanReview).toBe(true)});
 it('does not invent numeric QC score',()=>{const q=evaluateVoc('برای فاکتور تماس گرفتم و از پاسخگویی راضی هستم');expect(q.conversationScore).toBeNull();expect(q.finalScore).toBeNull()})
});
