#!/usr/bin/env python3
import argparse, hashlib, json, os
from pathlib import Path

try:
    from huggingface_hub import HfApi, snapshot_download
except ImportError as e:
    raise SystemExit("Install builder dependency first: pip install 'huggingface_hub>=0.34,<1'") from e

ROOT=Path(__file__).resolve().parents[1]
SPEC=json.loads((ROOT/"offline/model-pack.json").read_text(encoding="utf-8"))

def models_for(profile):
    p=SPEC["profiles"][profile]
    rows=[]
    if p.get("extends"):
        rows.extend(models_for(p["extends"]))
    rows.extend(p.get("models",[]))
    seen={}
    for x in rows: seen[x["id"]]=x
    return list(seen.values())

def sha256(path):
    h=hashlib.sha256()
    with open(path,"rb") as f:
        for chunk in iter(lambda:f.read(8*1024*1024),b""): h.update(chunk)
    return h.hexdigest()

def patterns_for(model):
    tops=[
        "config.json","generation_config.json","preprocessor_config.json",
        "tokenizer.json","tokenizer_config.json","added_tokens.json",
        "special_tokens_map.json","normalizer.json","quantize_config.json",
        "vocab.json","merges.txt"
    ]
    return sorted(set(tops+model["requiredFiles"]))

def main():
    ap=argparse.ArgumentParser(description="Build KulePoshti strict-offline Transformers.js model pack")
    ap.add_argument("--profile",choices=SPEC["profiles"].keys(),default="portable")
    ap.add_argument("--output",default=str(ROOT/"offline-models"))
    args=ap.parse_args()
    out=Path(args.output).resolve();out.mkdir(parents=True,exist_ok=True)
    api=HfApi();lock={"packVersion":SPEC["packVersion"],"profile":args.profile,"models":[]}
    for model in models_for(args.profile):
        repo=model["id"];info=api.model_info(repo);target=out/repo
        print(f"[download] {repo}@{info.sha}")
        snapshot_download(repo_id=repo,revision=info.sha,local_dir=target,allow_patterns=patterns_for(model))
        cache_dir=target/".cache"
        if cache_dir.exists():
            import shutil
            shutil.rmtree(cache_dir)
        missing=[x for x in model["requiredFiles"] if not (target/x).is_file()]
        if missing: raise SystemExit(f"{repo}: required files missing: {missing}")
        files=[]
        for p in sorted(target.rglob("*")):
            if p.is_file():
                files.append({"path":str(p.relative_to(target)).replace(os.sep,"/"),"bytes":p.stat().st_size,"sha256":sha256(p)})
        lock["models"].append({"id":repo,"revision":info.sha,"files":files,"bytes":sum(x["bytes"] for x in files)})
    lock["bytes"]=sum(x["bytes"] for x in lock["models"])
    lock_path=out/"model-pack.lock.json";lock_path.write_text(json.dumps(lock,ensure_ascii=False,indent=2),encoding="utf-8")
    print(f"[ok] {lock_path} total={lock['bytes']/1024/1024:.1f} MiB")

if __name__=="__main__": main()
