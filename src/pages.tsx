import { FormEvent, useEffect, useMemo, useRef, useState } from "react";
import {
  Link,
  useNavigate,
  useParams,
  useSearchParams,
} from "react-router-dom";
import {
  Activity,
  AlertOctagon,
  ArrowRight,
  BarChart3,
  Check,
  ChevronRight,
  CirclePause,
  Database,
  Download,
  Eye,
  FileSearch,
  Filter,
  FlaskConical,
  Gauge,
  LockKeyhole,
  Network,
  Play,
  RefreshCw,
  RotateCcw,
  Search,
  Server,
  Settings2,
  Shield,
  ShieldAlert,
  ShieldCheck,
  SlidersHorizontal,
  SquareActivity,
  Upload,
  WifiOff,
  Zap,
} from "lucide-react";
import {
  api,
  apiBase,
  downloadCsv,
  fmt,
  login,
  oneDecimal,
  percent,
  when,
} from "./api";
import { Alert, Flow, User } from "./types";
import {
  Badge,
  Bars,
  Donut,
  Empty,
  ErrorState,
  labelize,
  Loading,
  Metric,
  PageHead,
  Panel,
  Risk,
  Severity,
  Sparkline,
} from "./components";
type PageProps = {
  user: User | null;
  setAuth: (token: string, user: User) => void;
};
const scenarios = [
  ["benign", "Benign baseline"],
  ["syn_flood", "SYN flood"],
  ["udp_amplification", "UDP amplification"],
  ["botnet", "Botnet beaconing"],
  ["dns_tunnel", "DNS tunneling"],
  ["encrypted_malware", "Encrypted malware"],
  ["exfiltration", "Data exfiltration"],
  ["mixed", "Coordinated mixed attack"],
];
export function Landing() {
  return (
    <main className="landing">
      <nav className="landing-nav">
        <Brand />
        <div>
          <a href="#architecture">Architecture</a>
          <a href="#workflow">How it works</a>
          <Link className="btn compact" to="/login">
            Launch Console
          </Link>
        </div>
      </nav>
      <section className="hero">
        <div className="hero-copy">
          <Badge tone="info">AIR-GAP COMPATIBLE · PASSIVE ONLY</Badge>
          <h1>
            See the Threats
            <br />
            That Never Speak Back.
          </h1>
          <p>
            SentinelFlow detects cyber threats from strictly one-way network
            telemetry—without active probing, payload decryption, or
            return-channel access.
          </p>
          <div className="hero-actions">
            <Link className="btn" to="/login">
              Launch SOC Console <ArrowRight size={17} />
            </Link>
            <Link className="btn secondary" to="/login?next=/simulator">
              <Play size={16} /> Run Attack Simulation
            </Link>
          </div>
          <div className="trust-row">
            {[
              "Passive Detection",
              "Metadata-Only",
              "Streaming Inference",
              "Explainable Alerts",
              "No Return Channel",
            ].map((x) => (
              <span key={x}>
                <Check size={14} />
                {x}
              </span>
            ))}
          </div>
        </div>
        <div
          className="hero-visual"
          aria-label="Simulated metadata analysis preview"
        >
          <div className="visual-top">
            <Badge tone="demo">SIMULATED TELEMETRY</Badge>
            <span>42ms inference</span>
          </div>
          <div className="packet-lines">
            {[78, 42, 91, 58, 72, 36, 84].map((v, i) => (
              <span
                key={i}
                style={{ width: `${v}%`, animationDelay: `${i * 80}ms` }}
              />
            ))}
          </div>
          <div className="threat-card">
            <ShieldAlert size={24} />
            <div>
              <span>DATA EXFILTRATION</span>
              <strong>94.0% confidence</strong>
            </div>
            <Severity value="critical" />
          </div>
          <div className="evidence-mini">
            <span>Outbound baseline</span>
            <strong>8.9×</strong>
            <i />
            <span>Destination rarity</span>
            <strong>0.96</strong>
            <i />
          </div>
        </div>
      </section>
      <section className="workflow" id="workflow">
        <span className="eyebrow">THE PASSIVE DETECTION PIPELINE</span>
        <h2>Built for visibility without reachability.</h2>
        <div className="workflow-grid">
          {(
            [
              [
                "Capture",
                Network,
                "Read-only metadata enters the monitoring enclave.",
              ],
              [
                "Reconstruct",
                SquareActivity,
                "One-way flows form without handshake assumptions.",
              ],
              [
                "Analyze",
                FlaskConical,
                "Detectors score temporal and statistical behavior.",
              ],
              ["Explain", FileSearch, "Evidence shows exactly what changed."],
              [
                "Alert",
                ShieldAlert,
                "Analysts receive actionable, scoped findings.",
              ],
            ] as [string, any, string][]
          ).map(([n, I, d], i) => (
            <article key={String(n)}>
              <span>0{i + 1}</span>
              <I size={22} />
              <h3>{n}</h3>
              <p>{d}</p>
            </article>
          ))}
        </div>
      </section>
      <section className="architecture" id="architecture">
        <div>
          <span className="eyebrow">ZERO RETURN-PATH ARCHITECTURE</span>
          <h2>Intelligence crosses the boundary. Commands never do.</h2>
          <p>
            Every capability is deliberately constrained to observed timestamps,
            endpoints, ports, flags, sizes, DNS/TLS metadata, fingerprints, and
            behavior over time.
          </p>
        </div>
        <div className="arch-diagram">
          <ArchNode
            icon={<Server />}
            title="Production network"
            sub="Protected infrastructure"
          />
          <div className="diode">
            <ArrowRight />
            <b>DATA DIODE</b>
            <small>ONE WAY</small>
          </div>
          <ArchNode
            icon={<Database />}
            title="Monitoring enclave"
            sub="Bounded metadata stream"
          />
          <ChevronRight />
          <ArchNode
            icon={<FlaskConical />}
            title="Inference engine"
            sub="Rules + anomaly model"
          />
          <ChevronRight />
          <ArchNode
            icon={<BarChart3 />}
            title="SOC console"
            sub="Evidence & response"
          />
        </div>
      </section>
      <footer>
        <Brand />
        <p>Passive by architecture. Explainable by design.</p>
        <span>SentinelFlow prototype · 2026</span>
      </footer>
    </main>
  );
}
function ArchNode({
  icon,
  title,
  sub,
}: {
  icon: any;
  title: string;
  sub: string;
}) {
  return (
    <div className="arch-node">
      {icon}
      <strong>{title}</strong>
      <small>{sub}</small>
    </div>
  );
}
export function Brand() {
  return (
    <span className="brand">
      <span className="brand-mark" aria-hidden="true">
        <img src="/assets/sentinelflow-logo.png" alt="" />
      </span>
      <b>SentinelFlow</b>
    </span>
  );
}

