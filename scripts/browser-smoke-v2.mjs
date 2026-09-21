import{chromium}from'playwright';
const url=process.env.KP_SMOKE_URL||'http://127.0.0.1:4173/phoenix-dashboard/';
const browser=await chromium.launch({headless:true});
const probeUrl=(name)=>url+(url.includes('?')?'&':'?')+'probe='+encodeURIComponent(name)+'-'+Date.now();

async function openUnlocked(){
 const context=await browser.newContext({viewport:{width:1440,height:1000}});
 const page=await context.newPage(),errors=[];
 page.on('pageerror',e=>errors.push('pageerror:'+e.message));
 page.on('console',m=>{if(m.type()==='error'&&!m.text().includes('KULEPOSHTI_RUNTIME_ERROR'))errors.push('console:'+m.text());if(['error','warning'].includes(m.type()))console.log('BROWSER_'+m.type().toUpperCase()+':',m.text())});
 page.on('requestfailed',r=>console.log('REQUEST_FAILED:',r.url(),r.failure()?.errorText||''));
 page.on('response',r=>{if(r.status()>=400&&/huggingface|hf\.co|xethub/i.test(r.url()))console.log('MODEL_HTTP_ERROR:',r.status(),r.url())});
 const response=await page.goto(probeUrl('operational'),{waitUntil:'domcontentloaded',timeout:60000});
 if(!response?.ok())throw new Error('navigation_failed');
 const pass='Kp-Test-'+Date.now()+'-Only';
 await page.locator('input[type=password]').fill(pass);
 const create=page.getByRole('button',{name:/ساخت Vault/});
 if(await create.count())await create.click();else await page.getByRole('button',{name:/ورود به کوله‌پشتی/}).click();
 await page.getByText('از مکالمه خام تا اقدام اصلاحی').waitFor({state:'visible',timeout:15000});
 return{context,page,errors}
}
async function selectDomain(page,domain){
 await page.locator('.domain-switch button').filter({hasText:domain==='sampler'?'نمونه‌گیران':'پزشکان'}).click();
}
async function addManualSampler(page,name){
 await selectDomain(page,'sampler');
 await page.locator('.sidebar nav button').filter({hasText:'نمونه‌گیران'}).click();
 await page.getByText('فهرست فعال نمونه‌گیران').waitFor({state:'visible',timeout:5000});
 const box=page.locator('.sampler-directory');
 await box.locator('input').nth(0).fill(name);
 await box.locator('select').selectOption('B');
 await box.locator('input').nth(1).fill('تهران');
 await box.getByRole('button',{name:'افزودن نمونه‌گیر'}).click();
 await page.getByText(name,{exact:true}).first().waitFor({state:'visible',timeout:5000});
}
async function manualCase(page,{domain,person,fileName,transcript,date}){
 await selectDomain(page,domain);
 await page.locator('.sidebar nav button').filter({hasText:'ورودی مکالمات'}).click();
 if(domain==='sampler')await page.getByLabel('نمونه‌گیر پیش‌فرض').selectOption(person);
 else await page.locator('input[placeholder*="پزشک"]').first().fill(person);
 await page.locator('input[type=file][accept="audio/*"]').first().setInputFiles({name:fileName,mimeType:'audio/wav',buffer:Buffer.from('RIFF-'+fileName+'-'+Date.now())});
 if(domain==='sampler'&&date)await page.getByLabel('تاریخ مکالمه فایل').first().fill(date);
 page.once('dialog',async d=>d.accept(transcript));
 await page.getByRole('button',{name:'Transcript دستی'}).click();
 await page.getByText('صف Review').waitFor({state:'visible',timeout:8000});
 await page.getByText(person,{exact:true}).first().waitFor({state:'visible',timeout:8000});
}
async function realAsrCase(page,{domain,person,filePath,date}){
 if(!filePath)throw new Error('real_asr_fixture_missing:'+domain);
 await selectDomain(page,domain);
 await page.locator('.sidebar nav button').filter({hasText:'ورودی مکالمات'}).click();
 if(domain==='sampler')await page.getByLabel('نمونه‌گیر پیش‌فرض').selectOption(person);
 else await page.locator('input[placeholder*="پزشک"]').first().fill(person);
 await page.locator('input[type=file][accept="audio/*"]').first().setInputFiles(filePath);
 if(domain==='sampler'&&date)await page.getByLabel('تاریخ مکالمه فایل').first().fill(date);
 await page.getByRole('button',{name:/شروع پردازش Batch/}).click();
 await page.getByText('صف Review').waitFor({state:'visible',timeout:420000});
 const row=page.locator('tbody tr').filter({hasText:person}).first();
 await row.waitFor({state:'visible',timeout:10000});
 await row.getByRole('button',{name:/بررسی/}).click();
 await page.locator('.review-drawer .evidence-list .ev').first().waitFor({state:'visible',timeout:10000});
 await page.locator('.review-drawer details summary').filter({hasText:'Transcript کامل'}).click();
 const transcript=(await page.locator('.review-drawer pre').innerText()).trim();
 if(transcript.length<10)throw new Error('real_asr_transcript_too_short:'+domain);
 await page.locator('.review-drawer .icon-only').click();
 return transcript
}
async function duplicateGuard(page,filePath,person){
 await selectDomain(page,'sampler');
 await page.locator('.sidebar nav button').filter({hasText:'ورودی مکالمات'}).click();
 await page.getByLabel('نمونه‌گیر پیش‌فرض').selectOption(person);
 await page.locator('input[type=file][accept="audio/*"]').first().setInputFiles(filePath);
 await page.getByRole('button',{name:/شروع پردازش Batch/}).click();
 await page.getByText(/فایل تکراری/).waitFor({state:'visible',timeout:15000});
}
const{context,page,errors}=await openUnlocked();
await selectDomain(page,'sampler');
await page.locator('.sidebar nav button').filter({hasText:'نمونه‌گیران'}).click();
await page.getByText('شایان مؤمن زاده',{exact:true}).first().waitFor({state:'visible',timeout:5000});
const added='نمونه‌گیر تست عملیاتی '+String(Date.now()).slice(-6);
await addManualSampler(page,added);
await manualCase(page,{domain:'sampler',person:added,fileName:'sampler-manual-e2e.wav',date:'2026-09-20',transcript:'سلام وقت بخیر من نمونه گیر روبرا هستم. فردا ساعت هشت تا نه خدمت می رسم. لطفا آدرس خیابان آزادی کوچه ده پلاک دوازده را تایید کنید. برای آزمایش ناشتا باشید، آب ساده مجاز است. قبل از رسیدن تماس می گیرم. سوال دیگری دارید؟ ممنون.'});
await manualCase(page,{domain:'physician',person:'پزشک تست E2E',fileName:'physician-manual-e2e.wav',transcript:'سلام وقت بخیر من پزشک دکترساینا هستم. لطفا نام و مشخصات خودتان را تایید کنید. علت مراجعه چیست و سابقه بیماری و داروهای مصرفی را بفرمایید. برای آزمایش ناشتا باشید و نتیجه را پیگیری کنید. ممنون.'});
if(process.env.KP_ASR_SMOKE==='1'){
 await page.locator('.sidebar nav button').filter({hasText:'AI و مدل‌ها'}).click();
 await page.getByRole('button',{name:/آماده‌سازی و Cache مدل|بارگذاری مدل آفلاین/}).click();
 await page.waitForFunction(()=>{const t=document.body.innerText;return t.includes('مدل Whisper آماده شد.')||t.includes('مدل آماده شد.')||t.includes('مدل آماده نشد:')},undefined,{timeout:300000});
 const modelState=await page.locator('body').innerText();
 if(modelState.includes('مدل آماده نشد:')){const line=modelState.split('\n').find(x=>x.includes('مدل آماده نشد:'))||'model failed';throw new Error('ASR_MODEL_WARM_FAILED: '+line)}
 const st=await realAsrCase(page,{domain:'sampler',person:'محمد حسین محمدیانی',filePath:process.env.KP_ASR_FIXTURE_SAMPLER,date:'2026-09-21'});
 const pt=await realAsrCase(page,{domain:'physician',person:'پزشک ASR واقعی',filePath:process.env.KP_ASR_FIXTURE_PHYSICIAN});
 await duplicateGuard(page,process.env.KP_ASR_FIXTURE_SAMPLER,'محمد حسین محمدیانی');
 console.log(JSON.stringify({case:'real-audio-whisper-qc',ok:true,samplerTranscript:st.slice(0,120),physicianTranscript:pt.slice(0,120)}));
}
await selectDomain(page,'sampler');
await page.locator('.sidebar nav button').filter({hasText:'گزارش‌ها'}).click();
await page.getByText('گزارش مدیریتی نمونه‌گیران').waitFor({state:'visible',timeout:5000});
await page.locator('.report-filters select').first().selectOption(added);
const reportText=await page.locator('main').innerText();
if(!reportText.includes('شهریور')||!reportText.includes(added)||!reportText.includes('یکشنبه'))throw new Error('dated_sampler_report_missing');
if(errors.length)throw new Error(errors.join(' | '));
console.log(JSON.stringify({case:'sampler-directory-date-month-report',ok:true,person:added}));
await context.close();
await browser.close();
