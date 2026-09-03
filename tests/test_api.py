import os,sys
from pathlib import Path
os.environ["LOCAL_DB_PATH"] = str(Path(__file__).parent / "test.db")
sys.path.insert(0,str(Path(__file__).parents[1]/"backend"))
from fastapi.testclient import TestClient
from app.main import ALERTS,FLOWS,app

client=TestClient(app)
def auth(email="analyst@sentinelflow.demo",password="Sentinel123!"):
    r=client.post("/api/auth/login",json={"email":email,"password":password});assert r.status_code==200
    return {"Authorization":f"Bearer {r.json()['access_token']}"}
def test_health_and_security_headers():
    r=client.get("/api/health");assert r.status_code==200;assert r.json()["input_policy"].startswith("strictly read-only");assert r.headers["x-content-type-options"]=="nosniff"
def test_auth_rejects_invalid_password():assert client.post("/api/auth/login",json={"email":"analyst@sentinelflow.demo","password":"wrongpass"}).status_code==401
def test_seed_coverage_and_determinism():
    assert len(FLOWS)>=100 and len(ALERTS)>=30
    classes={f["classification"] for f in FLOWS};assert {"DDOS","BOTNET_C2","DNS_TUNNELING","ENCRYPTED_MALWARE","DATA_EXFILTRATION","BENIGN","UNKNOWN_ANOMALY"}<=classes
def test_protected_routes_and_flow_detail():
    h=auth();assert client.get("/api/dashboard",headers=h).status_code==200
    flows=client.get("/api/flows?limit=5",headers=h).json();assert len(flows["items"])==5
    detail=client.get(f"/api/flows/{flows['items'][0]['flow_id']}",headers=h);assert detail.status_code==200;assert detail.json()["inference"]["mode"]=="demo"
def test_simulator_state_controls():
    h=auth();assert client.post("/api/replay/scenario",headers=h,json={"scenario":"dns_tunnel","speed":2}).status_code==200
    assert client.post("/api/replay/start",headers=h).json()["status"]=="running"
    assert client.post("/api/replay/pause",headers=h).json()["status"]=="paused"
    assert client.post("/api/replay/reset",headers=h).json()["cursor"]==0
def test_auditor_cannot_change_alert():
    h=auth("auditor@sentinelflow.demo","AuditSentinel123!")
    r=client.post(f"/api/alerts/{ALERTS[0]['alert_id']}/status",headers=h,json={"status":"closed"});assert r.status_code==403
def test_upload_validation():
    h=auth();r=client.post("/api/datasets/upload",headers=h,files={"file":("bad.exe",b"x","application/octet-stream")});assert r.status_code==415
def test_api_errors_are_structured():
    r=client.get("/api/alerts/nope",headers=auth());body=r.json();assert r.status_code==404;assert {"status","error_code","message","request_id"}<=body.keys()