export function Login({ setAuth }: PageProps) {
  const nav = useNavigate();
  const [email, setEmail] = useState("analyst@sentinelflow.demo");
  const [password, setPassword] = useState("Sentinel123!");
  const [show, setShow] = useState(false);
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState("");
  async function submit(e: FormEvent) {
    e.preventDefault();
    setBusy(true);
    setErr("");
    try {
      const r = await login(email, password);
      localStorage.setItem("sf_token", r.access_token);
      localStorage.setItem("sf_user", JSON.stringify(r.user));
      setAuth(r.access_token, r.user);
      nav(new URLSearchParams(location.search).get("next") || "/soc");
    } catch (e) {
      setErr((e as Error).message);
    } finally {
      setBusy(false);
    }
  }
  return (
    <main className="login-page">
      <Link to="/" className="login-brand">
        <Brand />
      </Link>
      <section className="login-aside">
        <Badge tone="info">STRICTLY ONE-WAY</Badge>
        <h1>
          Operate with clarity,
          <br />
          even in the dark.
        </h1>
        <p>
          Investigate threats using passive metadata, deterministic evidence,
          and no return-channel assumptions.
        </p>
        <div className="login-architecture">
          <span>PRODUCTION</span>
          <ArrowRight />
          <b>DATA DIODE</b>
          <ArrowRight />
          <span>MONITORING ENCLAVE</span>
        </div>
      </section>
      <section className="login-card">
        <div>
          <span className="eyebrow">SECURE ACCESS</span>
          <h2>Enter the operations center</h2>
          <p>Use your SentinelFlow credentials to continue.</p>
        </div>
        {err && (
          <div className="form-error" role="alert">
            {err}
          </div>
        )}
        <form onSubmit={submit}>
          <label>
            Email address
            <input
              type="email"
              autoComplete="username"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </label>
          <label>
            Password
            <div className="password">
              <input
                type={show ? "text" : "password"}
                autoComplete="current-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
              <button
                type="button"
                onClick={() => setShow((x) => !x)}
                aria-label={show ? "Hide password" : "Show password"}
              >
                <Eye size={18} />
              </button>
            </div>
          </label>
          <button className="btn wide" disabled={busy}>
            {busy ? "Authenticating…" : "Access SOC Console"}{" "}
            {!busy && <ArrowRight size={17} />}
          </button>
        </form>
        <div className="demo-credentials">
          <strong>Demo access</strong>
          <span>analyst@sentinelflow.demo</span>
          <span>Sentinel123!</span>
        </div>
        <p className="auth-note">
          <LockKeyhole size={13} /> JWT session · Role-based access · Audit
          logged
        </p>
      </section>
    </main>
  );
}

export function Dashboard() {
  const { data, error, reload } = useData<any>("/api/dashboard");
  if (error) return <ErrorState message={error} retry={reload} />;
  if (!data) return <Loading label="Connecting to simulated telemetry" />;
  const m = data.metrics;
  return (
    <>
      <PageHead
        title="Unidirectional Threat Operations Center"
        description="Passive, metadata-only detection across one-way sensor telemetry."
        actions={
          <Badge
            tone={data.stream.status === "running" ? "healthy" : "medium"}
          >
            {data.label}
          </Badge>
        }
      />
      <div className="metric-grid eight">
        <Metric
          label="Packets observed"
          value={fmt(m.packets_observed)}
          delta="+12.4%"
        />
        <Metric
          label="Active flows"
          value={fmt(m.active_flows)}
          delta="+3.1%"
        />
        <Metric
          label="Threats detected"
          value={m.threats_detected}
          tone="amber"
        />
        <Metric label="Critical alerts" value={m.critical_alerts} tone="red" />
        <Metric
          label="Detection latency"
          value={m.detection_latency_ms}
          unit=" ms"
        />
        <Metric
          label="Stream throughput"
          value={fmt(m.throughput_fps)}
          unit=" fps"
        />
        <Metric
          label="Sensor health"
          value={oneDecimal(m.sensor_health)}
          unit="%"
          tone="green"
        />
        <Metric
          label="Model confidence"
          value={oneDecimal(m.model_confidence)}
          unit="%"
        />
      </div>
      <div className="dashboard-grid">
        <Panel
          title="Traffic volume"
          subtitle="Observed throughput · Mbps"
          className="span2"
          action={<Badge tone="healthy">BASELINE STABLE</Badge>}
        >
          <Sparkline
            values={data.analytics.traffic.map((x: any) => x.mbps)}
            label="Traffic volume in megabits per second"
          />
          <div className="axis-labels">
            {data.analytics.traffic.map((x: any) => (
              <span key={x.label}>{x.label}</span>
            ))}
          </div>
        </Panel>
        <Panel title="Current threat level" subtitle="Ensemble risk posture">
          <div className="threat-level">
            <ShieldAlert />
            <span>HIGH</span>
            <strong>78</strong>
            <small>/100 risk index</small>
            <p>3 critical signals across 2 sensors.</p>
          </div>
        </Panel>
        <Panel title="Threat distribution" subtitle="Alerts by class">
          <Donut data={data.analytics.categories} />
        </Panel>
        <Panel
          title="Live alert feed"
          subtitle="Simulated stream · newest first"
          className="span2"
          action={
            <Link to="/alerts" className="text-link">
              View all <ArrowRight size={14} />
            </Link>
          }
        >
          <AlertList alerts={data.alerts.slice(0, 5)} />
        </Panel>
        <Panel title="Protocol distribution" subtitle="Share of observed flows">
          <Bars data={data.analytics.protocols} unit="%" />
        </Panel>
        <Panel title="Top risky entities" subtitle="Passive entity profiles">
          <div className="entity-list">
            {data.top_entities.map((e: any, i: number) => (
              <div key={e.entity}>
                <span className="rank">0{i + 1}</span>
                <code>{e.entity}</code>
                <Risk value={e.risk} />
                <small>{e.flows} flows</small>
              </div>
            ))}
          </div>
        </Panel>
        <Panel
          title="Detection latency"
          subtitle="P50 / P95 · milliseconds"
          className="span2"
        >
          <Sparkline
            values={data.analytics.latency.map((x: any) => x.p95)}
            color="#a78bfa"
            label="P95 detection latency in milliseconds"
          />
        </Panel>
      </div>
    </>
  );
}
function AlertList({ alerts }: { alerts: Alert[] }) {
  return (
    <div className="alert-list">
      {alerts.map((a) => (
        <Link to={`/alerts/${a.alert_id}`} key={a.alert_id}>
          <span className={`alert-icon ${a.severity.toLowerCase()}`}>
            <AlertOctagon size={17} />
          </span>
          <div>
            <strong>{labelize(a.threat_class)}</strong>
            <small>
              <code>{a.source.ip}</code> → <code>{a.destination.ip}</code>
            </small>
          </div>
          <div>
            <Severity value={a.severity} />
            <time>{when(a.timestamp)}</time>
          </div>
        </Link>
      ))}
    </div>
  );
}

