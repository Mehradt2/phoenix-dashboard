import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const LEXICON_PATH = process.env.KULEPOSHTI_LEXICON_PATH || path.resolve(__dirname, '../../knowledge/PERSIAN_MEDICAL_LEXICON_v1.0.0.json');
let lexiconCache = null;

export function loadLexicon() {
  if (!lexiconCache) lexiconCache = JSON.parse(fs.readFileSync(LEXICON_PATH, 'utf8'));
  return lexiconCache;
}

const FA_DIGITS = '۰۱۲۳۴۵۶۷۸۹';
const AR_DIGITS = '٠١٢٣٤٥٦٧٨٩';

export function normalizeFa(input = '') {
  return String(input || '').normalize('NFKC')
    .replace(/[\u064B-\u065F\u0670\u06D6-\u06ED]/g, '')
    .replace(/[يى]/g, 'ی').replace(/ك/g, 'ک').replace(/[ۀة]/g, 'ه')
    .replace(/ؤ/g, 'و').replace(/[إأٱ]/g, 'ا')
    .replace(/[‌ـ]/g, ' ')
    .replace(/[۰-۹]/g, d => String(FA_DIGITS.indexOf(d)))
    .replace(/[٠-٩]/g, d => String(AR_DIGITS.indexOf(d)))
    .replace(/[“”«»]/g, '"').replace(/[،؛]/g, ' ')
    .replace(/\s+/g, ' ').trim().toLowerCase();
}

function tokensWithPos(text) {
  const out = [];
  const re = /[\p{L}\p{N}_+-]+/gu;
  let m;
  while ((m = re.exec(text))) out.push({ t: m[0], start: m.index, end: m.index + m[0].length });
  return out;
}

function levenshtein(a, b) {
  const m = a.length, n = b.length, row = Array.from({ length: n + 1 }, (_, i) => i);
  for (let i = 1; i <= m; i++) {
    let prev = row[0]; row[0] = i;
    for (let j = 1; j <= n; j++) {
      const old = row[j], cost = a[i - 1] === b[j - 1] ? 0 : 1;
      row[j] = Math.min(row[j] + 1, row[j - 1] + 1, prev + cost);
      prev = old;
    }
  }
  return row[n];
}

function contextWindow(text, start, end, left = 50, right = 75) {
  return text.slice(Math.max(0, start - left), Math.min(text.length, end + right)).trim();
}

function isNegated(text, start, end) {
  const left = text.slice(Math.max(0, start - 52), start);
  const right = text.slice(end, Math.min(text.length, end + 24));
  return /(ندارم|ندارد|نداره|نیست|نبوده|نمی ?کنم|نمی ?کند|عدم|منفی|فاقد|نه )/.test(left) ||
         /(وجود ندارد|ندارم|نداره)/.test(right);
}

function experiencer(text, start, end) {
  const w = contextWindow(text, start, end, 65, 45);
  if (/(مادرم|پدرم|همسرم|خواهرم|برادرم|مادرش|پدرش|همسرش|بیمارمون|همراه)/.test(w)) return 'other';
  if (/(دارم|داشتم|مصرف می ?کنم|برای من|خودم)/.test(w)) return 'patient';
  return 'unknown';
}

function findAlias(text, alias) {
  const a = normalizeFa(alias);
  const exact = text.indexOf(a);
  if (exact >= 0) return { start: exact, end: exact + a.length, mention: text.slice(exact, exact + a.length), confidence: .98, method: 'exact' };
  if (!a.includes(' ') && a.length >= 5) {
    for (const x of tokensWithPos(text)) {
      if (Math.abs(x.t.length - a.length) <= 1 && levenshtein(x.t, a) <= 1)
        return { start: x.start, end: x.end, mention: x.t, confidence: .82, method: 'fuzzy1' };
    }
  }
  return null;
}

