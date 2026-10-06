import{normalizePersian}from'./persian.mjs';
const LEX={
 drug:['متفورمین','لووتیروکسین','آتورواستاتین','آسپرین','وارفارین','انسولین','لوزارتان','آملودیپین','پنتوپرازول','امپرازول','کلونازپام','سرترالین','فلوکستین','پردنیزولون','آنتی بیوتیک','قرص','دارو'],
 disease:['دیابت','فشار خون','پرفشاری خون','تیروئید','کم خونی','آنمی','کلیه','نارسایی کلیه','کبد','کبد چرب','سرطان','آسم','صرع','قلب','سکته','حساسیت','آلرژی','PCOS','تخمدان پلی کیستیک'],
 lab:['CBC','FBS','HbA1c','TSH','T4','T3','Vitamin D','ویتامین دی','ویتامین D','Ferritin','فریتین','B12','PSA','Free PSA','RF','Anti-CCP','کراتینین','اوره','چربی خون','کلسترول','تری گلیسرید','کشت ادرار','آزمایش ادرار'],
 symptom:['درد','تب','سرفه','سرگیجه','ضعف','خستگی','تهوع','استفراغ','تنگی نفس','خونریزی','سردرد','بی حالی','بی‌حالی'],
 preparation:['ناشتا','ناشتایی','آب ساده','صبحانه','چای','قهوه','سیگار','آدامس']
};
const esc=s=>s.replace(/[.*+?^$(){}|[\]\\]/g,'\\$&');
const termRegex=term=>new RegExp('(?<![\\p{L}\\p{N}])('+esc(term)+')(?![\\p{L}\\p{N}])','giu');

export function extractMedicalEntities(text){
 const t=normalizePersian(text),entities=[];
 for(const[type,vals]of Object.entries(LEX)){
  for(const raw of vals){
   const term=normalizePersian(raw),re=termRegex(term);
   for(const m of t.matchAll(re))entities.push({type,value:m[1],start:m.index||0,end:(m.index||0)+m[1].length});
  }
 }
 const dose=/(?<![\p{L}\p{N}])(\d+(?:[./]\d+)?\s*(?:میلی ?گرم|mg|گرم|g|واحد|unit|سی ?سی|ml))(?![\p{L}\p{N}])/giu;
 for(const m of t.matchAll(dose))entities.push({type:'dose',value:m[1],start:m.index||0,end:(m.index||0)+m[1].length});
 return entities.sort((a,b)=>a.start-b.start);
}
export const MEDICAL_LEXICON_VERSION='fa-medical-lexicon-0.2.0';
