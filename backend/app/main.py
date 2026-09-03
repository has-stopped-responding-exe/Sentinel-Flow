from __future__ import annotations
import asyncio,csv,hashlib,io,json,os,time,uuid
from collections import defaultdict,deque
from contextlib import asynccontextmanager
from datetime import datetime,timedelta,timezone
from pathlib import Path
from typing import Any
import jwt
from fastapi import Depends,FastAPI,File,HTTPException,Query,Request,UploadFile,WebSocket,WebSocketDisconnect
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from fastapi.security import HTTPAuthorizationCredentials,HTTPBearer
from passlib.context import CryptContext
from .detectors import ThreatDetectionEngine
from .schemas import FeedbackRequest,FlowRecord,LoginRequest,NoteRequest,ScenarioRequest,StatusRequest,ThresholdRequest
from .seed import SCENARIOS,analytics,make_alerts,make_flows
from .simulator import SimulationState
from .store import LocalStore

APP_NAME="SentinelFlow API";USE_DEMO=os.getenv("USE_DEMO_MODEL","true").lower()=="true";JWT_SECRET=os.getenv("JWT_SECRET","local-demo-secret-change-in-production");ALGORITHM="HS256";MAX_UPLOAD=int(os.getenv("MAX_UPLOAD_MB","10"))*1024*1024
DEFAULT_DB_PATH = "/tmp/sentinelflow.db" if os.getenv("VERCEL") else str(Path(__file__).resolve().parents[1]/"data"/"sentinelflow.db")
DB_PATH=os.getenv("LOCAL_DB_PATH",DEFAULT_DB_PATH)
USERS={"analyst@sentinelflow.demo":{"name":"Maya Chen","role":"SOC Analyst","password":"Sentinel123!"},"admin@sentinelflow.demo":{"name":"Arjun Rao","role":"Administrator","password":"AdminSentinel123!"},"auditor@sentinelflow.demo":{"name":"Elena Park","role":"Read-Only Auditor","password":"AuditSentinel123!"}}
pwd=CryptContext(schemes=["pbkdf2_sha256"],deprecated="auto");HASHED={email:pwd.hash(u["password"]) for email,u in USERS.items()};security=HTTPBearer(auto_error=False)
FLOWS=make_flows();ALERTS=make_alerts(FLOWS);STORE=LocalStore(DB_PATH,FLOWS,ALERTS);ENGINE=ThreatDetectionEngine(USE_DEMO);SIM=SimulationState();RATE:dict[str,deque[float]]=defaultdict(lambda:deque(maxlen=120))
def now():return datetime.now(timezone.utc).isoformat().replace("+00:00","Z")
@asynccontextmanager
async def lifespan(_:FastAPI):
    task=asyncio.create_task(SIM.pump(FLOWS,ALERTS));yield;task.cancel()
app=FastAPI(title=APP_NAME,version="1.2.0",lifespan=lifespan,docs_url="/api/docs")
app.add_middleware(CORSMiddleware,allow_origins=[x.strip() for x in os.getenv("ALLOWED_ORIGINS","http://localhost:5173").split(",")],allow_credentials=True,allow_methods=["GET","POST","OPTIONS"],allow_headers=["Authorization","Content-Type","X-Request-ID"])
def error(status,code,message,request_id=None):return JSONResponse(status_code=status,content={"status":status,"error_code":code,"message":message,"request_id":request_id or str(uuid.uuid4())})
@app.middleware("http")
async def hardening(request:Request,call_next):
    request.state.request_id=request.headers.get("x-request-id",str(uuid.uuid4()));key=request.client.host if request.client else "local";bucket,current=RATE[key],time.monotonic()
    while bucket and current-bucket[0]>60:bucket.popleft()
    if len(bucket)>=int(os.getenv("RATE_LIMIT_PER_MINUTE","120")):return error(429,"RATE_LIMITED","Too many requests. Retry in one minute.",request.state.request_id)
    bucket.append(current);response=await call_next(request)
    for k,v in {"X-Content-Type-Options":"nosniff","X-Frame-Options":"DENY","Referrer-Policy":"no-referrer","Permissions-Policy":"camera=(), microphone=(), geolocation=()","Content-Security-Policy":"default-src 'none'; frame-ancestors 'none'"}.items():response.headers[k]=v
    response.headers["X-Request-ID"]=request.state.request_id;return response
