# Observability / SRE

## Health endpoints
- Web: `/healthz`
- API + DB: `/api/health`

## Logs
Docker:
```bash
docker compose logs -f --tail=200 api web db caddy
```

API نباید Transcript یا Password/Session token را Log کند.

## SLIهای اولیه
- Web availability
- API availability
- DB readiness
- Login success/error rate
- Case create success rate
- Review submit success rate
- Queue completion rate در Browser
- Median/P95 API latency
- Open Review backlog

## SLO Pilot پیشنهادی
- Team runtime availability ≥ 99.5% در ساعات کاری
- API P95 < 500ms برای metadata/review
- Case/Review write success ≥ 99.9%
- Backup daily success = 100%

این SLOها تا داده واقعی Pilot Candidate هستند.

## Alertهای ضروری
- /api/health down
- Disk >80%
- DB volume near capacity
- Backup missing >26h
- repeated login failures
- HTTP 5xx spike
- migration failure

## Release evidence
هر Release باید:
- source SHA
- Docker image digest
- migration list
- runtime smoke
- public/team URL
- known risks
را ثبت کند.