export function extractEntities(input) {
  const text = normalizeFa(input), lex = loadLexicon(), out = [], seen = new Set();
  for (const entity of lex.entities) {
    for (const alias of entity.aliases) {
      const m = findAlias(text, alias);
      if (!m) continue;
      const key = entity.type + '|' + entity.canonical + '|' + m.start;
      if (seen.has(key)) continue;
      seen.add(key);
      out.push({
        type: entity.type,
        canonical: entity.canonical,
        label: entity.fa,
        mention: m.mention,
        start: m.start,
        end: m.end,
        confidence: m.confidence,
        matchMethod: m.method,
        negated: isNegated(text, m.start, m.end),
        experiencer: experiencer(text, m.start, m.end),
        evidence: contextWindow(text, m.start, m.end)
      });
      break;
    }
  }
  return out.sort((a, b) => a.start - b.start);
}

function hit(text, patterns) {
  const excerpts = [];
  for (const p of patterns) {
    const m = text.match(p);
    if (m) {
      const i = m.index || 0;
      excerpts.push(contextWindow(text, i, i + m[0].length));
    }
  }
  return [...new Set(excerpts)].slice(0, 3);
}

function finding(id, label, weight, status, evidence = [], severity = 'major', source = 'transcript', reason = '') {
  return {
    id, ruleId: id, label, weight, status,
    matched: status === 'pass',
    confidence: status === 'pass' ? .92 : status === 'fail' ? .94 : status === 'partial' ? .65 : .25,
    severity,
    critical: severity === 'critical',
    source,
    evidence,
    excerpts: evidence,
    reason
  };
}

function speakerRoleState(segments = []) {
  if (!Array.isArray(segments) || !segments.length) return 'unknown';
  const roles = new Set(segments.map(s => String(s.role || s.speakerRole || '').toLowerCase()).filter(Boolean));
  return roles.has('doctor') || roles.has('physician') ? 'resolved' : 'unknown';
}

function scoreFindings(findings) {
  const scored = findings.filter(x => x.weight > 0 && ['pass', 'fail', 'partial'].includes(x.status));
  const denom = scored.reduce((s, x) => s + x.weight, 0);
  const earned = scored.reduce((s, x) => s + x.weight * (x.status === 'pass' ? 1 : x.status === 'partial' ? .5 : 0), 0);
  return {
    score: denom ? Math.round(earned / denom * 1000) / 10 : null,
    criticalFailures: findings.filter(x => x.critical && x.status === 'fail').map(x => x.id),
    reviewGates: findings.filter(x => x.status === 'review').map(x => x.id)
  };
}

export function textQuality(input) {
  const text = normalizeFa(input);
  const tokens = text ? text.split(/\s+/).filter(Boolean) : [];
  const faChars = (text.match(/[\u0600-\u06FF]/g) || []).length;
  const letters = (text.match(/[\p{L}]/gu) || []).length;
  return {
    charCount: text.length,
    tokenCount: tokens.length,
    persianLetterRatio: letters ? Number((faChars / letters).toFixed(3)) : 0,
    insufficient: text.length < 24 || tokens.length < 5
  };
}