@app.exception_handler(HTTPException)
async def http_error(request,exc):
    codes={401:"AUTHENTICATION_FAILED",403:"FORBIDDEN",404:"NOT_FOUND",413:"UPLOAD_TOO_LARGE",415:"UNSUPPORTED_FILE",422:"INVALID_INPUT",503:"SERVICE_UNAVAILABLE"};return error(exc.status_code,codes.get(exc.status_code,"REQUEST_ERROR"),str(exc.detail),getattr(request.state,"request_id",None))
@app.exception_handler(Exception)
async def unexpected(request,_):return error(500,"INTERNAL_ERROR","SentinelFlow could not complete the request safely.",getattr(request.state,"request_id",None))
def token_for(email):
    u=USERS[email];return jwt.encode({"sub":email,"name":u["name"],"role":u["role"],"exp":datetime.now(timezone.utc)+timedelta(hours=8)},JWT_SECRET,algorithm=ALGORITHM)
def user(credentials:HTTPAuthorizationCredentials|None=Depends(security)):
    if not credentials:raise HTTPException(401,"Authentication required")
    try:return jwt.decode(credentials.credentials,JWT_SECRET,algorithms=[ALGORITHM])
    except jwt.PyJWTError as exc:raise HTTPException(401,"Session expired or invalid") from exc
def admin(me=Depends(user)):
    if me["role"]!="Administrator":raise HTTPException(403,"Administrator role required")
    return me
@app.get("/api/health")
def health():return {"status":"ok","service":APP_NAME,"version":"1.2.0","demo_mode":USE_DEMO,"input_policy":"strictly read-only passive metadata"}
@app.post("/api/auth/login")
def login(body:LoginRequest):
    email=body.email.lower();account=USERS.get(email)
    if not account or not pwd.verify(body.password,HASHED[email]):raise HTTPException(401,"Invalid email or password")
    STORE.audit("AUTH_LOGIN",email,{"role":account["role"]},now());return {"access_token":token_for(email),"token_type":"bearer","expires_in":28800,"user":{"email":email,"name":account["name"],"role":account["role"]}}
@app.get("/api/dashboard")
def dashboard(_:dict=Depends(user)):
    return {"label":"Simulated live stream","demo_mode":USE_DEMO,"stream":{"status":"running" if SIM.running else "paused","scenario":SIM.scenario,"last_event":FLOWS[0]["timestamp"]},"metrics":{"packets_observed":12847391,"active_flows":1842,"threats_detected":len(ALERTS),"critical_alerts":sum(a["severity"]=="CRITICAL" for a in ALERTS),"detection_latency_ms":42,"throughput_fps":9640,"sensor_health":99.7,"model_confidence":91.4},"threat_level":"HIGH","alerts":ALERTS[:8],"analytics":analytics(),"top_entities":[{"entity":"10.10.4.28","risk":96,"flows":418},{"entity":"203.0.113.44","risk":91,"flows":307},{"entity":"10.10.7.91","risk":84,"flows":266}]}
@app.get("/api/traffic/live")
def traffic_live(limit:int=Query(25,ge=1,le=100),_:dict=Depends(user)):return {"label":"Simulated live stream","running":SIM.running,"scenario":SIM.scenario,"items":FLOWS[:limit]}
@app.websocket("/api/stream")
async def stream(websocket:WebSocket,token:str=Query(default="")):
    try:jwt.decode(token,JWT_SECRET,algorithms=[ALGORITHM])
    except jwt.PyJWTError:await websocket.close(code=4401,reason="Authentication required");return
    await websocket.accept();SIM.subscribers.add(websocket);await websocket.send_json({"type":"connected","label":"Simulated live stream","scenario":SIM.scenario})
    try:
        while True:await websocket.receive_text()
    except WebSocketDisconnect:SIM.subscribers.discard(websocket)
