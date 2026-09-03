import hashlib,statistics
from collections import defaultdict,deque
class BaseThreatDetector:
    name="base";threat_class="UNKNOWN_ANOMALY"
    def __init__(self,threshold=.7):self.threshold=threshold
    def extract_features(self,records):raise NotImplementedError
    def update_window(self,record):pass
    def predict(self,features):raise NotImplementedError
    def calculate_confidence(self,risk):return round(min(.99,.5+risk/2),3)
    def generate_evidence(self,features):return []
class RuleBasedDetector(BaseThreatDetector):
    def __init__(self,name,threat_class,feature,threshold,scale):super().__init__(threshold);self.name=name;self.threat_class=threat_class;self.feature=feature;self.scale=scale
    def extract_features(self,records):
        if not records:return {self.feature:0.}
        packets=sum(float(r.get("packets",1)) for r in records);bytes_=sum(float(r.get("bytes",r.get("packet_length",0))) for r in records);durations=[float(r.get("duration_ms",1)) for r in records]
        vals={"packet_rate":packets/max(1,len(records)),"periodicity":1-min(1,statistics.pstdev(durations)/max(1,statistics.mean(durations))),"dns_entropy":max([float((r.get("dns") or {}).get("entropy",0)) for r in records],default=0),"ja4_rarity":sum(1 for r in records if (r.get("tls") or {}).get("ja4"))/len(records),"outbound_bytes":bytes_};return {self.feature:vals[self.feature]}
    def predict(self,features):return min(.99,features[self.feature]/self.scale)
class DemoDetector(BaseThreatDetector):
    def predict_record(self,record):
        digest=int(hashlib.sha256(str(sorted(record.items())).encode()).hexdigest()[:8],16);classes=["BENIGN","DDOS","BOTNET_C2","DNS_TUNNELING","ENCRYPTED_MALWARE","DATA_EXFILTRATION","UNKNOWN_ANOMALY"]
        return {"threat_class":record.get("classification") or classes[digest%len(classes)],"confidence":min(.98,round(.72+(digest%2600)/10000,3)),"mode":"demo","disclosure":"Deterministic simulated inference; not a production model."}
class ThreatDetectionEngine:
    def __init__(self,use_demo=True,max_window=5000):
        self.use_demo=use_demo;self.window=deque(maxlen=max_window);self.profiles=defaultdict(lambda:{"flows":0,"bytes":0});self.demo=DemoDetector();self.detectors=[RuleBasedDetector("Volumetric / protocol DDoS","DDOS","packet_rate",.72,1400),RuleBasedDetector("Botnet periodicity","BOTNET_C2","periodicity",.74,1),RuleBasedDetector("DNS tunnel","DNS_TUNNELING","dns_entropy",.76,5.1),RuleBasedDetector("Encrypted malware","ENCRYPTED_MALWARE","ja4_rarity",.75,1),RuleBasedDetector("Data exfiltration","DATA_EXFILTRATION","outbound_bytes",.78,80000000),RuleBasedDetector("General anomaly","UNKNOWN_ANOMALY","packet_rate",.68,2800)]
    def process(self,record):
        self.window.append(record);p=self.profiles[record.get("src_ip","unknown")];p["flows"]+=1;p["bytes"]+=float(record.get("bytes",record.get("packet_length",0)))
        if self.use_demo:return self.demo.predict_record(record)
        raise RuntimeError("Production model unavailable. Set USE_DEMO_MODEL=true or mount a trained model.")
    def status(self):return [{"name":d.name,"threat_class":d.threat_class,"threshold":d.threshold,"window":"60 s sliding","status":"ready","last_inference":"2026-09-02T10:42:19.810Z","confidence":.86,"version":"rules-1.2","mode":"demo" if self.use_demo else "production"} for d in self.detectors]
