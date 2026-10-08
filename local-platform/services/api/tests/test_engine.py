from app.engine import analyze_case,vitamin_d
def test_no_answer():
    assert analyze_case("doctor","D1","تماس برقرار نشد")["score"] is None
def test_vitamin_commit_without_explicit_test():
    r=vitamin_d("پزشک: ویتامین D را اضافه می‌کنم. کاربر: باشه")
    assert r["test_agreement"]=="yes" and r["test_agreement_level"]=="implicit"
    assert r["registration"]=="committed_to_register"
def test_vitamin_registered_and_test_agreed():
    r=vitamin_d("پزشک: ویتامین D را در نسخه ثبت کردم. کاربر: بله انجام می‌دهم")
    assert r["test_agreement"]=="yes"
    assert r["registration"]=="registered"
    assert r["external_verification"]=="not_available"
