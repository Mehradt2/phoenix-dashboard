import fs from'node:fs';
const a=fs.readFileSync('src/asr.ts','utf8'),v=fs.readFileSync('src/vault.ts','utf8'),m=fs.readFileSync('src/modelPolicy.ts','utf8'),q=fs.readFileSync('src/qcEngine.ts','utf8'),p=fs.readFileSync('src/physicianQcEngine.ts','utf8'),op=fs.readFileSync('src/operationalPolicy.ts','utf8'),l=fs.readFileSync('src/localAi.ts','utf8'),ui=fs.readFileSync('src/main.tsx','utf8'),sr=fs.readFileSync('src/samplerRegistry.ts','utf8'),api=fs.readFileSync('server/src/index.mjs','utf8');
const all=a+m+l;
const requiredDocs=['docs/00_INDEX_FA.md','docs/PRODUCT_ARCHITECTURE_FA.md','docs/DOCKER_TEAM_RUNBOOK_FA.md','docs/DATABASE_SCHEMA_FA.md','docs/API_CONTRACT_FA.md','docs/SECURITY_PRIVACY_FA.md','docs/RECOVERY_DR_FA.md','docs/OBSERVABILITY_SRE_FA.md','docs/KNOWLEDGE_BASE_OPERATIONS_FA.md','knowledge/PROJECT_KNOWLEDGE.json','docker-compose.yml','.env.example'];
const docsPresent=requiredDocs.every(x=>fs.existsSync(x));
const c={
 noPaid:!/(OPENAI_API_KEY|HF_TOKEN|api\.openai\.com|Authorization:\s*Bearer)/.test(all),
 audioLocal:/decode16k/.test(a),
 encryptedVault:/AES-GCM/.test(v)&&/PBKDF2/.test(v),
 appendOnlyAudit:/AUDIT='audit'/.test(v)&&/review_submitted/.test(v),
 models:/whisper-tiny/.test(m)&&/whisper-small/.test(m)&&/whisper-large-v3-turbo/.test(m),
 noToken:/authRequired:false/.test(m)&&/subscriptionRequired:false/.test(m),
 autoStable:/shader-f16/.test(m)&&/مدل Tiny q8/.test(m)&&/whisper-tiny/.test(a)&&/webgpuF16/.test(a),
 batch:/slice\(0,100\)/.test(ui),
 samplerQC:/sampler-conversation-qc-1\.1\.0/.test(q)&&/criticalFailures/.test(q)&&/scoreWorkflow/.test(q),
 physicianQC:/physician-qc-2\.0\.0/.test(p)&&/PVQ-026/.test(p)&&/PVQ-040/.test(p)&&/DOC-009/.test(p)&&/ParticipantState/.test(p)&&/scorePhysicianWorkflow/.test(p),
 localCopilot:/Qwen2\.5-0\.5B-Instruct/.test(l)&&/حق تغییر امتیاز QC را ندارد/.test(l),
 multiDomain:/پزشکان/.test(ui)&&/نمونه‌گیران/.test(ui)&&/گزارش مدیریتی/.test(ui),
 operationalPolicy:/PH-OPS-01/.test(op)&&/SA-OPS-01/.test(op)&&/۱۵۰ دقیقه/.test(op)&&/۲۰ ثانیه/.test(op),
 docsAndDocker:docsPresent,
 samplerDirectory:/شایان مؤمن زاده/.test(sr)&&/محمد محمدپور حسنوند/.test(sr)&&/ACTIVE_SAMPLERS/.test(sr)&&/persianMonthKey/.test(sr),
 samplerDateReporting:/occurredAt/.test(ui)&&/ماه شمسی/.test(ui)&&/جزئیات مکالمات/.test(ui)&&/PersianDate/.test(ui),
 samplerTeamPersistence:fs.existsSync('server/migrations/002_sampler_registry_case_date.sql')&&/\/api\/samplers/.test(api)&&/occurred_at/.test(api),
 repositoryAdapter:fs.existsSync('src/repository.ts')&&fs.existsSync('server/migrations/001_init.sql')
};
console.log(c);if(!Object.values(c).every(Boolean))process.exit(1);