export function Monitor() {
  const { data } = useData<any>("/api/traffic/live?limit=40");
  const [items, setItems] = useState<Flow[]>([]);
  const [running, setRunning] = useState(false);
  const [scenario, setScenario] = useState("mixed");
  const [protocol, setProtocol] = useState("");
  const [severity, setSeverity] = useState("");
  const [search, setSearch] = useState("");
  const [speed, setSpeed] = useState(1);
  const [notice, setNotice] = useState<Alert | null>(null);
  useEffect(() => {
    if (data) setItems(data.items);
  }, [data]);
  useEffect(() => {
    if (!running) return;
    const token = localStorage.getItem("sf_token");
    let polling: number | undefined;
    let pollCursor = 0;
    let stopped = false;
    const mapping: Record<string, string> = {
      benign: "BENIGN",
      syn_flood: "DDOS",
      udp_amplification: "DDOS",
      botnet: "BOTNET_C2",
      dns_tunnel: "DNS_TUNNELING",
      encrypted_malware: "ENCRYPTED_MALWARE",
      exfiltration: "DATA_EXFILTRATION",
    };
    const startPolling = () => {
      if (polling || stopped) return;
      const poll = async () => {
        try {
          const response = await api<{ items: Flow[] }>(
            "/api/traffic/live?limit=100",
          );
          const candidates =
            scenario === "mixed"
              ? response.items
              : response.items.filter(
                  (flow) => flow.classification === mapping[scenario],
                );
          if (candidates.length) {
            const flow = candidates[pollCursor % candidates.length];
            pollCursor += 1;
            setItems((current) => [flow, ...current].slice(0, 60));
          }
        } catch {
          // Existing page-level authentication and error recovery handles failures.
        }
      };
      void poll();
      polling = window.setInterval(poll, Math.max(250, 900 / speed));
    };
    if (apiBase.includes("vercel.app")) {
      startPolling();
      return () => {
        stopped = true;
        if (polling) window.clearInterval(polling);
      };
    }
    const socketBase = apiBase || `${location.protocol}//${location.host}`;
    const url = `${socketBase.replace(/^http/, "ws")}/api/stream?token=${token}`;
    const ws = new WebSocket(url);
    ws.onopen = () => ws.send("subscribe");
    ws.onmessage = (e) => {
      const msg = JSON.parse(e.data);
      if (msg.flow) setItems((x) => [msg.flow, ...x].slice(0, 60));
      if (msg.alert && ["CRITICAL", "HIGH"].includes(msg.alert.severity))
        setNotice(msg.alert);
    };
    ws.onerror = startPolling;
    ws.onclose = startPolling;
    return () => {
      stopped = true;
      ws.close();
      if (polling) window.clearInterval(polling);
    };
  }, [running, scenario, speed]);
  async function control(action: string) {
    await api(`/api/replay/${action}`, { method: "POST" });
    setRunning(action === "start");
    if (action === "reset") {
      setItems(data?.items || []);
      setNotice(null);
    }
  }
  async function changeScenario(v: string) {
    setScenario(v);
    await api("/api/replay/scenario", {
      method: "POST",
      body: JSON.stringify({ scenario: v, speed }),
    });
  }
  const filtered = items.filter(
    (f) =>
      (!protocol || f.protocol === protocol) &&
      (!severity || f.severity === severity) &&
      (!search ||
        JSON.stringify(f).toLowerCase().includes(search.toLowerCase())),
  );
  return (
    <>
      <PageHead
        eyebrow="SIMULATED TELEMETRY"
        title="Live Traffic Monitor"
        description="Bounded, one-way packet and flow metadata. No traffic is sent to monitored hosts."
        actions={
          <Badge tone={running ? "healthy" : "medium"}>
            {running ? "SIMULATION RUNNING" : "SIMULATION PAUSED"}
          </Badge>
        }
      />
      {notice && (
        <div className="critical-banner">
          <AlertOctagon />
          <div>
            <strong>
              {labelize(notice.threat_class)} detected ·{" "}
              {percent(notice.confidence)}% confidence
            </strong>
            <span>{notice.evidence[0]?.explanation}</span>
          </div>
          <Link
            className="btn danger compact"
            to={`/alerts/${notice.alert_id}`}
          >
            Investigate
          </Link>
          <button aria-label="Dismiss alert" onClick={() => setNotice(null)}>
            ×
          </button>
        </div>
      )}
      <Panel className="control-panel">
        <div className="controls">
          <button
            className="btn compact"
            onClick={() => control("start")}
            disabled={running}
          >
            <Play size={15} /> {items.length ? "Resume" : "Start"}
          </button>
          <button
            className="btn secondary compact"
            onClick={() => control("pause")}
            disabled={!running}
          >
            <CirclePause size={15} /> Pause
          </button>
          <button
            className="btn ghost compact"
            onClick={() => control("reset")}
          >
            <RotateCcw size={15} /> Reset
          </button>
          <label>
            Scenario
            <select
              value={scenario}
              onChange={(e) => changeScenario(e.target.value)}
            >
              {scenarios.map(([v, n]) => (
                <option key={v} value={v}>
                  {n}
                </option>
              ))}
            </select>
          </label>
          <label>
            Speed
            <select
              value={speed}
              onChange={(e) => setSpeed(Number(e.target.value))}
            >
              {[0.5, 1, 2, 4, 8].map((v) => (
                <option key={v} value={v}>
                  {v}×
                </option>
              ))}
            </select>
          </label>
          <label>
            Protocol
            <select
              value={protocol}
              onChange={(e) => setProtocol(e.target.value)}
            >
              <option value="">All</option>
              {["TCP", "UDP", "DNS", "QUIC"].map((x) => (
                <option key={x}>{x}</option>
              ))}
            </select>
          </label>
          <label>
            Severity
            <select
              value={severity}
              onChange={(e) => setSeverity(e.target.value)}
            >
              <option value="">All</option>
              {["critical", "high", "medium", "low"].map((x) => (
                <option key={x}>{x}</option>
              ))}
            </select>
          </label>
          <label className="search-field">
            <Search size={15} />
            <input
              aria-label="Search traffic"
              placeholder="IP, flow, sensor…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </label>
        </div>
      </Panel>
      <div className="live-metrics">
        <Metric
          label="Packets / second"
          value={running ? "18,420" : "0"}
          unit=" pps"
        />
        <Metric
          label="Throughput"
          value={running ? "842.7" : "0"}
          unit=" Mbps"
        />
        <Metric label="Observed flows" value={filtered.length} />
        <Metric
          label="High risk"
          value={filtered.filter((x) => x.risk >= 75).length}
          tone="red"
        />
      </div>
      <Panel
        title="Observed metadata feed"
        subtitle={`${filtered.length} bounded records · static snapshot available when paused`}
        action={
          <button
            className="btn ghost compact"
            onClick={() => setRunning(false)}
          >
            <CirclePause size={15} /> Snapshot mode
          </button>
        }
      >
        <FlowTable flows={filtered.slice(0, 50)} />
      </Panel>
    </>
  );
}

