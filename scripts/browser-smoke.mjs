import{chromium}from'playwright';
const url=process.env.KP_SMOKE_URL||'http://127.0.0.1:4173/phoenix-dashboard/';
const browser=await chromium.launch({headless:true});

async function basic(name,init){
  const context=await browser.newContext();
  if(init)await context.addInitScript(init);
  const page=await context.newPage(),errors=[];
  page.on('pageerror',e=>errors.push('pageerror:'+e.message));
  page.on('console',m=>{if(m.type()==='error'&&!m.text().includes('KULEPOSHTI_RUNTIME_ERROR'))errors.push('console:'+m.text())});
  const response=await page.goto(url,{waitUntil:'domcontentloaded',timeout:60000});
  if(!response||!response.ok())throw new Error(name+': navigation_failed status='+(response?.status()??'none'));
  await page.waitForTimeout(900);
  const body=(await page.locator('body').innerText()).trim();
  if(!body.includes('کوله‌پشتی عملیاتی'))throw new Error(name+': shell_missing '+body.slice(0,300));
  if(errors.length)throw new Error(name+': runtime_errors '+errors.join(' | '));
  await context.close();
}
async function operationalUnlock(){
  const context=await browser.newContext();
  const page=await context.newPage(),errors=[];
  page.on('pageerror',e=>errors.push('pageerror:'+e.message));
  page.on('console',m=>{if(m.type()==='error')errors.push('console:'+m.text())});
  const response=await page.goto(url,{waitUntil:'domcontentloaded',timeout:60000});
  if(!response||!response.ok())throw new Error('unlock:navigation_failed');
  await page.locator('input[type=password]').fill('Kp-Test-Passphrase-2026');
  const create=page.getByRole('button',{name:'ساخت Vault'});
  if(await create.count())await create.click();else await page.getByRole('button',{name:'باز کردن Vault'}).click();
  await page.getByText('Upload Center نمونه‌گیر').waitFor({state:'visible',timeout:15000});
  await page.getByText('صف بررسی').waitFor({state:'visible',timeout:5000});
  const body=(await page.locator('body').innerText()).trim();
  if(body.includes('Runtime Recovery'))throw new Error('unlock:runtime_recovery_visible');
  if(errors.length)throw new Error('unlock:runtime_errors '+errors.join(' | '));
  console.log(JSON.stringify({case:'vault-unlock-operational',ok:true,status:response.status(),bodySample:body.slice(0,220)}));
  await context.close();
}
await basic('normal-shell');
await operationalUnlock();
await basic('localStorage-blocked',()=>{try{Object.defineProperty(Storage.prototype,'getItem',{value(){throw new DOMException('blocked','SecurityError')}});Object.defineProperty(Storage.prototype,'setItem',{value(){throw new DOMException('blocked','SecurityError')}})}catch{}});
await basic('indexedDB-blocked',()=>{try{Object.defineProperty(globalThis,'indexedDB',{value:undefined,configurable:true})}catch{}});
await browser.close();
