import unittest,sys
from pathlib import Path
sys.path.insert(0,str(Path(__file__).resolve().parents[1]))
from app.engine import analyze
from app.normalizer import normalize_fa

class TestEngine(unittest.TestCase):
 def test_normalize(self):
  self.assertEqual(normalize_fa("مي روم  ۱۲"),"می روم 12")
 def test_sampler_score_and_evidence(self):
  t="سلام وقت بخیر من نمونه گیر روبرا هستم. فردا ساعت 8 تا 9 خدمت می رسم، لطفا آدرس خیابان آزادی کوچه یک پلاک 2 را تایید کنید. قبل از رسیدن تماس می گیرم. ناشتا باشید و آب ساده مجاز است. سوالی دارید؟ پس هماهنگ شد ممنون."
  r=analyze(t,"sampler");self.assertGreater(r["qc"]["conversationScore"],70);self.assertTrue(any(x["ruleId"]=="C03" and x["status"]=="pass" for x in r["qc"]["findings"]))
 def test_physician_review_required(self):
  t="سلام من پزشک دکترساینا هستم. با خود بیمار صحبت می کنم؟ چه دارویی مصرف می کنید و دوز چند میلی گرم است؟ از چه زمانی علائم شروع شده و سابقه بیماری دارید؟"
  r=analyze(t,"physician");self.assertEqual(r["qc"]["scoreStatus"],"review_required");self.assertIn("metadata_rules_pending",r["qc"]["reviewGates"])
 def test_voc(self):
  r=analyze("از تاخیر جواب آزمایش خیلی ناراضی هستم و هنوز نتیجه نیامده","voc");self.assertEqual(r["qc"]["satisfaction"],"dissatisfied");self.assertTrue(any(x["code"]=="result_delay" for x in r["qc"]["topics"]))
 def test_medical_entities(self):
  r=analyze("متفورمین 500 مصرف می کنم و دیابت دارم. آزمایش HbA1c هم دادم.","physician");self.assertTrue(r["entities"]["medications"]);self.assertTrue(r["entities"]["diseases"]);self.assertTrue(r["entities"]["labTests"])
if __name__=="__main__":
 unittest.main()
