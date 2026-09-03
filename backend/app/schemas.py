from __future__ import annotations
from datetime import datetime
from typing import Any, Literal
from pydantic import BaseModel, ConfigDict, EmailStr, Field

class LoginRequest(BaseModel):
    email: EmailStr
    password: str = Field(min_length=8, max_length=128)
class NoteRequest(BaseModel): notes: str = Field(min_length=1, max_length=2000)
class StatusRequest(BaseModel): status: Literal["new","investigating","contained","closed","false_positive"]
class ScenarioRequest(BaseModel):
    scenario: Literal["benign","syn_flood","udp_amplification","botnet","dns_tunnel","encrypted_malware","exfiltration","mixed"]
    speed: float = Field(default=1.0, ge=.25, le=8)
class ThresholdRequest(BaseModel): threshold: float = Field(ge=.1, le=.99)
class FeedbackRequest(BaseModel):
    alert_id: str = Field(pattern=r"^ALT-")
    verdict: Literal["correct","false_positive","needs_review"]
    notes: str = Field(default="", max_length=1000)
class FlowRecord(BaseModel):
    model_config=ConfigDict(extra="allow")
    timestamp: datetime; sensor_id: str = Field(min_length=2,max_length=64); src_ip: str; dst_ip: str
    src_port: int|None = Field(default=None,ge=0,le=65535); dst_port: int|None = Field(default=None,ge=0,le=65535)
    protocol: Literal["TCP","UDP","ICMP","DNS","QUIC","OTHER"]; packet_length: int=Field(ge=0,le=65535)
    tcp_flags: list[str]=[]; direction: Literal["observed_outbound","observed_inbound"]; flow_id: str
    dns: dict[str,Any]|None=None; tls: dict[str,Any]|None=None