export function analyzePhysician(input, options = {}) {
  const text = normalizeFa(input);
  const { segments = [], durationSeconds = 0, workflow = {} } = options;
  const entities = extractEntities(text), warnings = [], findings = [], quality = textQuality(text);

  if (workflow.visitOutcome === 'no_answer' || (!text && durationSeconds > 0)) {
    return {
      domain: 'physician', version: 'text-core-3.0.0', scoreStatus: 'non_scorable',
      conversationScore: null, coverage: 100, risk: 'low', requiresHumanReview: true,
      criticalFailures: [], reviewGates: [],
      findings: [finding('PVQ-026', 'No Answer / Non-scorable', 0, 'pass', ['workflow:no_answer'], 'info', 'workflow', 'No Answer از امتیاز پزشک خارج است.')],
      entities, quality, warnings: ['No Answer؛ امتیاز کیفیت پزشکی ساخته نشد.'],
      signals: { speakerRole: 'unknown', medications: [], conditions: [], tests: [], prep: [] }
    };
  }

  if (quality.insufficient) {
    return {
      domain: 'physician', version: 'text-core-3.0.0', scoreStatus: 'review_required',
      conversationScore: null, coverage: 0, risk: 'critical', requiresHumanReview: true,
      criticalFailures: [], reviewGates: ['TRANSCRIPT_INSUFFICIENT'], findings: [], entities, quality,
      warnings: ['Transcript برای امتیازدهی کافی نیست.'],
      signals: { speakerRole: speakerRoleState(segments), medications: [], conditions: [], tests: [], prep: [] }
    };
  }

  const identityEv = hit(text, [/(خودتون بیمار|خود بیمار|با خود بیمار|اسم و فامیل|تاریخ تولد|کد ملی|شما .* هستید)/]);
  if (workflow.identityVerified === 'yes')
    findings.push(finding('PVQ-027', 'حضور بیمار هدف و احراز هویت', 15, 'pass', identityEv.length ? identityEv : ['workflow:identityVerified=yes'], 'major', 'mixed', 'احراز هویت با Evidence ساختاریافته تأیید شده است.'));
  else if (workflow.identityVerified === 'no')
    findings.push(finding('PVQ-027', 'حضور بیمار هدف و احراز هویت', 15, 'fail', identityEv, 'major', 'mixed', 'احراز هویت رد شده است.'));
  else
    findings.push(finding('PVQ-027', 'حضور بیمار هدف و احراز هویت', 15, identityEv.length ? 'partial' : 'review', identityEv, 'major', 'transcript', 'Transcript به‌تنهایی برای احراز قطعی کافی نیست.'));

  const companionEv = hit(text, [/(همسر|مادر|پدر|خواهر|برادر|دختر|پسر|همراه|مراقب|پرستار)/]);
  const adultCompanion = workflow.patientAgeGroup === 'adult' && workflow.participantState === 'companion_unverified';
  const companionStatus = adultCompanion ? 'fail' :
    ['patient_direct', 'authorized_caregiver', 'guardian_minor'].includes(workflow.participantState) ? 'pass' :
    companionEv.length ? 'review' : 'review';
  findings.push(finding('PVQ-029', 'ویزیت بیمار بالغ با همراه فاقد احراز اختیار', 30, companionStatus, companionEv, adultCompanion ? 'critical' : 'review', 'mixed', adultCompanion ? 'Critical: همراه بدون اختیار تأییدشده است.' : 'Participant State نیازمند Evidence ساختاریافته است.'));

  const brandEntities = entities.filter(x => x.type === 'brand' && !x.negated);
  const heardBrand = brandEntities[0]?.canonical || null, expectedBrand = workflow.expectedBrand;
  let brandStatus = 'review';
  if (expectedBrand && !['unknown', 'not_applicable'].includes(expectedBrand))
    brandStatus = heardBrand === expectedBrand ? 'pass' : heardBrand ? 'fail' : 'review';
  else if (expectedBrand === 'not_applicable') brandStatus = 'pass';
  findings.push(finding('PVQ-030', 'معرفی برند منطبق با Case', 10, brandStatus, brandEntities.map(x => x.evidence), 'major', 'mixed', heardBrand ? 'Brand شنیده‌شده: ' + heardBrand : 'Brand قابل اتکا پیدا نشد.'));

  const medications = entities.filter(x => ['drug', 'drug_class'].includes(x.type) && !x.negated);
  const doseEv = hit(text, [/(\d+\s*(میلی ?گرم|mg|واحد)|روزی\s*(یک|دو|سه)|صبح و شب|هر \d+ ساعت|دوز)/i]);
  let medStatus = 'pass';
  if (medications.length && workflow.medicationDoseStatus === 'incomplete') medStatus = 'fail';
  else if (medications.length && workflow.medicationDoseStatus === 'complete') medStatus = 'pass';
  else if (medications.length && !doseEv.length) medStatus = 'partial';
  findings.push(finding('PVQ-034', 'ثبت دارو و دوز لازم', 15, medStatus, [...medications.map(x => x.evidence), ...doseEv], 'major', 'mixed', medications.length ? (doseEv.length ? 'دارو و نشانه دوز یافت شد.' : 'دارو یافت شد؛ دوز نیازمند Review است.') : 'داروی فعالی در Transcript شناسایی نشد.'));

  const conditions = entities.filter(x => x.type === 'condition' && !x.negated);
  const historyEv = hit(text, [/(سابقه|بیماری زمینه|عمل|جراحی|دارو|تشنج|دیابت|فشار خون|قلب|تیروئید|بارداری|قاعدگی|اضافه وزن|چاقی)/]);
  const prep = entities.filter(x => x.type === 'prep' && !x.negated);
  const prepEv = hit(text, [/(ناشتا|ناشتایی|آب ساده|چای|قهوه|شرایط آزمایش|شرایط تست)/]);
  const histStatus = workflow.clinicalHistoryComplete === 'yes' ? 'pass' :
    workflow.clinicalHistoryComplete === 'no' ? 'fail' :
    historyEv.length && conditions.length ? 'pass' : historyEv.length ? 'partial' : 'review';
  findings.push(finding('PVQ-035', 'کامل بودن شرح حال ساختاریافته و آمادگی آزمایش', 20, histStatus, [...historyEv, ...conditions.map(x => x.evidence), ...prep.map(x => x.evidence), ...prepEv], 'major', 'mixed', 'کامل بودن نهایی شرح حال باید با نوع Case تطبیق داده شود.'));

  const questionEv = hit(text, [/(سوالی دارید|سوال دیگه|پرسشی دارید|ابهامی|چیزی هست که|نکته دیگه)/]);
  findings.push(finding('PVQ-COM-01', 'فرصت سؤال و رفع ابهام', 10, questionEv.length ? 'pass' : 'partial', questionEv, 'minor', 'transcript', questionEv.length ? 'فرصت سؤال شناسایی شد.' : 'فرصت سؤال صریح پیدا نشد.'));

  const empathyEv = hit(text, [/(نگران نباشید|متوجه ام|درک می کنم|حق دارید|خیالتون راحت|اطمینان|خواهش می کنم|ممنون)/]);
  findings.push(finding('PVQ-COM-02', 'احترام، اطمینان و همدلی', 10, empathyEv.length ? 'pass' : 'partial', empathyEv, 'minor', 'transcript', empathyEv.length ? 'Evidence ارتباطی مثبت یافت شد.' : 'Evidence صریح همدلی محدود است.'));

  const closeEv = hit(text, [/(پس قرار شد|جمع بندی|مرحله بعد|ممنون از شما|خداحافظ|روز خوبی|شب بخیر)/]);
  findings.push(finding('PVQ-COM-03', 'جمع‌بندی و پایان حرفه‌ای', 5, closeEv.length ? 'pass' : 'partial', closeEv, 'minor', 'transcript', 'پایان تماس از متن بررسی شد.'));

  const role = speakerRoleState(segments);
  findings.push(finding('PVQ-039', 'Speaker Role Resolution Gate', 0, role === 'resolved' ? 'pass' : 'review', [], role === 'resolved' ? 'info' : 'review', 'metadata', role === 'resolved' ? 'Speaker role از STT مشخص است.' : 'Speaker role از Oganeson/Metadata کافی نیست.'));

  const certaintyEv = hit(text, [/(قطعا|قطعاً|حتما|حتماً|صد در صد|صددرصد|مطمئنم که)/]);
  const certaintyStatus = workflow.unsupportedMedicalCertainty === 'yes' ? 'review' : certaintyEv.length ? 'review' : 'pass';
  findings.push(finding('PVQ-038', 'قطعیت پزشکی بدون پشتوانه', 0, certaintyStatus, certaintyEv, 'review', 'mixed', 'این Rule بدون Medical SME Auto-fail نمی‌شود.'));

  const scored = scoreFindings(findings);
  const coverage = Math.min(100, Math.round(findings.filter(x => x.weight > 0 && x.status !== 'review').reduce((s, x) => s + x.weight, 0)));
  let conversationScore = scored.score;
  if (coverage < 55) conversationScore = null;
  const risk = scored.criticalFailures.length ? 'critical' : conversationScore == null ? 'high' : conversationScore < 70 ? 'medium' : 'low';

  if (durationSeconds > 0 && durationSeconds < 20) warnings.push('تماس کمتر از ۲۰ ثانیه: در سطح دوره‌ای Neutral/Investigate.');
  if (durationSeconds > 0 && durationSeconds < 480) warnings.push('تماس کمتر از ۸ دقیقه است؛ به‌تنهایی Fail پزشکی نیست.');

  return {
    domain: 'physician', version: 'text-core-3.0.0',
    scoreStatus: conversationScore == null ? 'review_required' : 'scored',
    conversationScore, coverage, risk, requiresHumanReview: true,
    criticalFailures: scored.criticalFailures, reviewGates: scored.reviewGates,
    findings, entities, quality, warnings,
    signals: {
      speakerRole: role,
      medications: medications.map(x => x.canonical),
      conditions: conditions.map(x => x.canonical),
      tests: entities.filter(x => x.type === 'lab_test' && !x.negated).map(x => x.canonical),
      prep: prep.map(x => x.canonical)
    }
  };
}

