"""Optional local AI adapter. It never replaces raw transcript or deterministic QC rules.
Signature: mehradtorabi1
"""
import os

class LocalAI:
    def __init__(self):
        self.enabled=os.getenv("AI_ENABLED","false").lower()=="true"
        self.model_path=os.getenv("AI_MODEL_PATH","/models/parsbert")
        self.available=False
        self.reason="disabled"
        if self.enabled:
            try:
                import transformers
                self.available=True
                self.reason="transformers_available"
            except Exception as exc:
                self.reason=f"dependency_unavailable:{exc.__class__.__name__}"

    def status(self):
        return {"enabled":self.enabled,"available":self.available,"model_path":self.model_path,"reason":self.reason,"mode":"local_only"}

    def classify(self,text,labels):
        if not self.available:
            return {"enabled":False,"confidence":None,"label":None}
        # Model loading/fine-tuning is deliberately injected later through a pinned local model.
        # No cloud inference and no transcript rewriting.
        return {"enabled":True,"confidence":None,"label":None,"requires_calibration":True}
