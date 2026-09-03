import { useEffect, useState } from "react";
import {
  Navigate,
  NavLink,
  Route,
  Routes,
  useLocation,
  useNavigate,
} from "react-router-dom";
import {
  Activity,
  AlertOctagon,
  BarChart3,
  Bell,
  ChevronLeft,
  ChevronRight,
  FlaskConical,
  LogOut,
  Menu,
  Network,
  Radio,
  Search,
  Server,
  Settings,
  ShieldCheck,
  SquareActivity,
  UserCircle,
  X,
  Zap,
} from "lucide-react";
import { User } from "./types";
import { Alert, Flow } from "./types";
import { api } from "./api";
import {
  AlertDetail,
  Alerts,
  Analytics,
  Brand,
  Dashboard,
  Flows,
  Lab,
  Landing,
  Login,
  ModelOps,
  Monitor,
  Sensors,
  SettingsPage,
  Simulator,
} from "./pages";
import { Badge } from "./components";
const nav = [
  ["/soc", "Overview", Activity],
  ["/traffic", "Live traffic", Radio],
  ["/alerts", "Alert queue", AlertOctagon],
  ["/flows", "Flow explorer", Network],
  ["/analytics", "Threat analytics", BarChart3],
  ["/lab", "Detection lab", FlaskConical],
  ["/simulator", "Simulator", Zap],
  ["/models", "Model ops", SquareActivity],
  ["/sensors", "Sensor health", Server],
  ["/settings", "Settings & audit", Settings],
] as const;
export default function App() {
  const [auth, setAuthState] = useState<{ token: string; user: User | null }>(
    () => ({
      token: localStorage.getItem("sf_token") || "",
      user: JSON.parse(localStorage.getItem("sf_user") || "null"),
    }),
  );
  function setAuth(token: string, user: User) {
    setAuthState({ token, user });
  }
  return (
    <Routes>
      <Route path="/" element={<Landing />} />
      <Route
        path="/login"
        element={
          auth.token ? (
            <Navigate
              to={
                new URLSearchParams(window.location.search).get("next") ||
                "/soc"
              }
            />
          ) : (
            <Login user={null} setAuth={setAuth} />
          )
        }
      />
      <Route
        path="/*"
        element={
          auth.token ? (
            <Shell
              user={auth.user}
              logout={() => {
                localStorage.clear();
                setAuthState({ token: "", user: null });
              }}
            />
          ) : (
            <Navigate to="/login" />
          )
        }
      />
    </Routes>
  );
}
function Shell({ user, logout }: { user: User | null; logout: () => void }) {
  const [collapsed, setCollapsed] = useState(false);
  const [mobile, setMobile] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [searching, setSearching] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [searchResults, setSearchResults] = useState<
    {
      kind: "flow" | "alert";
      id: string;
      title: string;
      detail: string;
      to: string;
    }[]
  >([]);
  const loc = useLocation();
  const navigate = useNavigate();
  useEffect(() => {
    setMobile(false);
    setSearchOpen(false);
    setNotificationsOpen(false);
    document.getElementById("main-content")?.focus();
  }, [loc.pathname]);
  useEffect(() => {
    function shortcut(event: KeyboardEvent) {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "k") {
        event.preventDefault();
        document.getElementById("global-search-input")?.focus();
        setSearchOpen(true);
      }
    }
    window.addEventListener("keydown", shortcut);
    return () => window.removeEventListener("keydown", shortcut);
  }, []);
  useEffect(() => {
    const query = searchQuery.trim();
    if (query.length < 2) {
      setSearchResults([]);
      setSearching(false);
      return;
    }
    setSearching(true);
    const timer = window.setTimeout(async () => {
      try {
        const [flowData, alertData] = await Promise.all([
          api<{ items: Flow[] }>(
            `/api/flows?search=${encodeURIComponent(query)}&limit=6`,
          ),
          api<{ items: Alert[] }>("/api/alerts"),
        ]);
        const needle = query.toLowerCase();
        const alertMatches = alertData.items
          .filter((alert) =>
            JSON.stringify(alert).toLowerCase().includes(needle),
          )
          .slice(0, 4);
        setSearchResults(
          [
            ...alertMatches.map((alert) => ({
              kind: "alert" as const,
              id: alert.alert_id,
              title: `${alert.alert_id} · ${alert.threat_class.replaceAll("_", " ")}`,
              detail: `${alert.source.ip} → ${alert.destination.ip} · ${alert.severity}`,
              to: `/alerts/${alert.alert_id}`,
            })),
            ...flowData.items.map((flow) => ({
              kind: "flow" as const,
              id: flow.flow_id,
              title: `${flow.flow_id} · ${flow.classification.replaceAll("_", " ")}`,
              detail: `${flow.src_ip}:${flow.src_port} → ${flow.dst_ip}:${flow.dst_port}`,
              to: `/flows?search=${encodeURIComponent(flow.flow_id)}`,
            })),
          ].slice(0, 8),
        );
      } catch {
        setSearchResults([]);
      } finally {
        setSearching(false);
      }
    }, 250);
    return () => window.clearTimeout(timer);
  }, [searchQuery]);
  function submitSearch() {
    const first = searchResults[0];
    if (first) {
      navigate(first.to);
      setSearchQuery("");
      setSearchOpen(false);
    } else if (searchQuery.trim()) {
      navigate(`/flows?search=${encodeURIComponent(searchQuery.trim())}`);
      setSearchOpen(false);
    }
  }
  return (
    <div className={`app-shell ${collapsed ? "collapsed" : ""}`}>
      <a className="skip-link" href="#main-content">
        Skip to main content
      </a>
      <aside className={`sidebar ${mobile ? "open" : ""}`}>
        <div className="side-brand">
          <Brand />
          <button
            onClick={() => setCollapsed((x) => !x)}
            aria-label={collapsed ? "Expand navigation" : "Collapse navigation"}
          >
            <ChevronLeft size={17} />
          </button>
          <button
            className="mobile-close"
            onClick={() => setMobile(false)}
            aria-label="Close navigation"
          >
            <X size={18} />
          </button>
        </div>
        <div className="boundary">
          <span>
            <ShieldCheck size={14} /> PASSIVE BOUNDARY
          </span>
          <small>One-way ingress only</small>
        </div>
        <nav aria-label="Primary navigation">
          {nav.map(([to, label, Icon]) => (
            <NavLink
              key={to}
              to={to}
              className={({ isActive }) => (isActive ? "active" : "")}
            >
              <Icon size={18} />
              <span>{label}</span>
              {to === "/alerts" && <b>12</b>}
            </NavLink>
          ))}
        </nav>
        <div className="side-bottom">
          <div className="demo-card">
            <span>
              <FlaskConical size={16} /> DEMO MODE
            </span>
            <small>Deterministic inference</small>
          </div>
          <button className="user-card" onClick={logout}>
            <UserCircle size={27} />
            <span>
              <strong>{user?.name}</strong>
              <small>{user?.role}</small>
            </span>
            <LogOut size={16} />
          </button>
        </div>
      </aside>
      {mobile && (
        <div className="mobile-scrim" onClick={() => setMobile(false)} />
      )}
      <div className="app-body">
        <header className="topbar">
          <button
            className="menu-btn"
            onClick={() => setMobile(true)}
            aria-label="Open navigation"
          >
            <Menu />
          </button>
          <div className={`global-search ${searchOpen ? "open" : ""}`}>
            <Search size={16} />
            <input
              id="global-search-input"
              aria-label="Global search"
              role="combobox"
              aria-autocomplete="list"
              aria-expanded={searchOpen}
              aria-controls="global-search-results"
              placeholder="Search IP, flow, alert…"
              value={searchQuery}
              onFocus={() => setSearchOpen(true)}
              onChange={(event) => {
                setSearchQuery(event.target.value);
                setSearchOpen(true);
              }}
              onKeyDown={(event) => {
                if (event.key === "Enter") {
                  event.preventDefault();
                  submitSearch();
                }
                if (event.key === "Escape") {
                  setSearchOpen(false);
                  event.currentTarget.blur();
                }
              }}
            />
            {searchQuery ? (
              <button
                className="search-clear"
                aria-label="Clear global search"
                onClick={() => {
                  setSearchQuery("");
                  document.getElementById("global-search-input")?.focus();
                }}
              >
                <X size={14} />
              </button>
            ) : (
              <kbd>⌘ K</kbd>
            )}
            {searchOpen && searchQuery.trim().length >= 2 && (
              <div
                className="search-results"
                id="global-search-results"
                role="listbox"
                aria-label="Global search results"
              >
                <div className="search-results-head">
                  <span>SEARCH RESULTS</span>
                  <small>
                    {searching
                      ? "Searching…"
                      : `${searchResults.length} matches`}
                  </small>
                </div>
                {!searching && searchResults.length === 0 ? (
                  <div className="search-empty">
                    <Search size={18} />
                    <strong>No matching telemetry</strong>
                    <span>
                      Try a flow ID, alert ID, IP address, sensor, port, or
                      threat class.
                    </span>
                  </div>
                ) : (
                  searchResults.map((result) => (
                    <NavLink
                      key={`${result.kind}-${result.id}`}
                      to={result.to}
                      role="option"
                      onClick={() => {
                        setSearchQuery("");
                        setSearchOpen(false);
                      }}
                    >
                      <span className={`search-result-icon ${result.kind}`}>
                        {result.kind === "alert" ? (
                          <AlertOctagon size={15} />
                        ) : (
                          <Network size={15} />
                        )}
                      </span>
                      <span>
                        <strong>{result.title}</strong>
                        <small>{result.detail}</small>
                      </span>
                      <ChevronRight size={15} />
                    </NavLink>
                  ))
                )}
                <button className="search-all" onClick={submitSearch}>
                  Search all flows for “{searchQuery.trim()}”
                  <ChevronRight size={14} />
                </button>
              </div>
            )}
          </div>
          <div className="top-status">
            <Badge tone="healthy">3 SENSORS</Badge>
            <span className="stream-state">
              <i /> SIMULATED STREAM
            </span>
            <button
              aria-label="Notifications"
              aria-expanded={notificationsOpen}
              aria-controls="notification-panel"
              onClick={() => setNotificationsOpen((open) => !open)}
            >
              <Bell size={18} />
              <b>4</b>
            </button>
            {notificationsOpen && (
              <div
                className="notification-panel"
                id="notification-panel"
                role="region"
                aria-label="Recent notifications"
              >
                <div className="notification-head">
                  <strong>Recent notifications</strong>
                  <span>4 unread</span>
                </div>
                {[
                  [
                    "ALT-2026-00421",
                    "Critical DDoS pattern detected",
                    "Just now",
                  ],
                  [
                    "ALT-2026-00424",
                    "Encrypted malware confidence increased",
                    "2 min",
                  ],
                  ["ALT-2026-00425", "Exfiltration threshold crossed", "4 min"],
                  ["ALT-2026-00423", "DNS entropy anomaly detected", "7 min"],
                ].map(([id, title, time]) => (
                  <NavLink key={id} to={`/alerts/${id}`}>
                    <span className="notification-icon">
                      <AlertOctagon size={15} />
                    </span>
                    <span>
                      <strong>{title}</strong>
                      <small>
                        {id} · {time}
                      </small>
                    </span>
                    <ChevronRight size={14} />
                  </NavLink>
                ))}
                <NavLink className="notification-all" to="/alerts">
                  Open alert queue <ChevronRight size={14} />
                </NavLink>
              </div>
            )}
            <span className="time">UTC · 10:42:19</span>
          </div>
        </header>
        <main id="main-content" tabIndex={-1}>
          <Routes>
            <Route path="soc" element={<Dashboard />} />
            <Route path="traffic" element={<Monitor />} />
            <Route path="alerts" element={<Alerts />} />
            <Route path="alerts/:id" element={<AlertDetail />} />
            <Route path="flows" element={<Flows />} />
            <Route path="analytics" element={<Analytics />} />
            <Route path="lab" element={<Lab user={user} />} />
            <Route path="simulator" element={<Simulator />} />
            <Route path="models" element={<ModelOps />} />
            <Route path="sensors" element={<Sensors />} />
            <Route path="settings" element={<SettingsPage user={user} />} />
            <Route path="*" element={<Navigate to="/soc" />} />
          </Routes>
        </main>
      </div>
    </div>
  );
}
