import{chromium}from'playwright';
const url=process.env.KP_SMOKE_URL||'http://127.0.0.1:4173/phoenix-dashboard/';
const browser=await chromium.launch({headless:true});

async function runCase(name,init){
  const context=await browser.newContext();
  if(init)await context.addInitScript(init);
  const page=await context.newPage(),errors=[];
  page.on('pageerror',e=>errors.push('pageerror:'+e.message));
  page.on('console',m=>{if(m.type()==='error'&&!m.text().includes('KULEPOSHTI_RUNTIME_ERROR'))errors.push('console:'+m.text())});
  const response=await page.goto(url,{waitUntil:'domcontentloaded',timeout:60000});
  if(!response||!response.ok())throw new Error(name+': navigation_failed status='+(response?.status()??'none'));
  await page.waitForTimeout(1800);
  const body=(await page.locator('body').innerText()).trim();
  if(!body.includes('کوله‌پشتی عملیاتی'))throw new Error(name+': operational_shell_missing body='+body.slice(0,400));
  if(body.length<20)throw new Error(name+': blank_or_too_short_page');
  if(errors.length)throw new Error(name+': runtime_errors '+errors.join(' | '));
  console.log(JSON.stringify({case:name,ok:true,status:response.status(),bodySample:body.slice(0,180)}));
  await context.close();
}
await runCase('normal');
await runCase('localStorage-blocked',()=>{
  try{Object.defineProperty(Storage.prototype,'getItem',{value(){throw new DOMException('blocked','SecurityError')}});Object.defineProperty(Storage.prototype,'setItem',{value(){throw new DOMException('blocked','SecurityError')}})}catch{}
});
await runCase('indexedDB-blocked',()=>{
  try{Object.defineProperty(globalThis,'indexedDB',{value:undefined,configurable:true})}catch{}
});
await browser.close();