export function analyzeSampler(input, options = {}) {
  const text = normalizeFa(input), entities = extractEntities(text), findings = [], quality = textQuality(text);
  const { segments = [], durationSeconds = 0 } = options;
  if (quality.insufficient) return {
    domain: 'sampler', version: 'text-core-3.0.0', conversationScore: null, coverage: 0,
    risk: 'critical', requiresHumanReview: true, criticalFailures: ['TRANSCRIPT_INSUFFICIENT'],
    findings: [], entities, quality, warnings: ['Transcript ناکافی است.']
  };

  const rules = [
    ['C01','شروع حرفه‌ای و معرفی',8,false,[/(سلام|وقت بخیر|صبح بخیر|عصر بخیر|شب بخیر)/],[/(نمونه ?گیر|از طرف|دکترساینا|روبرا|هومکا|دکتر دکتر)/]],
    ['C02','تأیید مخاطب/هویت مناسب',9,false,[/(خودتون|شما هستید|با آقای|با خانم|بیمار|مراجع|برای شما)/],[]],
    ['C03','تأیید روز و بازه مراجعه',15,true,[/(فردا|امروز|صبح|ساعت|بازه|7\s*(تا|الی)\s*8|8\s*(تا|الی)\s*9|9\s*(تا|الی)\s*10|10\s*(تا|الی)\s*11)/],[/(تایید|هماهنگ|درسته|مناسبه|می رسم|خدمت)/]],
    ['C04','تأیید آدرس و جزئیات دسترسی',15,true,[/(ادرس|آدرس|لوکیشن|موقعیت)/],[/(خیابان|کوچه|پلاک|واحد|طبقه|زنگ|درب|ورودی|برج|بلوک)/]],
    ['C05','اعلام زمان تقریبی/تماس قبل رسیدن',10,false,[/(حدود|تقریبا|تقریباً|دقیقه|می رسم|رسیدن|قبل از رسیدن|تماس می گیرم)/],[]],
    ['C06','شرایط آمادگی و ناشتایی',20,true,[/(ناشتا|ناشتایی|غذا|صبحانه)/],[/(آب|چای|قهوه|دارو|قرص|سیگار|ادامس|آدامس|چند ساعت)/]],
    ['C07','فرصت سؤال و رفع ابهام',8,false,[/(سوالی|سوال|پرسشی|ابهامی|نکته ای|راهنمایی|سوال دیگه)/],[]],
    ['C08','جمع‌بندی و تأیید نهایی',8,false,[/(پس|بنابراین|هماهنگ شد|تایید می کنید|اوکی شد|فردا خدمت|ممنون از شما|درسته)/],[]],
    ['C09','لحن محترمانه و حرفه‌ای',7,false,[/(لطفا|ممنون|متشکرم|خواهش می کنم|زحمت|بفرمایید)/],[]]
  ];

  for (const rule of rules) {
    const [id,label,weight,critical,primary,support] = rule;
    const a = hit(text, primary), b = hit(text, support);
    const status = a.length && (!support.length || b.length) ? 'pass' : a.length ? 'partial' : 'fail';
    findings.push(finding(id, label, weight, status, [...a, ...b], critical ? 'critical' : 'minor', 'transcript', status === 'pass' ? 'Evidence کافی یافت شد.' : status === 'partial' ? 'Evidence ناقص است.' : 'Evidence یافت نشد.'));
  }

  const scored = scoreFindings(findings);
  const criticalFailures = findings.filter(x => x.critical && x.status !== 'pass').map(x => x.id);
  const risk = criticalFailures.length >= 2 ? 'critical' : criticalFailures.length === 1 ? 'high' : (scored.score || 0) < 70 ? 'medium' : 'low';
  return {
    domain: 'sampler', version: 'text-core-3.0.0', conversationScore: scored.score,
    coverage: Math.round(findings.filter(x => x.status === 'pass').reduce((s, x) => s + x.weight, 0)),
    risk, requiresHumanReview: true, criticalFailures, findings, entities, quality, warnings: [],
    signals: { speakerRole: speakerRoleState(segments), durationSeconds }
  };
}