@app.post("/api/replay/start")
def replay_start(me=Depends(user)):SIM.start();STORE.audit("SIMULATION_STARTED",me["sub"],{"scenario":SIM.scenario},now());return {"status":"running","scenario":SIM.scenario,"label":"Simulated live stream"}
@app.post("/api/replay/pause")
def replay_pause(me=Depends(user)):SIM.pause();STORE.audit("SIMULATION_PAUSED",me["sub"],{},now());return {"status":"paused","cursor":SIM.cursor}
@app.post("/api/replay/reset")
def replay_reset(me=Depends(user)):SIM.reset();STORE.audit("SIMULATION_RESET",me["sub"],{},now());return {"status":"reset","cursor":0}
@app.post("/api/replay/scenario")
def replay_scenario(body:ScenarioRequest,me=Depends(user)):
    SIM.scenario=body.scenario;SIM.speed=body.speed;SIM.cursor=0;STORE.audit("SCENARIO_CHANGED",me["sub"],body.model_dump(),now());title,description=SCENARIOS[body.scenario];return {"status":"configured","scenario":body.scenario,"title":title,"description":description,"speed":body.speed,"label":"Simulated telemetry"}
@app.get("/api/flows")
def flows(threat_class:str|None=None,protocol:str|None=None,search:str|None=None,min_risk:int=0,limit:int=Query(50,le=200),_:dict=Depends(user)):
    items=FLOWS
    if threat_class:items=[x for x in items if x["classification"]==threat_class]
    if protocol:items=[x for x in items if x["protocol"]==protocol]
    if search:items=[x for x in items if search.lower() in json.dumps(x).lower()]
    items=[x for x in items if x["risk"]>=min_risk];return {"items":items[:limit],"total":len(items),"bounded":True}
