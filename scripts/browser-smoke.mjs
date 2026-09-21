import{chromium}from'playwright';
const url=process.env.KP_SMOKE_URL||'http://127.0.0.1:4173/phoenix-dashboard/';
const browser=await chromium.launch({headless:true});
const probeUrl=(name)=>url+(url.includes('?')?'&':'?')+'probe='+encodeURIComponent(name)+'-'+Date.now();

async function basic(name,init){
  const context=await browser.newContext();
  if(init)await context.addInitScript(init);
  const page=await context.newPage(),errors=[];
  page.on('pageerror',e=>errors.push('pageerror:'+e.message));
  page.on('console',m=>{if(m.type()==='error'&&!m.text().includes('KULEPOSHTI_RUNTIME_ERROR'))errors.push('console:'+m.text())});
  const response=await page.goto(probeUrl(name),{waitUntil:'domcontentloaded',timeout:60000});
  if(!response||!response.ok())throw new Error(name+': navigation_failed status='+(response?.status()??'none'));
  await page.waitForTimeout(900);
  const body=(await page.locator('body').innerText()).trim();
  if(!body.includes('کوله‌پشتی'))throw new Error(name+': shell_missing '+body.slice(0,300));
  if(body.length<20)throw new Error(name+': blank_page');
  if(errors.length)throw new Error(name+': runtime_errors '+errors.join(' | '));
  await context.close();
}

async function manualCase(page,{domain,person,fileName,bytes,transcript,ruleId}){
  await page.locator('.domain-switch button').filter({hasText:domain==='sampler'?'نمونه‌گیران':'پزشکان'}).click();
  await page.locator('.sidebar nav button').filter({hasText:'ورودی مکالمات'}).click();
  await page.getByText(domain==='sampler'?'ورودی مکالمات نمونه‌گیران':'ورودی مکالمات پزشکان').waitFor({state:'visible',timeout:5000});
  const personInput=page.locator(domain==='sampler'?'input[placeholder*="نمونه‌گیر"]':'input[placeholder*="پزشک"]').first();
  await personInput.fill(person);
  const file=page.locator('input[type=file][accept="audio/*"]').first();
  await file.setInputFiles({name:fileName,mimeType:'audio/wav',buffer:Buffer.from(bytes)});
  await page.getByRole('button',{name:'Transcript دستی'}).waitFor({state:'visible',timeout:5000});
  page.once('dialog',async d=>{await d.accept(transcript)});
  await page.getByRole('button',{name:'Transcript دستی'}).click();
  await page.getByText('صف Review').waitFor({state:'visible',timeout:8000});
  await page.getByText(person,{exact:true}).first().waitFor({state:'visible',timeout:8000});
  const row=page.locator('tbody tr').filter({hasText:person}).first();
  await row.getByRole('button',{name:/بررسی/}).click();
  await page.getByText(ruleId,{exact:false}).first().waitFor({state:'visible',timeout:5000});
  await page.locator('.review-drawer .icon-only').click();
  await page.locator('.sidebar nav button').filter({hasText:domain==='sampler'?'نمونه‌گیران':'پزشکان'}).click();
  await page.getByText(person,{exact:true}).first().waitFor({state:'visible',timeout:5000});
}

