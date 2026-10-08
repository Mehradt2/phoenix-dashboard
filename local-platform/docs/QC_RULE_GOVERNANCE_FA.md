# حکمرانی قواعد QC

هر Rule Pack دارای id، version، effective_from، owner، rationale، evidence، score impact، confidence و test cases است.

Doctor: Score باید explainable باشد و Evidence هر تغییر امتیاز قابل مشاهده باشد. No-answer score=null و بدون penalty.

Sampler: قواعد مستقل از پزشک است و نباید از Rule Pack پزشک ارث‌بری کند.

VOC: Topic و satisfaction جدا از QC Score نگهداری می‌شوند.

Vitamin D: mentioned، initiator، test_agreement، test_agreement_level، decision، committed_to_register، registered_as_said، external_verification.

registered_as_said فقط ادعای صریح داخل مکالمه است؛ اثبات ثبت واقعی نیازمند Integration مجاز با Prescription DB است.
