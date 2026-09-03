import asyncio
from dataclasses import dataclass,field
@dataclass
class SimulationState:
    scenario:str="mixed";speed:float=1.;running:bool=False;cursor:int=0;generation:int=0;subscribers:set=field(default_factory=set)
    def start(self):self.running=True
    def pause(self):self.running=False
    def reset(self):self.running=False;self.cursor=0;self.generation+=1
    async def broadcast(self,event):
        dead=[]
        for ws in list(self.subscribers):
            try:await ws.send_json(event)
            except Exception:dead.append(ws)
        for ws in dead:self.subscribers.discard(ws)
    async def pump(self,flows,alerts):
        mapping={"benign":"BENIGN","syn_flood":"DDOS","udp_amplification":"DDOS","botnet":"BOTNET_C2","dns_tunnel":"DNS_TUNNELING","encrypted_malware":"ENCRYPTED_MALWARE","exfiltration":"DATA_EXFILTRATION"}
        while True:
            if not self.running or not self.subscribers:await asyncio.sleep(.25);continue
            candidates=flows if self.scenario=="mixed" else [f for f in flows if f["classification"]==mapping[self.scenario]];flow=candidates[self.cursor%len(candidates)].copy();matching=next((a for a in alerts if a["flow_id"]==flow["flow_id"]),None)
            await self.broadcast({"type":"telemetry","label":"Simulated live stream","flow":flow,"alert":matching,"scenario":self.scenario});self.cursor+=1;await asyncio.sleep(max(.08,.75/self.speed))
