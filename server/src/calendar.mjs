// Dependency-free Jalali/Gregorian conversion adapted from the public jalaali-js algorithm.
function div(a,b){return ~~(a/b)}
function mod(a,b){return a-~~(a/b)*b}
function jalCal(jy){
 const breaks=[-61,9,38,199,426,686,756,818,1111,1181,1210,1635,2060,2097,2192,2262,2324,2394,2456,3178];let bl=breaks.length,gy=jy+621,leapJ=-14,jp=breaks[0],jm,jump,n,i;
 if(jy<jp||jy>=breaks[bl-1])throw new Error('invalid_jalali_year');
 for(i=1;i<bl;i++){jm=breaks[i];jump=jm-jp;if(jy<jm)break;leapJ+=div(jump,33)*8+div(mod(jump,33),4);jp=jm}
 n=jy-jp;leapJ+=div(n,33)*8+div(mod(n,33)+3,4);if(mod(jump,33)===4&&jump-n===4)leapJ++;
 const leapG=div(gy,4)-div((div(gy,100)+1)*3,4)-150, march=20+leapJ-leapG;
 if(jump-n<6)n=n-jump+div(jump+4,33)*33;let leap=mod(mod(n+1,33)-1,4);if(leap===-1)leap=4;return{leap,gy,march}
}
function g2d(gy,gm,gd){let d=div((gy+div(gm-8,6)+100100)*1461,4)+div(153*mod(gm+9,12)+2,5)+gd-34840408;d=d-div(div(gy+100100+div(gm-8,6),100)*3,4)+752;return d}
function d2g(jdn){let j=4*jdn+139361631;j=j+div(div(4*jdn+183187720,146097)*3,4)*4-3908;const i=div(mod(j,1461),4)*5+308,gd=div(mod(i,153),5)+1,gm=mod(div(i,153),12)+1,gy=div(j,1461)-100100+div(8-gm,6);return{gy,gm,gd}}
function j2d(jy,jm,jd){const r=jalCal(jy);return g2d(r.gy,3,r.march)+(jm-1)*31-div(jm,7)*(jm-7)+jd-1}
export function jalaliToGregorian(jy,jm,jd){return d2g(j2d(jy,jm,jd))}
export function parseDateInput(value,calendar='gregorian'){
 if(!value)return null;const m=String(value).trim().match(/^(\d{4})[-\/]?(\d{1,2})[-\/]?(\d{1,2})$/);if(!m)throw new Error('invalid_date_format');
 let y=Number(m[1]),mo=Number(m[2]),d=Number(m[3]);if(calendar==='jalali'){const g=jalaliToGregorian(y,mo,d);y=g.gy;mo=g.gm;d=g.gd}
 const dt=new Date(Date.UTC(y,mo-1,d));if(Number.isNaN(dt.getTime()))throw new Error('invalid_date');return dt.toISOString().slice(0,10)
}
export function dualDate(value){const d=new Date(value);return{gregorian:d.toISOString().slice(0,10),jalali:new Intl.DateTimeFormat('fa-IR-u-ca-persian',{year:'numeric',month:'2-digit',day:'2-digit'}).format(d)}}
