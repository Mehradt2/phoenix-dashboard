import express from 'express';
import {runSelfTests} from './selftest.mjs';
const app=express();const port=Number(process.env.PORT||10000);const release='2.5.1-render-canary';const tests=runSelfTests();
app.disable('x-powered-by');
app.get('/healthz',(_q,r)=>r.status(tests.pass?200:503).json({ready:tests.pass,product:'KulePoshti',release,platform:'render',database:'external_pending',productionReady:false,selfTests:tests}));
app.get('/api/_healthcheck',(_q,r)=>r.status(tests.pass?200:503).json({message:tests.pass?'Success':'Degraded',release,productionPhase:'FINAL_PRODUCTION_EVIDENCE_AND_CUTOVER',productionReady:false,vitaminDDecisionGuard:tests.vitaminD,toneGuard:tests.tone}));
app.get('/api/capabilities',(_q,r)=>r.json({productIdentity:'کوله‌پشتی',release:'2.5.1',renderCanary:true,productionReady:false,postgresRuntime:false,windowsEvidencePending:true,goldAsrPending:true,securityUatPending:true}));
app.get('/',(_q,r)=>r.type('html').send(`<!doctype html><html lang="fa" dir="rtl"><meta charset="utf-8"><title>KulePoshti Render Canary</title><style>body{font-family:system-ui;background:#07111f;color:#eaf4ff;padding:40px;max-width:880px;margin:auto}.card{border:1px solid #24405e;border-radius:18px;padding:24px;background:#0c1a2b}code,a{color:#66e3ff}</style><div class="card"><h1>کوله‌پشتی — Render Canary</h1><p>Validation runtime مهاجرت از AppDeploy</p><p>Release: <code>${release}</code></p><p>Self-tests: <b>${tests.pass?'PASS':'FAIL'}</b></p><p>Production Ready: <b>NO</b></p><p><a href="/healthz">/healthz</a></p></div></html>`));
app.listen(port,'0.0.0.0',()=>console.log(JSON.stringify({event:'server_started',release,port,selfTests:tests})));
