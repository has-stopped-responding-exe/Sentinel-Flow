import sys
from pathlib import Path
sys.path.insert(0,str(Path(__file__).parents[1]/"backend"))
from app.detectors.engine import ThreatDetectionEngine
from app.seed import make_flows
def test_demo_detector_is_deterministic():
    engine=ThreatDetectionEngine(True);record=make_flows(1)[0]
    assert engine.process(record)==engine.process(record)
def test_window_is_bounded():
    engine=ThreatDetectionEngine(True,max_window=10)
    for flow in make_flows(30):engine.process(flow)
    assert len(engine.window)==10
def test_rule_detectors_cover_required_classes():
    classes={d.threat_class for d in ThreatDetectionEngine().detectors}
    assert {"DDOS","BOTNET_C2","DNS_TUNNELING","ENCRYPTED_MALWARE","DATA_EXFILTRATION","UNKNOWN_ANOMALY"}==classes
