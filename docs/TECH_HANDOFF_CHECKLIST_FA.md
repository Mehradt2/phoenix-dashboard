# چک‌لیست Handoff به تیم مهندسی و زیرساخت

## 1. Source
- [ ] Clone repo
- [ ] Checkout `kuleposhti-operational-web-v1`
- [ ] مطالعه `docs/00_INDEX_FA.md`
- [ ] بررسی `knowledge/PROJECT_KNOWLEDGE.json`

## 2. Frontend
- [ ] Node 22
- [ ] `npm install`
- [ ] `npm run check`
- [ ] `npm test`
- [ ] `npm run build`

## 3. Team Docker
- [ ] Docker Engine + Compose v2
- [ ] `.env.example → .env`
- [ ] Secrets جدید
- [ ] `docker compose build`
- [ ] DB migration
- [ ] API/Web health
- [ ] Login
- [ ] Reviewer flow
- [ ] Audit flow
- [ ] User RBAC

## 4. Database
- [ ] PostgreSQL 16
- [ ] migration history بررسی شود
- [ ] DB port public نباشد
- [ ] Backup baseline
- [ ] Restore drill
- [ ] Encryption key در Secret Store

## 5. Domain
- [ ] A/AAAA DNS
- [ ] Caddy TLS
- [ ] فقط 80/443 public
- [ ] HTTPS smoke
- [ ] HSTS
- [ ] Origin allowlist

## 6. Data integration
برای اتصال دیتابیس/CRM/Lab جدید Business Logic را تغییر ندهید.
Integration فقط از Repository/API adapter و migration نسخه‌دار انجام شود.

## 7. Rule governance
- [ ] Rule Pack version
- [ ] Owner
- [ ] Source document
- [ ] Effective date
- [ ] SHA256
- [ ] Calibration evidence
- [ ] Rollback version

## 8. AI
- [ ] No paid provider in critical path
- [ ] Audio raw not uploaded
- [ ] Gold evidence before model promotion
- [ ] Copilot cannot mutate score

## 9. Release
- [ ] CI validate PASS
- [ ] Docker integration PASS
- [ ] Browser E2E PASS
- [ ] Team E2E PASS
- [ ] Images pinned by SHA
- [ ] Docs updated
- [ ] Knowledge snapshot updated
