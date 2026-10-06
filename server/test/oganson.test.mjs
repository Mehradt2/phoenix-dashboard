import test from'node:test';import assert from'node:assert/strict';import{canonicalOgansonPayload}from'../src/oganson.mjs';
test('Oganson canonical adapter accepts common payload aliases',()=>{
 const x=canonicalOgansonPayload({job_id:'j-1',domain:'physician',text:'سلام بیمار',confidence:.91,subject:{id:'d-1',name:'دکتر تست'},occurred_at:'2026-10-07T10:00:00+03:30'});
 assert.equal(x.externalId,'j-1');assert.equal(x.subject.externalId,'d-1');assert.equal(x.transcript,'سلام بیمار');assert.equal(x.asrConfidence,.91);
});
test('Oganson nested result payload maps to canonical transcript',()=>{
 const x=canonicalOgansonPayload({id:'j-2',metadata:{domain:'voc',customerExternalId:'u-8'},result:{text:'پشتیبانی دیر جواب داد',confidence:.8,segments:[{start:0,end:2,text:'پشتیبانی'}]}});
 assert.equal(x.domain,'voc');assert.equal(x.customerExternalId,'u-8');assert.equal(x.segments.length,1);
});
