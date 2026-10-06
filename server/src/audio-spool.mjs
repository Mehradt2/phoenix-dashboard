import fs from'node:fs/promises';
import path from'node:path';
import{createCipheriv,createDecipheriv,randomBytes}from'node:crypto';

const DIR=process.env.AUDIO_SPOOL_DIR||'/var/lib/kuleposhti/spool';
function key(){const raw=process.env.DATA_ENCRYPTION_KEY||'';const b=Buffer.from(raw,'base64');if(b.length!==32)throw new Error('DATA_ENCRYPTION_KEY must be a base64 encoded 32-byte key');return b}
export async function ensureSpool(){await fs.mkdir(DIR,{recursive:true,mode:0o700});return DIR}
export async function writeEncryptedAudio(id,buffer){
 await ensureSpool();const iv=randomBytes(12),cipher=createCipheriv('aes-256-gcm',key(),iv),enc=Buffer.concat([cipher.update(buffer),cipher.final()]),tag=cipher.getAuthTag(),blob=Buffer.concat([Buffer.from([1]),iv,enc,tag]),file=path.join(DIR,id+'.kpa');
 await fs.writeFile(file,blob,{mode:0o600});return file
}
export async function readEncryptedAudio(file){
 const blob=await fs.readFile(file);if(blob[0]!==1)throw new Error('unsupported_audio_spool_version');const iv=blob.subarray(1,13),tag=blob.subarray(blob.length-16),enc=blob.subarray(13,blob.length-16),dec=createDecipheriv('aes-256-gcm',key(),iv);dec.setAuthTag(tag);return Buffer.concat([dec.update(enc),dec.final()])
}
export async function removeSpool(file){if(!file)return;await fs.unlink(file).catch(()=>{})}
export function spoolDir(){return DIR}
