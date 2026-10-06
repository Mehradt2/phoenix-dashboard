import test from'node:test';import assert from'node:assert/strict';
import{normalizePersian}from'../src/intelligence/persian.mjs';
import{extractMedicalEntities}from'../src/intelligence/medicalLexicon.mjs';
import{analyzeTranscript}from'../src/intelligence/index.mjs';

test('Persian normalization fixes Arabic variants and digits',()=>{
 assert.equal(normalizePersian('بيمار ۱۲۳ كیلو'),'بیمار 123 کیلو');
});
test('sampler scoring finds timing, address and fasting evidence',()=>{
 const x=analyzeTranscript({domain:'sampler',transcript:'سلام وقت بخیر من نمونه گیر روبرا هستم. فردا ساعت 8 تا 9 خدمت می رسم و این بازه مناسب است؟ آدرس خیابان آزادی کوچه ده پلاک 12 واحد 3 را تایید کنید. قبل از رسیدن تماس می گیرم. برای آزمایش ناشتا باشید و آب ساده مجاز است. سوالی دارید؟ پس فردا ساعت 8 تا 9 هماهنگ شد ممنون.'});
 assert.equal(x.analysis.scoreStatus,'review_required');
 assert.ok(x.analysis.conversationScore>60);
 assert.equal(x.analysis.findings.find(r=>r.ruleId==='C03').status,'pass');
 assert.equal(x.analysis.findings.find(r=>r.ruleId==='C04').status,'pass');
});
test('physician engine fails closed for metadata-dependent rules',()=>{
 const x=analyzeTranscript({domain:'physician',transcript:'سلام من پزشک دکترساینا هستم. با خود بیمار صحبت می کنم؟ سابقه دیابت یا فشار خون دارید؟ چه دارویی مصرف می کنید و دوز آن چند میلی گرم است؟ برای آزمایش ناشتا باشید.'});
 assert.equal(x.analysis.scoreStatus,'review_required');
 assert.ok(x.analysis.reviewGates.includes('PVQ-039'));
});
test('VOC detects negative result delay',()=>{
 const x=analyzeTranscript({domain:'voc',transcript:'خیلی ناراضی هستم، جواب آزمایش خیلی دیر شد و پشتیبانی هم پاسخ نداد.'});
 assert.equal(x.analysis.sentiment,'negative');
 assert.equal(x.analysis.satisfaction,'dissatisfied');
 assert.equal(x.analysis.primaryTopic,'result_delay');
});
test('medical lexicon extracts domain entities',()=>{
 const e=extractMedicalEntities('بیمار دیابت دارد و متفورمین 500 میلی گرم مصرف می کند. TSH هم درخواست شده.');
 assert.ok(e.some(x=>x.type==='disease'&&x.value==='دیابت'));
 assert.ok(e.some(x=>x.type==='drug'&&x.value==='متفورمین'));
 assert.ok(e.some(x=>x.type==='dose'));
 assert.ok(e.some(x=>x.type==='lab'));
});
