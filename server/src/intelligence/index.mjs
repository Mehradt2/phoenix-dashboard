import{normalizePersian,textQuality}from'./persian.mjs';
import{extractMedicalEntities,MEDICAL_LEXICON_VERSION}from'./medicalLexicon.mjs';
import{evaluateSampler}from'./samplerEngine.mjs';
import{evaluatePhysician}from'./physicianEngine.mjs';
import{evaluateVoc}from'./vocEngine.mjs';

export const INTELLIGENCE_VERSION='fa-text-intelligence-0.1.0';

export function analyzeTranscript({domain,transcript,metadata={}}){
 if(!['sampler','physician','voc'].includes(domain))throw new Error('unsupported_domain');
 const normalized=normalizePersian(transcript),quality=textQuality(normalized),entities=extractMedicalEntities(normalized);
 const analysis=domain==='sampler'?evaluateSampler(normalized):domain==='physician'?evaluatePhysician(normalized,{...metadata,asrConfidence:metadata.asrConfidence}):evaluateVoc(normalized);
 return{version:INTELLIGENCE_VERSION,domain,normalizedTranscript:normalized,textQuality:quality,medicalEntities:entities,medicalLexiconVersion:MEDICAL_LEXICON_VERSION,analysis};
}
