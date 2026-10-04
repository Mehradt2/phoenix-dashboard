import re
try:
    from hazm import Normalizer as HazmNormalizer
    _hazm=HazmNormalizer()
except Exception:
    _hazm=None

_ARABIC_MAP=str.maketrans({"ي":"ی","ى":"ی","ك":"ک","ۀ":"ه","ة":"ه","ؤ":"و","إ":"ا","أ":"ا"})
_DIGITS=str.maketrans("۰۱۲۳۴۵۶۷۸۹٠١٢٣٤٥٦٧٨٩","01234567890123456789")

def normalize_fa(text:str)->str:
    text=(text or "").translate(_ARABIC_MAP).translate(_DIGITS)
    text=text.replace("\u200c"," ").replace("\u200f"," ").replace("\ufeff"," ")
    text=re.sub(r"[ـ]+","",text)
    if _hazm:
        try:
            text=_hazm.normalize(text)
        except Exception:
            pass
    text=re.sub(r"\s+"," ",text).strip()
    return text

def sentences(text:str)->list[str]:
    x=normalize_fa(text)
    return [p.strip() for p in re.split(r"(?<=[.!؟?])\s+|[\n\r]+",x) if p.strip()]

def excerpt(text:str,start:int,end:int,window:int=55)->str:
    return text[max(0,start-window):min(len(text),end+window)].strip()
