export type SamplerProfile={
 id:string;
 name:string;
 grade:string;
 city:string;
 active:boolean;
 source:'seed'|'manual';
 createdAt:string;
};

export const ACTIVE_SAMPLERS:SamplerProfile[]=[
 ['شایان مؤمن زاده','A','تهران'],
 ['محمد حسین محمدیانی','B','تهران'],
 ['محمد اسدزاده کلجاهی','A+','تهران'],
 ['پانیذ حاجی حسین','B','تهران'],
 ['داریوش روستایی','A','تهران'],
 ['نسا مالمیر','A','تهران'],
 ['بردیا اکبری','A+','تهران'],
 ['مهرنوش مدرسی نژاد','A','تهران'],
 ['پیام پورحسینی','A+','تهران'],
 ['آتوسا عصار','A+','تهران'],
 ['میعاد صنگور','A+','تهران'],
 ['مریم محمدی','A+','تهران'],
 ['سید مهدی عمادی','A','تهران'],
 ['مسعود یاراحمدی','A+','تهران'],
 ['یکتا محمدی','A+','تهران'],
 ['زهرا هاشم زاده','A+','تهران'],
 ['احمد مهری قلعه جوق','A+','تهران'],
 ['یعقوب خضری','A+','تهران'],
 ['زعیم جاویدمهر','A+','تهران'],
 ['غزاله دژند','A+','تهران'],
 ['داتیس رضازاده واصل','A','تهران'],
 ['علی ابوالفتحی','A','تهران'],
 ['مصطفی پارسائی','A','تهران'],
 ['مهران مقدم فر','A','تهران'],
 ['پگاه ایوبی','A','تهران'],
 ['محمدامین جمشیدی','A','تهران'],
 ['ستایش علی دادی','A','تهران'],
 ['محدثه پهلوانی','A','تهران'],
 ['سمانه آقایی','A','تهران'],
 ['محمد محمدپور حسنوند','A','تهران']
].map(([name,grade,city],i)=>({
 id:'seed-'+String(i+1).padStart(2,'0'),
 name,grade,city,active:true,source:'seed' as const,createdAt:'2026-09-21T00:00:00.000Z'
}));

const STORAGE_KEY='kp-sampler-directory-v1';
export const normalizeSamplerName=(v:string)=>v.normalize('NFKC').replace(/[يى]/g,'ی').replace(/[ك]/g,'ک').replace(/\s+/g,' ').trim();

function customRows():SamplerProfile[]{
 try{
  const raw=JSON.parse(localStorage.getItem(STORAGE_KEY)||'[]');
  return Array.isArray(raw)?raw.filter(x=>x&&typeof x.name==='string'):[];
 }catch{return[]}
}
export function localListSamplers():SamplerProfile[]{
 const merged=new Map<string,SamplerProfile>();
 for(const x of ACTIVE_SAMPLERS)merged.set(normalizeSamplerName(x.name),x);
 for(const x of customRows())merged.set(normalizeSamplerName(x.name),x);
 return[...merged.values()].sort((a,b)=>a.name.localeCompare(b.name,'fa'));
}
export function localCreateSampler(input:{name:string;grade:string;city:string}):SamplerProfile{
 const name=normalizeSamplerName(input.name),grade=String(input.grade||'').trim().toUpperCase(),city=String(input.city||'').trim();
 if(name.length<3)throw new Error('نام نمونه‌گیر معتبر نیست');
 if(!grade)throw new Error('گرید نمونه‌گیر الزامی است');
 if(!city)throw new Error('شهر نمونه‌گیر الزامی است');
 if(localListSamplers().some(x=>normalizeSamplerName(x.name)===name))throw new Error('این نمونه‌گیر از قبل در فهرست وجود دارد');
 const row:SamplerProfile={id:crypto.randomUUID(),name,grade,city,active:true,source:'manual',createdAt:new Date().toISOString()};
 const next=[...customRows(),row];localStorage.setItem(STORAGE_KEY,JSON.stringify(next));return row
}
export function samplerByName(rows:SamplerProfile[],name:string){const n=normalizeSamplerName(name);return rows.find(x=>normalizeSamplerName(x.name)===n)||null}

const dateOf=(v:string)=>{const raw=(v||'').slice(0,10);const d=new Date(raw+'T12:00:00');return Number.isNaN(d.getTime())?new Date():d};
const fmt=(v:string,opts:Intl.DateTimeFormatOptions)=>new Intl.DateTimeFormat('fa-IR-u-ca-persian',opts).format(dateOf(v));
export const persianDateLabel=(v:string)=>fmt(v,{year:'numeric',month:'long',day:'numeric'});
export const persianDayLabel=(v:string)=>fmt(v,{weekday:'long'});
export const persianMonthLabel=(v:string)=>fmt(v,{year:'numeric',month:'long'});
export function persianMonthKey(v:string){
 const p=new Intl.DateTimeFormat('en-US-u-ca-persian',{year:'numeric',month:'2-digit'}).formatToParts(dateOf(v));
 const y=p.find(x=>x.type==='year')?.value||'',m=p.find(x=>x.type==='month')?.value||'';
 return y&&m?`${y}-${m}`:''
}