function FlowTable({
  flows,
  onSelect,
}: {
  flows: Flow[];
  onSelect?: (f: Flow) => void;
}) {
  if (!flows.length)
    return (
      <Empty
        title="No traffic received"
        body="Start a simulation or adjust the active filters."
      />
    );
  return (
    <div className="table-wrap">
      <table>
        <thead>
          <tr>
            <th>Time</th>
            <th>Flow</th>
            <th>Source → destination</th>
            <th>Proto</th>
            <th>Packets</th>
            <th>Bytes</th>
            <th>Direction</th>
            <th>Risk</th>
            <th>Classification</th>
          </tr>
        </thead>
        <tbody>
          {flows.map((f, index) => (
            <tr
              key={`${f.flow_id}-${index}`}
              tabIndex={onSelect ? 0 : undefined}
              onClick={() => onSelect?.(f)}
              onKeyDown={(e) => e.key === "Enter" && onSelect?.(f)}
            >
              <td>
                <time>{when(f.timestamp)}</time>
              </td>
              <td>
                <code>{f.flow_id}</code>
              </td>
              <td>
                <code>
                  {f.src_ip}:{f.src_port}
                </code>
                <span className="arrow">→</span>
                <code>
                  {f.dst_ip}:{f.dst_port}
                </code>
              </td>
              <td>
                <Badge tone="neutral">{f.protocol}</Badge>
              </td>
              <td>{fmt(f.packets)}</td>
              <td>{fmt(f.bytes)}</td>
              <td>{f.direction.replace("observed_", "")}</td>
              <td>
                <Risk value={f.risk} />
              </td>
              <td>
                <Badge
                  tone={
                    f.risk >= 75
                      ? "high"
                      : f.classification === "BENIGN"
                        ? "healthy"
                        : "medium"
                  }
                >
                  {labelize(f.classification)}
                </Badge>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export function Alerts() {
  const { data, error, reload } = useData<any>("/api/alerts");
  const [sev, setSev] = useState("");
  const [exported, setExported] = useState(false);
  if (error) return <ErrorState message={error} retry={reload} />;
  if (!data) return <Loading />;
  const alerts: Alert[] = data.items.filter(
    (a: Alert) => !sev || a.severity === sev,
  );
  function exportAlerts() {
    downloadCsv(
      `sentinelflow-alerts-${new Date().toISOString().slice(0, 10)}.csv`,
      [
        "Alert ID",
        "Timestamp",
        "Threat class",
        "Severity",
        "Confidence",
        "Source IP",
        "Source port",
        "Destination IP",
        "Destination port",
        "Protocol",
        "Sensor",
        "Status",
        "Primary evidence",
        "Model",
        "Model mode",
      ],
      alerts.map((a) => [
        a.alert_id,
        a.timestamp,
        a.threat_class,
        a.severity,
        a.confidence,
        a.source.ip,
        a.source.port,
        a.destination.ip,
        a.destination.port,
        a.protocol,
        a.sensor_id,
        a.status,
        a.evidence[0]?.explanation ?? "",
        `${a.model.name} ${a.model.version}`,
        a.model.mode,
      ]),
    );
    setExported(true);
    window.setTimeout(() => setExported(false), 3000);
  }
  return (
    <>
      <PageHead
        title="Alert Investigation Queue"
        description="Prioritized passive-metadata detections awaiting analyst disposition."
        actions={
          <button className="btn secondary" onClick={exportAlerts}>
            {exported ? <Check size={15} /> : <Download size={15} />}
            {exported ? `Exported ${alerts.length} alerts` : "Export CSV"}
          </button>
        }
      />
      <span className="sr-only" role="status" aria-live="polite">
        {exported ? `${alerts.length} alerts exported as CSV.` : ""}
      </span>
      <div className="filterbar">
        <Filter size={16} />
        <button className={!sev ? "active" : ""} onClick={() => setSev("")}>
          All <b>{data.total}</b>
        </button>
        {["CRITICAL", "HIGH", "MEDIUM", "LOW"].map((x) => (
          <button
            key={x}
            className={sev === x ? "active" : ""}
            onClick={() => setSev(x)}
          >
            {x}{" "}
            <b>{data.items.filter((a: Alert) => a.severity === x).length}</b>
          </button>
        ))}
      </div>
      <Panel>
        {alerts.length ? (
          <div className="alert-table">
            {alerts.map((a) => (
              <Link to={`/alerts/${a.alert_id}`} key={a.alert_id}>
                <Severity value={a.severity} />
                <div>
                  <strong>{labelize(a.threat_class)}</strong>
                  <span>{a.evidence[0]?.explanation}</span>
                  <small>
                    <code>{a.source.ip}</code> → <code>{a.destination.ip}</code>
                  </small>
                </div>
                <div className="confidence">
                  <span>Confidence</span>
                  <b>{percent(a.confidence)}%</b>
                  <i>
                    <em style={{ width: `${a.confidence * 100}%` }} />
                  </i>
                </div>
                <Badge tone="neutral">{labelize(a.status)}</Badge>
                <ChevronRight size={18} />
              </Link>
            ))}
          </div>
        ) : (
          <Empty
            title="No alerts match"
            body="Change the severity filter to review other detections."
          />
        )}
      </Panel>
    </>
  );
}

export function AlertDetail() {
  const { id } = useParams();
  const { data: a, error } = useData<Alert>(`/api/alerts/${id}`);
  const [note, setNote] = useState("");
  const [saved, setSaved] = useState(false);
  const [alertStatus, setAlertStatus] = useState("");
  const [statusBusy, setStatusBusy] = useState(false);
  const [statusMessage, setStatusMessage] = useState("");
  useEffect(() => {
    if (a) setAlertStatus(a.status);
  }, [a]);
  if (error) return <ErrorState message={error} />;
  if (!a) return <Loading label="Loading alert evidence" />;
  async function saveNote() {
    if (!note.trim()) return;
    await api(`/api/alerts/${a!.alert_id}/notes`, {
      method: "POST",
      body: JSON.stringify({ notes: note }),
    });
    setSaved(true);
    setNote("");
  }
  async function markInvestigating() {
    setStatusBusy(true);
    setStatusMessage("");
    try {
      await api(`/api/alerts/${a!.alert_id}/status`, {
        method: "POST",
        body: JSON.stringify({ status: "investigating" }),
      });
      setAlertStatus("investigating");
      setStatusMessage("Alert is now assigned for investigation.");
    } catch (error) {
      setStatusMessage((error as Error).message);
    } finally {
      setStatusBusy(false);
    }
  }
  return (
    <>
      <div className="breadcrumb">
        <Link to="/alerts">Alerts</Link>
        <ChevronRight size={14} />
        <span>{a.alert_id}</span>
      </div>
      <PageHead
        eyebrow={`${a.alert_id} · ${a.sensor_id}`}
        title={labelize(a.threat_class)}
        description={`${a.source.ip}:${a.source.port} → ${a.destination.ip}:${a.destination.port}`}
        actions={
          <>
            <Severity value={a.severity} />
            <Badge tone="demo">{a.model.mode.toUpperCase()} MODEL</Badge>
          </>
        }
      />
      <div className="detail-grid">
        <div className="detail-main">
          <Panel>
            <div className="confidence-hero">
              <div>
                <span>Detection confidence</span>
                <strong>
                  {percent(a.confidence)}
                  <small>%</small>
                </strong>
                <p>
                  {a.model.name} · {a.model.version}
                </p>
              </div>
              <div
                className="confidence-ring"
                style={{ "--score": `${a.confidence * 360}deg` } as any}
              >
                <b>{a.severity}</b>
                <small>severity</small>
              </div>
            </div>
          </Panel>
          <Panel
            title="Why was this detected?"
            subtitle="Feature contributions from one-way metadata only"
          >
            <div className="evidence-list">
              {a.evidence.map((e) => (
                <article key={e.feature}>
                  <div>
                    <strong>{labelize(e.feature)}</strong>
                    <span>{e.explanation}</span>
                  </div>
                  <div className="evidence-values">
                    <b>
                      {typeof e.value === "number" ? fmt(e.value) : e.value}
                    </b>
                    <small>baseline {e.baseline}</small>
                  </div>
                  <div className="contribution">
                    <i style={{ width: `${e.contribution * 100}%` }} />
                    <span>{percent(e.contribution)}% contribution</span>
                  </div>
                </article>
              ))}
            </div>
            <div className="privacy-callout">
              <ShieldCheck size={18} />
              <p>
                <strong>No payload contents were inspected.</strong> This
                finding uses timestamps, endpoints, sizes, flags, fingerprints,
                and temporal behavior visible at the passive sensor.
              </p>
            </div>
          </Panel>
          <Panel
            title="Flow timeline"
            subtitle="Observed packets across the detection window"
          >
            <Sparkline
              values={[12, 18, 16, 42, 78, 96, 71, 54, 86, 92, 66, 40]}
              label="Packets over flow timeline"
            />
            <div className="axis-labels">
              <span>First seen</span>
              <span>Detection window</span>
              <span>Last seen</span>
            </div>
          </Panel>
          <Panel title="Analyst notes">
            <div className="notes">
              {a.notes.map((n, i) => (
                <div key={i}>
                  <strong>{n.author}</strong>
                  <time>{when(n.timestamp)}</time>
                  <p>{n.text}</p>
                </div>
              ))}
              {saved && <Badge tone="healthy">NOTE SAVED</Badge>}
              <label>
                Add investigation note
                <textarea
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                  placeholder="Record evidence, asset-owner contact, or disposition…"
                />
              </label>
              <button className="btn compact" onClick={saveNote}>
                Save note
              </button>
            </div>
          </Panel>
        </div>
        <aside>
          <Panel title="Observed flow">
            <dl className="kv">
              <div>
                <dt>First seen</dt>
                <dd>{when(a.first_seen)}</dd>
              </div>
              <div>
                <dt>Last seen</dt>
                <dd>{when(a.last_seen)}</dd>
              </div>
              <div>
                <dt>Protocol</dt>
                <dd>{a.protocol}</dd>
              </div>
              <div>
                <dt>Packets</dt>
                <dd>{fmt(a.packet_count)}</dd>
              </div>
              <div>
                <dt>Bytes</dt>
                <dd>{fmt(a.byte_count)}</dd>
              </div>
              <div>
                <dt>Status</dt>
                <dd>{labelize(alertStatus || a.status)}</dd>
              </div>
              <div>
                <dt>Schema</dt>
                <dd>{a.model.feature_schema}</dd>
              </div>
            </dl>
          </Panel>
          <Panel title="Recommended next steps">
            <p className="recommendation">{a.recommended_action}</p>
            <ol className="steps">
              <li>Validate the host owner independently.</li>
              <li>Compare with asset change windows.</li>
              <li>Review adjacent sensor telemetry.</li>
              <li>Escalate via approved administrative channel.</li>
            </ol>
            <button
              className="btn wide"
              onClick={markInvestigating}
              disabled={statusBusy || alertStatus === "investigating"}
            >
              {statusBusy ? (
                <>
                  <RefreshCw className="spin" size={15} /> Updating…
                </>
              ) : alertStatus === "investigating" ? (
                <>
                  <Check size={15} /> Investigation active
                </>
              ) : (
                "Mark investigating"
              )}
            </button>
            <span className="action-feedback" role="status" aria-live="polite">
              {statusMessage}
            </span>
          </Panel>
          <Panel title="Similar alerts">
            <div className="similar">
              {a.similar_alerts?.map((id) => (
                <Link to={`/alerts/${id}`} key={id}>
                  {id}
                  <ChevronRight size={14} />
                </Link>
              ))}
            </div>
          </Panel>
        </aside>
      </div>
    </>
  );
}

export function Flows() {
  const { data } = useData<any>("/api/flows?limit=100");
  const [searchParams] = useSearchParams();
  const [query, setQuery] = useState(searchParams.get("search") ?? "");
  const [protocol, setProtocol] = useState("");
  const [classification, setClass] = useState("");
  const [selected, setSelected] = useState<Flow | null>(null);
  const [moreFilters, setMoreFilters] = useState(false);
  const [minRisk, setMinRisk] = useState(0);
  const [direction, setDirection] = useState("");
  const [sensor, setSensor] = useState("");
  const [exported, setExported] = useState(false);
  useEffect(() => {
    const requested = searchParams.get("search");
    if (requested !== null) setQuery(requested);
  }, [searchParams]);
  const flows: Flow[] = (data?.items || []).filter(
    (f: Flow) =>
      (!query ||
        JSON.stringify(f).toLowerCase().includes(query.toLowerCase())) &&
      (!protocol || f.protocol === protocol) &&
      (!classification || f.classification === classification) &&
      f.risk >= minRisk &&
      (!direction || f.direction === direction) &&
      (!sensor || f.sensor_id === sensor),
  );
  function exportFlows() {
    downloadCsv(
      `sentinelflow-flows-${new Date().toISOString().slice(0, 10)}.csv`,
      [
        "Flow ID",
        "Timestamp",
        "Sensor",
        "Source",
        "Destination",
        "Protocol",
        "Destination port",
        "Packets",
        "Bytes",
        "Duration ms",
        "Direction",
        "Risk",
        "Classification",
      ],
      flows.map((flow) => [
        flow.flow_id,
        flow.timestamp,
        flow.sensor_id,
        `${flow.src_ip}:${flow.src_port}`,
        `${flow.dst_ip}:${flow.dst_port}`,
        flow.protocol,
        flow.dst_port,
        flow.packets,
        flow.bytes,
        flow.duration_ms,
        flow.direction,
        flow.risk,
        flow.classification,
      ]),
    );
    setExported(true);
    window.setTimeout(() => setExported(false), 3000);
  }
  return (
    <>
      <PageHead
        title="Flow Explorer"
        description="Search reconstructed one-way flows and inspect their evidence footprint."
        actions={
          <button className="btn secondary" onClick={exportFlows}>
            {exported ? <Check size={15} /> : <Download size={15} />}
            {exported ? `Exported ${flows.length} flows` : "Export metadata"}
          </button>
        }
      />
      <Panel className="control-panel">
        <div className="controls flow-controls">
          <label className="search-field">
            <Search size={15} />
            <input
              aria-label="Search flows"
              placeholder="Flow ID, IP, port, sensor…"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
            />
          </label>
          <label>
            Protocol
            <select
              value={protocol}
              onChange={(e) => setProtocol(e.target.value)}
            >
              <option value="">All protocols</option>
              {["TCP", "UDP", "DNS", "QUIC"].map((x) => (
                <option key={x}>{x}</option>
              ))}
            </select>
          </label>
          <label>
            Threat class
            <select
              value={classification}
              onChange={(e) => setClass(e.target.value)}
            >
              <option value="">All classes</option>
              {[
                "DDOS",
                "BOTNET_C2",
                "DNS_TUNNELING",
                "ENCRYPTED_MALWARE",
                "DATA_EXFILTRATION",
                "BENIGN",
                "UNKNOWN_ANOMALY",
              ].map((x) => (
                <option key={x} value={x}>
                  {labelize(x)}
                </option>
              ))}
            </select>
          </label>
          <button
            className="btn ghost compact"
            aria-expanded={moreFilters}
            aria-controls="advanced-flow-filters"
            onClick={() => setMoreFilters((open) => !open)}
          >
            <SlidersHorizontal size={15} /> More filters
          </button>
        </div>
        {moreFilters && (
          <div className="advanced-filters" id="advanced-flow-filters">
            <label>
              Minimum risk <strong>{minRisk}</strong>
              <input
                type="range"
                min="0"
                max="100"
                value={minRisk}
                onChange={(event) => setMinRisk(Number(event.target.value))}
              />
            </label>
            <label>
              Direction
              <select
                value={direction}
                onChange={(event) => setDirection(event.target.value)}
              >
                <option value="">All directions</option>
                <option value="observed_outbound">Observed outbound</option>
                <option value="observed_inbound">Observed inbound</option>
              </select>
            </label>
            <label>
              Sensor
              <select
                value={sensor}
                onChange={(event) => setSensor(event.target.value)}
              >
                <option value="">All sensors</option>
                {["DIODE-SENSOR-01", "DIODE-SENSOR-02", "DIODE-SENSOR-03"].map(
                  (item) => (
                    <option key={item}>{item}</option>
                  ),
                )}
              </select>
            </label>
            <button
              className="btn ghost compact"
              onClick={() => {
                setMinRisk(0);
                setDirection("");
                setSensor("");
              }}
            >
              <RotateCcw size={14} /> Clear advanced filters
            </button>
          </div>
        )}
      </Panel>
      <Panel
        title="Reconstructed flows"
        subtitle={`${flows.length} of ${data?.total || 0} records · bounded result set`}
      >
        <FlowTable flows={flows} onSelect={setSelected} />
      </Panel>
      {selected && (
        <div className="drawer-scrim" onClick={() => setSelected(null)}>
          <aside
            className="flow-drawer"
            role="dialog"
            aria-modal="true"
            aria-labelledby="flow-title"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              className="drawer-close"
              aria-label="Close evidence panel"
              onClick={() => setSelected(null)}
            >
              ×
            </button>
            <span className="eyebrow">FLOW EVIDENCE</span>
            <h2 id="flow-title">{selected.flow_id}</h2>
            <Badge tone={selected.risk >= 75 ? "high" : "healthy"}>
              {labelize(selected.classification)}
            </Badge>
            <dl className="kv">
              <div>
                <dt>Source</dt>
                <dd>
                  <code>
                    {selected.src_ip}:{selected.src_port}
                  </code>
                </dd>
              </div>
              <div>
                <dt>Destination</dt>
                <dd>
                  <code>
                    {selected.dst_ip}:{selected.dst_port}
                  </code>
                </dd>
              </div>
              <div>
                <dt>Sensor</dt>
                <dd>{selected.sensor_id}</dd>
              </div>
              <div>
                <dt>Direction</dt>
                <dd>{selected.direction}</dd>
              </div>
              <div>
                <dt>Duration</dt>
                <dd>{fmt(selected.duration_ms)} ms</dd>
              </div>
              <div>
                <dt>Risk</dt>
                <dd>{selected.risk}/100</dd>
              </div>
            </dl>
            <div className="privacy-callout">
              <Shield size={18} />
              <p>
                Reconstructed from one-way observed metadata. No handshake or
                response state required.
              </p>
            </div>
            <Link
              className="btn wide"
              to={`/alerts/${data?.items.find((f: Flow) => f.flow_id === selected.flow_id)?.alert_id || "ALT-2026-00421"}`}
            >
              Open related alert
            </Link>
          </aside>
        </div>
      )}
    </>
  );
}

export function Analytics() {
  const { data } = useData<any>("/api/analytics");
  const [range, setRange] = useState("24h");
  const [exported, setExported] = useState(false);
  if (!data) return <Loading label="Calculating deterministic analytics" />;
  function exportAnalytics() {
    downloadCsv(
      `sentinelflow-analytics-${range}-${new Date().toISOString().slice(0, 10)}.csv`,
      [
        "Time",
        "Alerts",
        "Alert baseline",
        "Traffic Mbps",
        "Traffic baseline Mbps",
        "P50 latency ms",
        "P95 latency ms",
      ],
      data.trend.map((item: any, index: number) => [
        item.label,
        item.alerts,
        item.baseline,
        data.traffic[index]?.mbps,
        data.traffic[index]?.baseline,
        data.latency[index]?.p50,
        data.latency[index]?.p95,
      ]),
    );
    setExported(true);
    window.setTimeout(() => setExported(false), 3000);
  }
  return (
    <>
      <PageHead
        title="Threat Analytics"
        description="Deterministic trends, baselines, latency, and model quality across the selected period."
        actions={
          <>
            <select
              aria-label="Analytics time range"
              value={range}
              onChange={(event) => setRange(event.target.value)}
            >
              <option value="24h">Last 24 hours</option>
              <option value="7d">Last 7 days</option>
            </select>
            <button className="btn secondary" onClick={exportAnalytics}>
              {exported ? <Check size={15} /> : <Download size={15} />}
              {exported ? "Report exported" : "Export report"}
            </button>
          </>
        }
      />
      <div className="metric-grid">
        <Metric label="False-positive rate" value="3.7" unit="%" />
        <Metric label="Mean detection latency" value="42" unit=" ms" />
        <Metric label="Sustained throughput" value="9.6k" unit=" fps" />
        <Metric label="Alerts / sensor" value="14.0" />
      </div>
      <div className="dashboard-grid">
        <Panel
          className="span2"
          title="Detection trend"
          subtitle="Alerts vs expected baseline · 3-hour intervals"
        >
          <Sparkline
            values={data.trend.map((x: any) => x.alerts)}
            label="Alert detections over time"
          />
          <div className="axis-labels">
            {data.trend.map((x: any) => (
              <span key={x.label}>{x.label}</span>
            ))}
          </div>
        </Panel>
        <Panel
          title="Threat categories"
          subtitle="Share of malicious detections"
        >
          <Donut data={data.categories} />
        </Panel>
        <Panel title="Protocol distribution" subtitle="Observed flow share">
          <Bars data={data.protocols} unit="%" />
        </Panel>
        <Panel
          className="span2"
          title="Baseline versus current"
          subtitle="Throughput · Mbps"
        >
          <div className="compare-chart">
            <Sparkline
              values={data.traffic.map((x: any) => x.mbps)}
              label="Current throughput"
            />
            <Sparkline
              values={data.traffic.map((x: any) => x.baseline)}
              color="#64748b"
              label="Baseline throughput"
            />
          </div>
          <div className="chart-legend">
            <span>
              <i className="cyan" />
              Current
            </span>
            <span>
              <i className="slate" />
              Baseline
            </span>
          </div>
        </Panel>
        <Panel
          title="Confidence distribution"
          subtitle="Alerts per confidence band"
        >
          <Bars
            data={data.confidence}
            labelKey="range"
            valueKey="count"
            color="purple"
          />
        </Panel>
        <Panel title="Top targeted assets" subtitle="Detections by destination">
          <Bars
            data={[
              { name: "10.10.4.28", value: 31 },
              { name: "10.10.7.91", value: 24 },
              { name: "10.10.2.44", value: 18 },
              { name: "10.10.6.17", value: 11 },
            ]}
            color="amber"
          />
        </Panel>
        <Panel
          className="span2"
          title="Detection latency"
          subtitle="P50 and P95 · milliseconds"
        >
          <Sparkline
            values={data.latency.map((x: any) => x.p95)}
            color="#a78bfa"
            label="P95 detection latency"
          />
        </Panel>
      </div>
    </>
  );
}

export function Lab({ user }: { user: User | null }) {
  const { data, reload } = useData<any>("/api/model/status");
  const [changed, setChanged] = useState("");
  if (!data) return <Loading label="Loading detector registry" />;
  async function setThreshold(cls: string, v: number) {
    await api(`/api/model/detectors/${cls}/threshold`, {
      method: "POST",
      body: JSON.stringify({ threshold: v }),
    });
    setChanged(cls);
    reload();
  }
  return (
    <>
      <PageHead
        title="Detection Laboratory"
        description="Inspect detector features, windows, thresholds, and explainability behavior."
        actions={<Badge tone="demo">DEMO SETTINGS SANDBOX</Badge>}
      />
      <div className="lab-notice">
        <FlaskConical />
        <div>
          <strong>Production-safe configuration boundary</strong>
          <span>
            Threshold changes below affect deterministic demo runs only.
            Production configuration cannot be changed from this UI.
          </span>
        </div>
      </div>
      <div className="detector-grid">
        {data.detectors.map((d: any, i: number) => (
          <Panel
            key={d.threat_class}
            title={d.name}
            subtitle={labelize(d.threat_class)}
            action={<Badge tone="healthy">READY</Badge>}
          >
            <div className="detector-score">
              <Gauge />
              <strong>{percent(d.confidence)}%</strong>
              <span>last confidence</span>
            </div>
            <dl className="kv compact">
              <div>
                <dt>Input features</dt>
                <dd>
                  {
                    [
                      ["PPS · SYN ratio · concentration"],
                      ["Interval CV · rarity · repetition"],
                      ["Entropy · query length · uniqueness"],
                      ["JA4 rarity · periodic bursts · sizes"],
                      ["Byte ratio · rarity · duration"],
                      ["Isolation score · protocol shift"],
                    ][i]
                  }
                </dd>
              </div>
              <div>
                <dt>Window</dt>
                <dd>{d.window}</dd>
              </div>
              <div>
                <dt>Version</dt>
                <dd>{d.version}</dd>
              </div>
              <div>
                <dt>Last inference</dt>
                <dd>{when(d.last_inference)}</dd>
              </div>
            </dl>
            <label className="threshold">
              Demo threshold <strong>{percent(d.threshold)}%</strong>
              <input
                type="range"
                min="10"
                max="99"
                value={d.threshold * 100}
                disabled={user?.role !== "Administrator"}
                onChange={(e) =>
                  setThreshold(d.threat_class, Number(e.target.value) / 100)
                }
              />
            </label>
            {user?.role !== "Administrator" && (
              <small className="muted">
                Administrator role required to adjust.
              </small>
            )}
            {changed === d.threat_class && (
              <Badge tone="healthy">SAVED TO DEMO</Badge>
            )}
          </Panel>
        ))}
      </div>
    </>
  );
}

export function Simulator() {
  const [scenario, setScenario] = useState("mixed");
  const [running, setRunning] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [progress, setProgress] = useState(0);
  const timer = useRef<number | undefined>(undefined);
  const meta: { [k: string]: any } = {
    benign: [
      "Routine enterprise web and DNS traffic",
      "BENIGN",
      18,
      [31, 36, 29, 34],
    ],
    syn_flood: [
      "Concentrated SYN attempts toward critical services",
      "DDOS",
      96,
      [34, 88, 96, 91],
    ],
    udp_amplification: [
      "High-volume UDP toward a concentrated target",
      "DDOS",
      93,
      [30, 76, 94, 89],
    ],
    botnet: [
      "Regular small flows to a rare destination",
      "BOTNET C2",
      89,
      [23, 24, 25, 24],
    ],
    dns_tunnel: [
      "Long, high-entropy DNS subdomains",
      "DNS TUNNELING",
      92,
      [19, 36, 69, 91],
    ],
    encrypted_malware: [
      "Rare JA4 with periodic encrypted bursts",
      "ENCRYPTED MALWARE",
      87,
      [28, 51, 46, 84],
    ],
    exfiltration: [
      "Sustained outbound bytes beyond host baseline",
      "DATA EXFILTRATION",
      94,
      [30, 44, 78, 96],
    ],
    mixed: [
      "Coordinated signals across every detector",
      "MULTIPLE THREATS",
      97,
      [28, 63, 87, 96],
    ],
  };
  async function run() {
    await api("/api/replay/scenario", {
      method: "POST",
      body: JSON.stringify({ scenario, speed: 2 }),
    });
    await api("/api/replay/start", { method: "POST" });
    setRunning(true);
    setResult(null);
    setProgress(0);
    let p = 0;
    timer.current = window.setInterval(() => {
      p += 10;
      setProgress(p);
      if (p >= 100) {
        clearInterval(timer.current);
        setRunning(false);
        setResult({
          classification: meta[scenario][1],
          confidence: meta[scenario][2],
        });
      }
    }, 120);
  }
  useEffect(() => () => clearInterval(timer.current), []);
  return (
    <>
      <PageHead
        eyebrow="INTERACTIVE DEMONSTRATION"
        title="Traffic Replay & Simulator"
        description="Generate reproducible, clearly labelled metadata streams for every supported threat class."
        actions={<Badge tone="demo">SIMULATED — SEED 42017</Badge>}
      />
      <div className="sim-layout">
        <aside className="scenario-list">
          <h2>Scenarios</h2>
          {scenarios.map(([v, n]) => (
            <button
              key={v}
              className={scenario === v ? "active" : ""}
              onClick={() => {
                setScenario(v);
                setResult(null);
              }}
            >
              <span>
                <Network size={17} />
              </span>
              <div>
                <strong>{n}</strong>
                <small>{meta[v][0]}</small>
              </div>
              <ChevronRight size={16} />
            </button>
          ))}
        </aside>
        <div className="sim-main">
          <Panel>
            <div className="sim-hero">
              <div>
                <Badge tone={scenario === "benign" ? "healthy" : "high"}>
                  {scenario === "benign" ? "BASELINE" : "ATTACK SCENARIO"}
                </Badge>
                <h2>{scenarios.find((x) => x[0] === scenario)?.[1]}</h2>
                <p>
                  {meta[scenario][0]}. The simulator emits only timestamps,
                  endpoint metadata, sizes, flags, and observable DNS/TLS
                  fields.
                </p>
              </div>
              <button className="btn" onClick={run} disabled={running}>
                {running ? (
                  <RefreshCw className="spin" size={16} />
                ) : (
                  <Play size={16} />
                )}{" "}
                {running ? "Running detection…" : "Run detection"}
              </button>
            </div>
            {running && (
              <div className="pipeline-progress">
                <div className="progress-track">
                  <i style={{ width: `${progress}%` }} />
                </div>
                <span>
                  {progress < 30
                    ? "Generating metadata stream"
                    : progress < 60
                      ? "Reconstructing one-way flows"
                      : progress < 90
                        ? "Running detector ensemble"
                        : "Generating evidence"}{" "}
                  · {progress}%
                </span>
              </div>
            )}
          </Panel>
          <div className="comparison">
            <Panel title="Benign baseline" subtitle="Expected profile">
              <Sparkline
                values={[29, 32, 27, 34, 31, 33, 30]}
                color="#22c55e"
                label="Benign traffic baseline"
              />
              <dl className="kv compact">
                <div>
                  <dt>Packet rate</dt>
                  <dd>910 pps</dd>
                </div>
                <div>
                  <dt>Entropy</dt>
                  <dd>2.31 bits</dd>
                </div>
                <div>
                  <dt>Destination rarity</dt>
                  <dd>0.21</dd>
                </div>
              </dl>
            </Panel>
            <Panel title="Scenario telemetry" subtitle="Feature shift">
              <Sparkline
                values={meta[scenario][3]}
                color={scenario === "benign" ? "#22c55e" : "#f97316"}
                label="Scenario feature change"
              />
              <dl className="kv compact">
                <div>
                  <dt>Packet rate</dt>
                  <dd>{scenario.includes("flood") ? "18,420" : "1,284"} pps</dd>
                </div>
                <div>
                  <dt>Feature deviation</dt>
                  <dd>{scenario === "benign" ? "0.3σ" : "4.7σ"}</dd>
                </div>
                <div>
                  <dt>Risk index</dt>
                  <dd>{meta[scenario][2]}/100</dd>
                </div>
              </dl>
            </Panel>
          </div>
          {result ? (
            <Panel className="result-panel">
              <div className="result-icon">
                <ShieldAlert />
              </div>
              <div>
                <span>DETECTION COMPLETE</span>
                <h2>{labelize(result.classification)}</h2>
                <p>
                  {scenario === "benign"
                    ? "No malicious pattern crossed the ensemble threshold."
                    : "The passive metadata pattern crossed the deterministic demo ensemble threshold."}
                </p>
              </div>
              <div className="result-confidence">
                <strong>{oneDecimal(result.confidence)}%</strong>
                <span>confidence</span>
              </div>
              <div className="result-evidence">
                <strong>Primary evidence</strong>
                <p>
                  {scenario === "dns_tunnel"
                    ? "The DNS query contained an unusually long, high-entropy subdomain."
                    : scenario === "botnet"
                      ? "Traffic returned to the same destination at a highly regular 60-second interval."
                      : scenario === "exfiltration"
                        ? "Outbound traffic volume was 8.9 times higher than the established host baseline."
                        : "Observed feature behavior diverged materially from its deterministic baseline."}
                </p>
              </div>
              <Link to="/alerts/ALT-2026-00421" className="btn secondary">
                Open evidence view <ArrowRight size={15} />
              </Link>
            </Panel>
          ) : (
            !running && (
              <Empty
                title="No simulation running"
                body="Choose a scenario and run detection to inspect confidence and evidence."
              />
            )
          )}
        </div>
      </div>
    </>
  );
}

export function ModelOps() {
  const status = useData<any>("/api/model/status");
  const metrics = useData<any>("/api/model/metrics");
  if (!status.data || !metrics.data)
    return <Loading label="Loading model registry and metrics" />;
  const s = status.data,
    m = metrics.data;
  return (
    <>
      <PageHead
        title="Model Operations"
        description="Model lineage, evaluation fixtures, drift, and fallback readiness."
        actions={<Badge tone="demo">{s.mode.toUpperCase()} MODE</Badge>}
      />
      <div className="model-banner">
        <div>
          <span>ACTIVE INFERENCE</span>
          <h2>{s.name}</h2>
          <p>
            Version {s.version} · Feature schema {s.feature_schema} · Trained{" "}
            {s.training_date}
          </p>
        </div>
        <div>
          <Badge tone="healthy">FALLBACK {s.fallback.toUpperCase()}</Badge>
          <small>Last inference {when(s.last_inference)}</small>
        </div>
      </div>
      <div className="metric-grid">
        <Metric label="Offline accuracy" value={percent(m.accuracy)} unit="%" />
        <Metric label="Macro F1" value={percent(m.macro_f1)} unit="%" />
        <Metric
          label="False positive rate"
          value={percent(m.false_positive_rate)}
          unit="%"
        />
        <Metric label="Mean latency" value={m.mean_latency_ms} unit=" ms" />
      </div>
      <div className="dashboard-grid">
        <Panel
          className="span2"
          title="Per-class evaluation"
          subtitle={m.scope}
        >
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>Detection class</th>
                  <th>Precision</th>
                  <th>Recall</th>
                  <th>F1 score</th>
                </tr>
              </thead>
              <tbody>
                {m.per_class.map((x: any) => (
                  <tr key={x.class}>
                    <td>
                      <Badge tone="info">{labelize(x.class)}</Badge>
                    </td>
                    <td>{percent(x.precision)}%</td>
                    <td>{percent(x.recall)}%</td>
                    <td>
                      <Risk value={Number(percent(x.f1))} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Panel>
        <Panel title="Model drift" subtitle="Population stability index">
          <div className="drift">
            <Gauge />
            <strong>0.12</strong>
            <Badge tone="healthy">STABLE</Badge>
            <p>Below review threshold of 0.20.</p>
          </div>
        </Panel>
        <Panel
          title="Detection classes"
          subtitle={`${s.classes.length} supported labels`}
        >
          <div className="tag-cloud">
            {s.classes.map((x: string) => (
              <Badge key={x} tone={x === "BENIGN" ? "healthy" : "neutral"}>
                {labelize(x)}
              </Badge>
            ))}
          </div>
        </Panel>
        <Panel
          className="span2"
          title="Confusion matrix"
          subtitle="Rows: actual · columns: predicted"
        >
          <div className="matrix" aria-label="Confusion matrix">
            {m.confusion_matrix.flat().map((x: number, i: number) => (
              <span
                key={i}
                style={{ opacity: 0.35 + x / 150 }}
                title={`${x} samples`}
              >
                {x}
              </span>
            ))}
          </div>
        </Panel>
      </div>
      <div className="privacy-callout">
        <ShieldCheck />
        <p>
          <strong>Graceful production boundary:</strong> If production mode is
          enabled without a mounted model, the API returns a clear service error
          while the administrator can restore demo mode. It never silently
          presents demo inference as production.
        </p>
      </div>
    </>
  );
}

export function Sensors() {
  const { data, reload } = useData<any>("/api/sensors");
  const [refreshing, setRefreshing] = useState(false);
  const [lastChecked, setLastChecked] = useState("just now");
  if (!data) return <Loading label="Polling sensor health" />;
  function refreshSensors() {
    setRefreshing(true);
    reload();
    window.setTimeout(() => {
      setRefreshing(false);
      setLastChecked(new Date().toLocaleTimeString());
    }, 500);
  }
  return (
    <>
      <PageHead
        title="Sensor Health"
        description="Read-only data-diode receivers and bounded ingest buffers."
        actions={
          <button
            className="btn secondary"
            onClick={refreshSensors}
            disabled={refreshing}
          >
            <RefreshCw className={refreshing ? "spin" : ""} size={15} />
            {refreshing ? "Refreshing…" : `Refresh · ${lastChecked}`}
          </button>
        }
      />
      <div className="sensor-grid">
        {data.items.map((s: any) => (
          <Panel key={s.sensor_id}>
            <div className="sensor-head">
              <span className={`sensor-icon ${s.status}`}>
                <Server />
              </span>
              <div>
                <span className="eyebrow">{s.sensor_id}</span>
                <h2>{s.site}</h2>
              </div>
              <Badge tone={s.status === "healthy" ? "healthy" : "medium"}>
                {s.status.toUpperCase()}
              </Badge>
            </div>
            <div className="sensor-health">
              <strong>{oneDecimal(s.health)}%</strong>
              <span>sensor health</span>
              <i>
                <em style={{ width: `${s.health}%` }} />
              </i>
            </div>
            <dl className="kv compact">
              <div>
                <dt>Direction</dt>
                <dd>{s.direction}</dd>
              </div>
              <div>
                <dt>Throughput</dt>
                <dd>{s.throughput_mbps} Mbps</dd>
              </div>
              <div>
                <dt>Buffer usage</dt>
                <dd>{s.buffer_usage}%</dd>
              </div>
              <div>
                <dt>Last event</dt>
                <dd>{when(s.last_event)}</dd>
              </div>
            </dl>
            <div className="one-way">
              <ArrowRight />
              <span>Telemetry enters enclave</span>
              <b>NO RETURN PATH</b>
            </div>
          </Panel>
        ))}
      </div>
      <Panel title="Ingest architecture" subtitle="Operational boundary status">
        <div className="health-strip">
          {[
            ["Passive capture", "healthy"],
            ["Diode receiver", "healthy"],
            ["Schema validation", "healthy"],
            ["Flow reconstruction", "healthy"],
            ["Feature windows", "healthy"],
            ["Inference queue", "healthy"],
            ["Plant DMZ buffer", "warning"],
          ].map(([n, s]) => (
            <div key={n}>
              <span className={s} />
              <strong>{n}</strong>
              <small>
                {s === "healthy" ? "Operational" : "Capacity review"}
              </small>
            </div>
          ))}
        </div>
      </Panel>
    </>
  );
}

export function SettingsPage({ user }: { user: User | null }) {
  const { data, reload } = useData<any>("/api/audit-log");
  const [uploaded, setUploaded] = useState("");
  async function upload(e: React.ChangeEvent<HTMLInputElement>) {
    const f = e.target.files?.[0];
    if (!f) return;
    const form = new FormData();
    form.append("file", f);
    const response = await fetch("/api/datasets/upload", {
      method: "POST",
      headers: { Authorization: `Bearer ${localStorage.getItem("sf_token")}` },
      body: form,
    });
    const body = await response.json();
    setUploaded(
      response.ok
        ? `${body.accepted} metadata records validated`
        : body.message,
    );
    reload();
  }
  return (
    <>
      <PageHead
        title="Settings & Audit Log"
        description="Security posture, metadata ingestion, environment, and immutable operator events."
        actions={<Badge tone="neutral">{user?.role}</Badge>}
      />
      <div className="settings-grid">
        <Panel title="Environment" subtitle="Runtime configuration">
          <dl className="kv">
            <div>
              <dt>Inference mode</dt>
              <dd>
                <Badge tone="demo">DEMO</Badge>
              </dd>
            </div>
            <div>
              <dt>Input boundary</dt>
              <dd>Read-only / one-way</dd>
            </div>
            <div>
              <dt>Local fallback</dt>
              <dd>SQLite active</dd>
            </div>
            <div>
              <dt>Retention</dt>
              <dd>Metadata only · 30 days</dd>
            </div>
            <div>
              <dt>Rate limit</dt>
              <dd>120 req/min</dd>
            </div>
          </dl>
        </Panel>
        <Panel
          title="Dataset replay"
          subtitle="CSV or JSONL metadata · 10 MB maximum"
        >
          <label className="upload-box">
            <Upload />
            <strong>Upload metadata dataset</strong>
            <span>
              No payload contents are stored. Files are schema validated and
              bounded to 1,000 records.
            </span>
            <input type="file" accept=".csv,.jsonl" onChange={upload} />
          </label>
          {uploaded && (
            <div className="upload-result" role="status">
              <Check />
              {uploaded}
            </div>
          )}
        </Panel>
        <Panel title="Security controls" subtitle="Effective configuration">
          <div className="checklist">
            {[
              "JWT authentication",
              "Role-based authorization",
              "Secure CORS allowlist",
              "WebSocket authentication",
              "Bounded stream buffers",
              "File type and size validation",
              "Security response headers",
              "Safe structured errors",
            ].map((x) => (
              <span key={x}>
                <ShieldCheck />
                {x}
              </span>
            ))}
          </div>
        </Panel>
      </div>
      <Panel
        title="Audit log"
        subtitle="Most recent security and operator events"
        action={
          <button className="btn ghost compact" onClick={reload}>
            <RefreshCw size={15} /> Refresh
          </button>
        }
      >
        {data?.items?.length ? (
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>Timestamp</th>
                  <th>Event</th>
                  <th>Actor</th>
                  <th>Details</th>
                </tr>
              </thead>
              <tbody>
                {data.items.map((x: any) => (
                  <tr key={x.id}>
                    <td>{new Date(x.timestamp).toLocaleString()}</td>
                    <td>
                      <Badge tone="neutral">{labelize(x.event)}</Badge>
                    </td>
                    <td>
                      <code>{x.actor}</code>
                    </td>
                    <td>{JSON.stringify(x.details)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <Empty
            title="No audit events yet"
            body="Authentication, simulations, uploads, notes, and status changes will appear here."
          />
        )}
      </Panel>
    </>
  );
}

function useData<T>(path: string) {
  const [data, setData] = useState<T | null>(null);
  const [error, setError] = useState("");
  const [nonce, setNonce] = useState(0);
  useEffect(() => {
    let alive = true;
    setError("");
    api<T>(path)
      .then((x) => alive && setData(x))
      .catch((e) => alive && setError(e.message));
    return () => {
      alive = false;
    };
  }, [path, nonce]);
  return { data, error, reload: () => setNonce((x) => x + 1) };
}
