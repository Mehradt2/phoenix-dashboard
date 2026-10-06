import unittest
from app.main import normalize_fa,extract_entities,voc_analysis

class TestCore(unittest.TestCase):
 def test_normalize(self):
  self.assertEqual(normalize_fa("متفورمين ۵۰۰  ميلي گرم"),"متفورمین 500 میلی گرم")
 def test_medical_entity(self):
  xs=extract_entities(normalize_fa("بیمار متفورمین 500 میلی گرم مصرف می کند و دیابت دارد"))
  self.assertTrue(any(x.type=="drug" and "متفورمین" in x.text for x in xs))
  self.assertTrue(any(x.type=="disease" and "دیابت" in x.text for x in xs))
 def test_negation(self):
  xs=extract_entities(normalize_fa("بیمار دیابت ندارد"))
  self.assertTrue(any(x.type=="disease" and x.negated for x in xs))
 def test_voc(self):
  x=voc_analysis(normalize_fa("نمونه گیر خیلی دیر آمد و من ناراضی هستم"))
  self.assertEqual(x["topic"],"sampler_delay")
  self.assertEqual(x["satisfaction"],"dissatisfied")

if __name__=="__main__": unittest.main()
