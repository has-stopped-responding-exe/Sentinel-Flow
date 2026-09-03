import json,sqlite3,threading
from pathlib import Path
class LocalStore:
    """SQLite fallback. Packet payloads are intentionally excluded."""
    def __init__(self,path,flows,alerts):
        self.path=path;self.flows=flows;self.alerts=alerts;self.lock=threading.Lock();Path(path).parent.mkdir(parents=True,exist_ok=True)
        with sqlite3.connect(path) as db:db.executescript("CREATE TABLE IF NOT EXISTS analyst_notes(id INTEGER PRIMARY KEY,alert_id TEXT,author TEXT,note TEXT,created_at TEXT);CREATE TABLE IF NOT EXISTS audit_events(id INTEGER PRIMARY KEY,event TEXT,actor TEXT,details TEXT,created_at TEXT);CREATE TABLE IF NOT EXISTS simulation_runs(id INTEGER PRIMARY KEY,scenario TEXT,status TEXT,created_at TEXT);CREATE TABLE IF NOT EXISTS model_versions(id INTEGER PRIMARY KEY,name TEXT,version TEXT,metadata TEXT);")
    def audit(self,event,actor,details,created_at):
        with self.lock,sqlite3.connect(self.path) as db:db.execute("INSERT INTO audit_events(event,actor,details,created_at) VALUES(?,?,?,?)",(event,actor,json.dumps(details),created_at))
    def audit_log(self):
        with sqlite3.connect(self.path) as db:rows=db.execute("SELECT id,event,actor,details,created_at FROM audit_events ORDER BY id DESC LIMIT 100").fetchall()
        return [{"id":r[0],"event":r[1],"actor":r[2],"details":json.loads(r[3]),"timestamp":r[4]} for r in rows]
