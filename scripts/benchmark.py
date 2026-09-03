from __future__ import annotations
import argparse,json,statistics,sys,time,tracemalloc
from pathlib import Path
sys.path.insert(0,str(Path(__file__).parents[1]/"backend"))
from app.detectors import ThreatDetectionEngine
from app.seed import make_flows
def percentile(values,p):return sorted(values)[min(len(values)-1,int(len(values)*p))]
def main():
    ap=argparse.ArgumentParser(description="Benchmark deterministic one-way flow inference");ap.add_argument("--flows",type=int,default=50000);args=ap.parse_args()
    seed=make_flows();engine=ThreatDetectionEngine(True);lat=[];alerts=0;tracemalloc.start();start=time.perf_counter()
    for i in range(args.flows):
        t=time.perf_counter();r=engine.process(seed[i%len(seed)]);lat.append((time.perf_counter()-t)*1000);alerts+=r["threat_class"]!="BENIGN"
    elapsed=time.perf_counter()-start;_,peak=tracemalloc.get_traced_memory();tracemalloc.stop()
    result={"flows_processed":args.flows,"elapsed_seconds":round(elapsed,3),"flows_per_second":round(args.flows/elapsed,1),"end_to_end_ms":round(elapsed*1000,2),"latency_ms":{"p50":round(percentile(lat,.50),4),"p95":round(percentile(lat,.95),4),"p99":round(percentile(lat,.99),4)},"peak_memory_mb":round(peak/1024/1024,2),"alerts_generated":alerts,"mode":"deterministic demo inference","note":"Local measured result; no network I/O or production model."}
    print(json.dumps(result,indent=2))
if __name__=="__main__":main()
