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
  await page.getByRole('button',{name:'ورودی مکالمات'}).click();
  await page.getByText('ورودی مکالمات نمونه‌گیران').waitFor({state:'visible',timeout:5000});
  await page.getByRole('button',{name:'قواعد QC'}).click();
  await page.getByText('Rule Pack نمونه‌گیران').waitFor({state:'visible',timeout:5000});
  await page.getByText('Policy Conflict').waitFor({state:'visible',timeout:5000});

  await page.getByRole('button',{name:'پزشکان'}).click();
  await page.getByRole('button',{name:'قواعد QC'}).click();
  await page.getByText('Rule Pack پزشکان').waitFor({state:'visible',timeout:5000});
  await page.getByText('Physician Candidate Gate').waitFor({state:'visible',timeout:5000});

  await page.getByRole('button',{name:'گزارش‌ها'}).click();
  await page.getByText('گزارش مدیریتی پزشکان').waitFor({state:'visible',timeout:5000});
  const body=(await page.locator('body').innerText()).trim();
  if(body.includes('Runtime Recovery'))throw new Error('unlock:runtime_recovery_visible');
  if(errors.length)throw new Error('unlock:runtime_errors '+errors.join(' | '));
  console.log(JSON.stringify({case:'multi-domain-operational-shell',ok:true,status:response.status(),bodySample:body.slice(0,260)}));
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