async function operationalUnlock(){
  const context=await browser.newContext({viewport:{width:1440,height:1000}});
  const page=await context.newPage(),errors=[];
  page.on('pageerror',e=>errors.push('pageerror:'+e.message));
  page.on('console',m=>{if(m.type()==='error')errors.push('console:'+m.text())});
  const response=await page.goto(probeUrl('operational'),{waitUntil:'domcontentloaded',timeout:60000});
  if(!response||!response.ok())throw new Error('unlock:navigation_failed');
  await page.locator('input[type=password]').fill('Kp-Test-Passphrase-2026');
  const create=page.getByRole('button',{name:/ساخت Vault/});
  if(await create.count())await create.click();else await page.getByRole('button',{name:/ورود به کوله‌پشتی/}).click();

  await page.getByText('از مکالمه خام تا اقدام اصلاحی').waitFor({state:'visible',timeout:15000});

  await manualCase(page,{
    domain:'sampler',
    person:'نمونه‌گیر تست E2E',
    fileName:'sampler-e2e.wav',
    bytes:'RIFF-SAMPLER-E2E-2026',
    transcript:'سلام وقت بخیر، من نمونه گیر روبرا هستم. با خود شما برای نمونه گیری تماس گرفتم. فردا ساعت 8 تا 9 خدمت می رسم، این بازه مناسب است؟ لطفا آدرس خیابان آزادی، کوچه ده، پلاک 12 واحد 3 را تایید کنید. قبل از رسیدن تماس می گیرم. برای آزمایش ناشتا باشید، آب ساده مجاز است و چای و قهوه نخورید. سوال یا ابهامی دارید؟ پس فردا ساعت 8 تا 9 در همان آدرس هماهنگ شد، ممنون.',
    ruleId:'C03'
  });

  await manualCase(page,{
    domain:'physician',
    person:'پزشک تست E2E',
    fileName:'physician-e2e.wav',
    bytes:'RIFF-PHYSICIAN-E2E-2026-DIFFERENT',
    transcript:'سلام وقت بخیر، من پزشک دکترساینا هستم. با خود بیمار صحبت می کنم؟ لطفا نام و مشخصات خودتان را تایید کنید. علت مراجعه چیست و از چه زمانی شروع شده؟ سابقه دیابت، فشار خون یا عمل جراحی دارید؟ چه دارویی مصرف می کنید و دوز آن چند میلی گرم است؟ برای آزمایش لازم است ناشتا باشید. مرحله بعد آزمایش و پیگیری نتیجه است. سوال دیگری دارید؟ ممنون.',
    ruleId:'PVQ-027'
  });

  await page.locator('.sidebar nav button').filter({hasText:'قواعد QC'}).click();
  await page.getByText('Rule Pack پزشکان').waitFor({state:'visible',timeout:5000});
  await page.getByText('PVQ-040',{exact:false}).first().waitFor({state:'visible',timeout:5000});
  await page.locator('.sidebar nav button').filter({hasText:'گزارش‌ها'}).click();
  await page.getByText('گزارش مدیریتی پزشکان').waitFor({state:'visible',timeout:5000});
  await page.getByText('پزشک تست E2E',{exact:true}).first().waitFor({state:'visible',timeout:5000});

  const body=(await page.locator('body').innerText()).trim();
  if(body.includes('Runtime Recovery'))throw new Error('unlock:runtime_recovery_visible');
  if(errors.length)throw new Error('unlock:runtime_errors '+errors.join(' | '));
  console.log(JSON.stringify({case:'multi-domain-case-pipeline',ok:true,status:response.status(),bodySample:body.slice(0,260)}));
  await context.close();
}
async function mobileShell(){
 const context=await browser.newContext({viewport:{width:390,height:844}}),page=await context.newPage(),errors=[];
 page.on('pageerror',e=>errors.push(e.message));let body='';for(let i=0;i<5;i++){await page.goto(probeUrl('mobile-'+i),{waitUntil:'domcontentloaded',timeout:60000});await page.waitForTimeout(700);body=(await page.locator('body').innerText()).trim();if(body.includes('کوله‌پشتی'))break;await page.waitForTimeout(1200)}if(!body.includes('کوله‌پشتی'))throw new Error('mobile_shell_missing body='+body.slice(0,180));if(errors.length)throw new Error('mobile_runtime:'+errors.join('|'));await context.close();
}
await basic('normal-shell');
await operationalUnlock();
await mobileShell();
await basic('localStorage-blocked',()=>{try{Object.defineProperty(Storage.prototype,'getItem',{value(){throw new DOMException('blocked','SecurityError')}});Object.defineProperty(Storage.prototype,'setItem',{value(){throw new DOMException('blocked','SecurityError')}})}catch{}});
await basic('indexedDB-blocked',()=>{try{Object.defineProperty(globalThis,'indexedDB',{value:undefined,configurable:true})}catch{}});
await browser.close();
