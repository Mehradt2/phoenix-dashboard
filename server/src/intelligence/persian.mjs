const ARABIC_TO_PERSIAN=new Map([['ي','ی'],['ى','ی'],['ك','ک'],['ۀ','ه'],['ة','ه'],['ؤ','و'],['إ','ا'],['أ','ا']]);
const faDigits='۰۱۲۳۴۵۶۷۸۹',arDigits='٠١٢٣٤٥٦٧٨٩';
export function normalizePersian(input=''){
 let s=String(input).normalize('NFKC');
 s=[...s].map(ch=>ARABIC_TO_PERSIAN.get(ch)||ch).join('');
 s=s.replace(/[\u064B-\u065F\u0670]/g,'').replace(/ـ+/g,'');
 s=s.replace(/[۰-۹]/g,d=>String(faDigits.indexOf(d))).replace(/[٠-٩]/g,d=>String(arDigits.indexOf(d)));
 s=s.replace(/\u200c+/g,'‌').replace(/[ \t]+/g,' ').replace(/\s*([،؛:؟!,.])\s*/g,'$1 ').replace(/\s+/g,' ').trim();
 return s;
}
export function sentences(input=''){return normalizePersian(input).split(/(?<=[.!؟!?])\s+|\n+/).map(x=>x.trim()).filter(Boolean)}
export function tokens(input=''){return normalizePersian(input).toLowerCase().split(/[^\p{L}\p{N}‌+.%/-]+/u).filter(Boolean)}
export function evidenceWindows(text,patterns,window=64,max=3){
 const t=normalizePersian(text),out=[];
 for(const p of patterns){p.lastIndex=0;const m=p.exec(t);if(m){const i=m.index||0;out.push(t.slice(Math.max(0,i-window),Math.min(t.length,i+m[0].length+window)));if(out.length>=max)break}}
 return [...new Set(out)];
}
export function lexicalNegated(text,index,window=36){
 const t=normalizePersian(text),left=t.slice(Math.max(0,index-window),index);
 return /(نیست|ندارم|ندارد|نشد|نمی|نبود|هرگز|اصلا|اصلاً|بدون)/.test(left);
}
export function textQuality(text){
 const t=normalizePersian(text),length=t.length,words=tokens(t).length;
 return{length,words,sufficient:length>=20&&words>=5,veryShort:length<10};
}
