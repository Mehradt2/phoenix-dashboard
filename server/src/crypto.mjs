import{createCipheriv,createDecipheriv,createHash,randomBytes,scryptSync,timingSafeEqual}from'node:crypto';

function dataKey(){
 const raw=process.env.DATA_ENCRYPTION_KEY||'';
 let b;
 try{b=Buffer.from(raw,'base64')}catch{}
 if(!b||b.length!==32)throw new Error('DATA_ENCRYPTION_KEY must be a base64 encoded 32-byte key');
 return b;
}
export function encryptJson(value){
 const iv=randomBytes(12),cipher=createCipheriv('aes-256-gcm',dataKey(),iv),plain=Buffer.from(JSON.stringify(value),'utf8');
 const enc=Buffer.concat([cipher.update(plain),cipher.final()]),tag=cipher.getAuthTag();
 return{iv:iv.toString('base64'),cipher:Buffer.concat([enc,tag]).toString('base64')};
}
export function decryptJson(ivB64,cipherB64){
 const iv=Buffer.from(ivB64,'base64'),blob=Buffer.from(cipherB64,'base64'),tag=blob.subarray(blob.length-16),enc=blob.subarray(0,blob.length-16);
 const d=createDecipheriv('aes-256-gcm',dataKey(),iv);d.setAuthTag(tag);return JSON.parse(Buffer.concat([d.update(enc),d.final()]).toString('utf8'));
}
export function passwordRecord(password){
 if(typeof password!=='string'||password.length<12)throw new Error('password_too_short');
 const salt=randomBytes(16),hash=scryptSync(password,salt,64,{N:16384,r:8,p:1,maxmem:64*1024*1024});
 return{salt:salt.toString('base64'),hash:hash.toString('base64')};
}
export function verifyPassword(password,saltB64,hashB64){
 try{const salt=Buffer.from(saltB64,'base64'),expected=Buffer.from(hashB64,'base64'),actual=scryptSync(password,salt,expected.length,{N:16384,r:8,p:1,maxmem:64*1024*1024});return expected.length===actual.length&&timingSafeEqual(expected,actual)}catch{return false}
}
export const tokenHash=(token)=>createHash('sha256').update(token).digest('hex');
export const sha256=(value)=>createHash('sha256').update(value).digest('hex');
