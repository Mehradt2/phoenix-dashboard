# Recovery / Disaster Recovery

## اهداف
- بازیابی تیمی بدون وابستگی به یک Provider.
- RPO اولیه پیشنهادی: 24h.
- RTO اولیه پیشنهادی: 2h.
این مقادیر تا تأیید عملیات/SRE Candidate هستند.

## Backup
`ops/backup.sh`
- pg_dump custom format
- SHA256 کنار فایل
- نام Timestamped

حداقل نگهداری پیشنهادی Pilot:
- 7 نسخه روزانه
- 4 نسخه هفتگی
- 3 نسخه ماهانه

## Restore
`ops/restore.sh <file.dump>`
Restore باید اول روی Host تستی اجرا شود.

## Clean-host drill
1. Host جدید.
2. Clone repository.
3. checkout SHA release.
4. .env/Secrets جدید.
5. docker compose up db.
6. restore dump.
7. migrations.
8. api/web.
9. smoke.
10. login/review/audit functional check.

## Provider migration
چون Runtime Docker است:
- DNS را به Host جدید ببرید.
- Caddy TLS را مجدد می‌گیرد.
- هیچ Business Logic به Provider وابسته نیست.

## Browser-local recovery
Export encrypted backup از UI.
Passphrase برای decrypt ضروری است و Server آن را نمی‌داند.

## شواهد مورد نیاز Production
- Backup checksum PASS
- Clean restore PASS
- Case count parity
- Review count parity
- Audit count parity
- Login works
- Latest Rule Pack readable
