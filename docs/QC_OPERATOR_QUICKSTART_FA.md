# راهنمای سریع اپراتور QC

## آدرس فعلی
`https://mehradt2.github.io/phoenix-dashboard/`

## شروع کار
1. URL را در Chrome/Edge باز کنید.
2. برای مرورگر خود Passphrase حداقل ۱۲ کاراکتر بسازید.
3. حوزه «پزشکان» یا «نمونه‌گیران» را انتخاب کنید.
4. وارد «ورودی مکالمات» شوید.
5. فایل صوتی و نام فرد را وارد کنید.
6. Batch را اجرا کنید.
7. پس از STT/QC، از «صف بررسی» پرونده را باز کنید.
8. Evidence هر Rule را بررسی کنید.
9. Critical Rule را بدون Evidence Override تأیید نکنید.
10. Review Note را ثبت کنید.

## قواعد داده
- Audio خام در Browser پردازش می‌شود.
- فایل صوتی به Backend Cloud ارسال نمی‌شود.
- در Browser Local، Transcript/Case در Vault همان مرورگر ذخیره می‌شود.
- Passphrase قابل بازیابی نیست.
- قبل از پاک‌کردن Browser data، Backup بگیرید.

## نقش Human Review
AI و Rule Engine پیشنهاد می‌دهند؛ Reviewer تصمیم نهایی را با Evidence می‌گیرد.

## اگر Whisper آماده نیست
«AI و مدل‌ها» → پروفایل Standard → «آماده‌سازی و Cache مدل».

## اگر مرورگر ضعیف است
Standard / Whisper Small را استفاده کنید. High Quality فقط Candidate است.

## مشکلات متداول
### صفحه سفید
Hard refresh و بازکردن URL release فعلی؛ اگر Runtime Recovery دیده شد، متن خطا ثبت شود.
### Storage blocked
Incognito/Privacy extension را بررسی کنید.
### فایل تکراری
سیستم SHA256 Duplicate Guard دارد؛ فایل قبلاً پردازش شده است.
### Transcript ضعیف
امتیاز را قطعی نکنید؛ Review دستی یا Transcript اصلاح‌شده استفاده شود.
