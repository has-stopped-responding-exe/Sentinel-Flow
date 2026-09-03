import { ReactNode } from "react";
import {
  AlertTriangle,
  ArrowDownRight,
  ArrowUpRight,
  CheckCircle2,
  LoaderCircle,
  ShieldCheck,
} from "lucide-react";
export const labelize = (s: string) =>
  s.replaceAll("_", " ").replace(/\b\w/g, (c) => c.toUpperCase());
export function Badge({
  children,
  tone = "info",
}: {
  children: ReactNode;
  tone?: string;
}) {
  return (
    <span className={`badge ${tone}`}>
      <span aria-hidden="true" className="badge-dot" />
      {children}
    </span>
  );
}
export function Severity({ value }: { value: string }) {
  const v = value.toLowerCase();
  return <Badge tone={v}>{value.toUpperCase()}</Badge>;
}
export function Panel({
  title,
  subtitle,
  action,
  children,
  className = "",
}: {
  title?: string;
  subtitle?: string;
  action?: ReactNode;
  children: ReactNode;
  className?: string;
}) {
  return (
    <section className={`panel ${className}`}>
      {(title || action) && (
        <header className="panel-head">
          <div>
            {title && <h2>{title}</h2>}
            {subtitle && <p>{subtitle}</p>}
          </div>
          {action}
        </header>
      )}
      {children}
    </section>
  );
}
export function PageHead({
  eyebrow = "OPERATIONS",
  title,
  description,
  actions,
}: {
  eyebrow?: string;
  title: string;
  description: string;
  actions?: ReactNode;
}) {
  return (
    <header className="page-head">
      <div>
        <span className="eyebrow">{eyebrow}</span>
        <h1 tabIndex={-1}>{title}</h1>
        <p>{description}</p>
      </div>
      {actions && <div className="page-actions">{actions}</div>}
    </header>
  );
}
export function Metric({
  label,
  value,
  unit,
  delta,
  tone = "blue",
  icon,
}: {
  label: string;
  value: string | number;
  unit?: string;
  delta?: string;
  tone?: string;
  icon?: ReactNode;
}) {
  return (
    <article className="metric">
      <div className={`metric-icon ${tone}`}>
        {icon || <ShieldCheck size={17} />}
      </div>
      <div className="metric-copy">
        <span>{label}</span>
        <strong>
          {value}
          <small>{unit}</small>
        </strong>
        {delta && (
          <em className={delta.startsWith("+") ? "up" : "neutral"}>
            {delta.startsWith("+") ? (
              <ArrowUpRight size={12} />
            ) : (
              <ArrowDownRight size={12} />
            )}{" "}
            {delta}
          </em>
        )}
      </div>
    </article>
  );
}
export function Bars({
  data,
  valueKey = "value",
  labelKey = "name",
  color = "cyan",
  unit = "",
}: {
  data: Record<string, any>[];
  valueKey?: string;
  labelKey?: string;
  color?: string;
  unit?: string;
}) {
  const max = Math.max(...data.map((d) => Number(d[valueKey])), 1);
  return (
    <div
      className="bars"
      role="img"
      aria-label={`${labelKey} by ${valueKey}${unit ? ` in ${unit}` : ""}`}
    >
      {data.map((d, i) => (
        <div className="bar-row" key={String(d[labelKey])}>
          <span className="bar-label">{d[labelKey]}</span>
          <div className="bar-track">
            <span
              className={`bar-fill ${color}`}
              style={{ width: `${(Number(d[valueKey]) / max) * 100}%` }}
            />
          </div>
          <strong>
            {d[valueKey]}
            {unit}
          </strong>
          <span className="sr-only">
            {i + 1} of {data.length}
          </span>
        </div>
      ))}
    </div>
  );
}
export function Sparkline({
  values,
  color = "#38bdf8",
  label = "Trend",
}: {
  values: number[];
  color?: string;
  label?: string;
}) {
  const max = Math.max(...values),
    min = Math.min(...values),
    points = values
      .map(
        (v, i) =>
          `${(i / (values.length - 1)) * 100},${38 - ((v - min) / Math.max(1, max - min)) * 32}`,
      )
      .join(" ");
  return (
    <svg
      viewBox="0 0 100 42"
      className="spark"
      role="img"
      aria-label={`${label}: ${values.join(", ")}`}
    >
      <path d="M0 39H100" className="grid" />
      <polyline
        points={points}
        fill="none"
        stroke={color}
        strokeWidth="2"
        vectorEffect="non-scaling-stroke"
      />
      <g>
        {values.map((v, i) => (
          <circle
            key={i}
            cx={(i / (values.length - 1)) * 100}
            cy={38 - ((v - min) / Math.max(1, max - min)) * 32}
            r="1.7"
            fill={color}
          >
            <title>{v}</title>
          </circle>
        ))}
      </g>
    </svg>
  );
}
export function Donut({ data }: { data: { name: string; value: number }[] }) {
  let offset = 0;
  const colors = [
    "#38bdf8",
    "#818cf8",
    "#f59e0b",
    "#f97316",
    "#ef4444",
    "#22c55e",
  ];
  return (
    <div className="donut-wrap">
      <svg
        viewBox="0 0 42 42"
        className="donut"
        role="img"
        aria-label={data.map((d) => `${d.name} ${d.value}%`).join(", ")}
      >
        <circle
          cx="21"
          cy="21"
          r="15.9"
          fill="none"
          stroke="#172337"
          strokeWidth="6"
        />
        {data.map((d, i) => {
          const o = offset;
          offset += d.value;
          return (
            <circle
              key={d.name}
              cx="21"
              cy="21"
              r="15.9"
              fill="none"
              stroke={colors[i]}
              strokeWidth="6"
              strokeDasharray={`${d.value} ${100 - d.value}`}
              strokeDashoffset={25 - o}
            >
              <title>
                {d.name}: {d.value}%
              </title>
            </circle>
          );
        })}
        <text x="21" y="20" textAnchor="middle" className="donut-num">
          100%
        </text>
        <text x="21" y="25" textAnchor="middle" className="donut-label">
          traffic
        </text>
      </svg>
      <div className="legend">
        {data.map((d, i) => (
          <span key={d.name}>
            <i style={{ background: colors[i] }} />
            {labelize(d.name)} <b>{d.value}%</b>
          </span>
        ))}
      </div>
    </div>
  );
}
export function Empty({ title, body }: { title: string; body: string }) {
  return (
    <div className="empty">
      <CheckCircle2 size={28} />
      <h3>{title}</h3>
      <p>{body}</p>
    </div>
  );
}
export function Loading({
  label = "Loading historical telemetry",
}: {
  label?: string;
}) {
  return (
    <div className="loading" role="status">
      <LoaderCircle className="spin" size={22} />
      <span>{label}</span>
    </div>
  );
}
export function ErrorState({
  message,
  retry,
}: {
  message: string;
  retry?: () => void;
}) {
  return (
    <div className="error-state" role="alert">
      <AlertTriangle size={22} />
      <div>
        <strong>Data unavailable</strong>
        <p>{message}</p>
      </div>
      {retry && (
        <button className="btn secondary" onClick={retry}>
          Retry
        </button>
      )}
    </div>
  );
}
export function Risk({ value }: { value: number }) {
  return (
    <div className="risk">
      <span>{value.toFixed(1)}</span>
      <div>
        <i style={{ width: `${value}%` }} />
      </div>
    </div>
  );
}
