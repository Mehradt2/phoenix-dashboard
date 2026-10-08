import os,requests
class OgasonClient:
    def __init__(self):
        self.base=os.getenv("OGASON_BASE_URL","http://127.0.0.1:8765").rstrip("/")
        self.path=os.getenv("OGASON_TRANSCRIBE_PATH","/transcribe")
    def transcribe(self,audio_base64,filename):
        if not audio_base64:raise ValueError("audio_base64 is required")
        r=requests.post(self.base+self.path,json={"audio_base64":audio_base64,"filename":filename},timeout=300)
        r.raise_for_status()
        data=r.json();tx=data.get("text") or data.get("transcript")
        if not tx:raise ValueError("Ogason response has no transcript")
        return tx