function sentimentHits(text, words) {
  const out = [];
  for (const word of words) {
    const w = normalizeFa(word), idx = text.indexOf(w);
    if (idx < 0) continue;
    const left = text.slice(Math.max(0, idx - 25), idx);
    const negated = /(نیستم|نیست|نبود|نشد|نه |نمی)/.test(left);
    out.push({ word: w, start: idx, evidence: contextWindow(text, idx, idx + w.length), negated });
  }
  return out;
}

export function analyzeVoc(input, options = {}) {
  const text = normalizeFa(input), lex = loadLexicon(), entities = extractEntities(text), topicScores = [], quality = textQuality(text);
  for (const topic of lex.vocTopics.filter(x => x.id !== 'other')) {
    const evidence = [];
    for (const keyword of topic.keywords) {
      const k = normalizeFa(keyword), i = text.indexOf(k);
      if (i >= 0) evidence.push(contextWindow(text, i, i + k.length));
    }
    if (evidence.length) topicScores.push({ id: topic.id, label: topic.label, score: evidence.length, evidence: [...new Set(evidence)].slice(0, 3) });
  }
  topicScores.sort((a, b) => b.score - a.score);
  const topic = topicScores[0] || { id: 'other', label: 'سایر', score: 0, evidence: [] };

  const positive = sentimentHits(text, lex.satisfaction.positive), negative = sentimentHits(text, lex.satisfaction.negative);
  let raw = 0;
  for (const x of positive) raw += x.negated ? -1 : 1;
  for (const x of negative) raw += x.negated ? 1 : -1;
  const satisfaction = raw >= 2 ? 'satisfied' : raw <= -1 ? 'dissatisfied' : raw === 0 ? 'unknown' : 'neutral';
  const confidence = Math.min(.95, .45 + Math.abs(raw) * .12);

  const resolved = /(حل شد|برطرف شد|انجام شد|پیگیری شد|اوکی شد)/.test(text);
  const unresolved = /(هنوز|پیگیری نشده|جواب نگرفتم|حل نشده|برطرف نشده)/.test(text);
  const urgent = /(خونریزی شدید|بیهوش|تنگی نفس شدید|درد شدید قفسه سینه|تهدید|فحاشی شدید)/.test(text);

  return {
    domain: 'voc', version: 'text-core-3.0.0', userKey: options.userKey || null,
    conversationScore: null, coverage: quality.insufficient ? 30 : 100,
    risk: urgent ? 'critical' : satisfaction === 'dissatisfied' ? 'high' : 'low',
    requiresHumanReview: true, criticalFailures: urgent ? ['VOC_URGENT_REVIEW'] : [], findings: [],
    topic: { id: topic.id, label: topic.label, confidence: topic.score ? Math.min(.95, .6 + .08 * topic.score) : .2, candidates: topicScores.slice(0, 4) },
    satisfaction: { label: satisfaction, confidence: Number(confidence.toFixed(2)), positiveEvidence: positive.slice(0, 4), negativeEvidence: negative.slice(0, 4) },
    resolution: resolved && !unresolved ? 'resolved' : unresolved ? 'unresolved' : 'unknown',
    requiresUrgentHumanReview: urgent,
    entities, quality,
    evidence: [...topic.evidence, ...positive.map(x => x.evidence), ...negative.map(x => x.evidence)].slice(0, 8),
    warnings: quality.insufficient ? ['متن VOC کوتاه است؛ دسته‌بندی نیازمند Review است.'] : []
  };
}

export function analyzeText(domain, text, options = {}) {
  if (domain === 'physician') return analyzePhysician(text, options);
  if (domain === 'sampler') return analyzeSampler(text, options);
  if (domain === 'voc') return analyzeVoc(text, options);
  throw new Error('unsupported_domain');
}