@app.get("/api/flows/{flow_id}")
def flow(flow_id:str,_:dict=Depends(user)):
    item=next((f for f in FLOWS if f["flow_id"]==flow_id),None)
    if not item:raise HTTPException(404,"Flow not found")
    return {**item,"inference":ENGINE.process(item),"timeline":[{"offset_ms":j*max(1,item["duration_ms"]//5),"packets":max(1,item["packets"]//(j+2))} for j in range(5)]}
@app.get("/api/alerts")
def alerts(severity:str|None=None,status:str|None=None,_:dict=Depends(user)):
    items=ALERTS
    if severity:items=[a for a in items if a["severity"]==severity.upper()]
    if status:items=[a for a in items if a["status"]==status]
    return {"items":items,"total":len(items)}
@app.get("/api/alerts/{alert_id}")
def alert(alert_id:str,_:dict=Depends(user)):
    item=next((a for a in ALERTS if a["alert_id"]==alert_id),None)
    if not item:raise HTTPException(404,"Alert not found")
    return {**item,"similar_alerts":[a["alert_id"] for a in ALERTS if a["threat_class"]==item["threat_class"] and a["alert_id"]!=alert_id][:4]}
@app.post("/api/alerts/{alert_id}/notes")
def add_note(alert_id:str,body:NoteRequest,me=Depends(user)):
    item=next((a for a in ALERTS if a["alert_id"]==alert_id),None)
    if not item:raise HTTPException(404,"Alert not found")
    note={"author":me["name"],"timestamp":now(),"text":body.notes};item["notes"].append(note);STORE.audit("ALERT_NOTE_ADDED",me["sub"],{"alert_id":alert_id},now());return note
@app.post("/api/alerts/{alert_id}/status")
def update_status(alert_id:str,body:StatusRequest,me=Depends(user)):
    if me["role"]=="Read-Only Auditor":raise HTTPException(403,"Auditors cannot change alert status")
    item=next((a for a in ALERTS if a["alert_id"]==alert_id),None)
    if not item:raise HTTPException(404,"Alert not found")
    item["status"]=body.status;STORE.audit("ALERT_STATUS_CHANGED",me["sub"],{"alert_id":alert_id,"status":body.status},now());return {"alert_id":alert_id,"status":body.status}
@app.get("/api/analytics")
def analytics_endpoint(_:dict=Depends(user)):return analytics()
@app.get("/api/sensors")
def sensors(_:dict=Depends(user)):return {"items":[{"sensor_id":f"DIODE-SENSOR-0{i}","site":site,"status":status,"health":health,"throughput_mbps":mbps,"last_event":FLOWS[i]["timestamp"],"buffer_usage":28+i*9,"direction":"one-way ingress"} for i,site,status,health,mbps in [(1,"North Gateway","healthy",99.9,841),(2,"Peering Edge","healthy",99.6,622),(3,"Plant DMZ","degraded",92.4,318)]]}
@app.get("/api/model/status")
def model_status(_:dict=Depends(user)):return {"active":USE_DEMO,"name":"Demo Metadata Ensemble" if USE_DEMO else "Production model unavailable","version":"1.2.0","mode":"demo" if USE_DEMO else "production","training_date":"2026-08-12","feature_schema":"oneway-v3","classes":["DDOS","BOTNET_C2","DNS_TUNNELING","ENCRYPTED_MALWARE","DATA_EXFILTRATION","BENIGN","UNKNOWN_ANOMALY"],"fallback":"ready","last_inference":FLOWS[0]["timestamp"],"detectors":ENGINE.status(),"disclosure":"Demo mode uses deterministic simulated results."}
@app.get("/api/model/metrics")
def model_metrics(_:dict=Depends(user)):return {"scope":"offline demo evaluation fixture","accuracy":.923,"macro_f1":.906,"false_positive_rate":.037,"mean_latency_ms":42,"drift":.12,"per_class":[{"class":c,"precision":round(.86+i*.018,3),"recall":round(.84+i*.021,3),"f1":round(.85+i*.019,3)} for i,c in enumerate(["DDOS","BOTNET_C2","DNS_TUNNELING","ENCRYPTED_MALWARE","DATA_EXFILTRATION"])],"confusion_matrix":[[93,2,1,1,3],[2,89,3,4,2],[1,2,94,1,2],[1,3,1,91,4],[2,1,2,3,92]]}
@app.post("/api/model/detectors/{threat_class}/threshold")
def threshold(threat_class:str,body:ThresholdRequest,me=Depends(admin)):
    if not USE_DEMO:raise HTTPException(403,"Production thresholds cannot be changed from this interface")
    detector=next((d for d in ENGINE.detectors if d.threat_class==threat_class),None)
    if not detector:raise HTTPException(404,"Detector not found")
    detector.threshold=body.threshold;STORE.audit("DEMO_THRESHOLD_CHANGED",me["sub"],{"detector":threat_class,"threshold":body.threshold},now());return {"threat_class":threat_class,"threshold":body.threshold,"mode":"demo"}
@app.post("/api/datasets/upload")
async def dataset_upload(file:UploadFile=File(...),me=Depends(user)):
    suffix=Path(file.filename or "").suffix.lower()
    if suffix not in {".csv",".jsonl"}:raise HTTPException(415,"Only CSV and JSONL metadata files are supported in this prototype")
    raw=await file.read(MAX_UPLOAD+1)
    if len(raw)>MAX_UPLOAD:raise HTTPException(413,"Upload exceeds configured size limit")
    try:
        text=raw.decode("utf-8-sig");rows=list(csv.DictReader(io.StringIO(text))) if suffix==".csv" else [json.loads(line) for line in text.splitlines() if line.strip()]
        if not rows:raise ValueError("no records")
        validated=[FlowRecord.model_validate(row).model_dump(mode="json") for row in rows[:1000]]
    except Exception as exc:raise HTTPException(422,"Invalid input schema. Use the documented one-way metadata record format.") from exc
    STORE.audit("DATASET_UPLOADED",me["sub"],{"filename_sha256":hashlib.sha256((file.filename or "").encode()).hexdigest(),"records":len(validated)},now());return {"accepted":len(validated),"bounded_to":1000,"payloads_stored":False,"message":"Metadata validated and queued for replay."}
@app.post("/api/feedback")
def feedback(body:FeedbackRequest,me=Depends(user)):STORE.audit("DETECTION_FEEDBACK",me["sub"],body.model_dump(),now());return {"accepted":True,"alert_id":body.alert_id}
@app.get("/api/audit-log")
def audit_log(_:dict=Depends(user)):return {"items":STORE.audit_log()}
