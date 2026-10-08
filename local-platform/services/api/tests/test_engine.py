from app.engine import analyze_case,vitamin_d
def test_no_answer():assert analyze_case("doctor","D1","تماس برقرار نشد")["score"] is None
def test_vitamin_two_sides():
    r=vitamin_d("پزشک: ویتامین D را اضافه می‌کنم. کاربر: باشه")
    assert r["agreement"] is False and r["registration"]=="committed_to_register"
def test_vitamin_registered():
    r=vitamin_d("پزشک: ویتامین D را در نسخه ثبت کردم. کاربر: بله انجام می‌دهم")
    assert r["agreement"] is True and r["registration"]=="registered" and r["external_verification"]=="not_available"
