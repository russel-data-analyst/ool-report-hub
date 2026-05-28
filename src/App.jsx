import React, { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import {
  Activity,
  AlertTriangle,
  BarChart3,
  CalendarDays,
  CheckCircle2,
  ChevronRight,
  Clock3,
  Database,
  Filter,
  Gauge,
  LineChart,
  ListChecks,
  RefreshCw,
  Search,
  ShieldCheck,
  SlidersHorizontal,
  Sparkles,
  Table2,
  TrendingUp,
  Users,
} from "lucide-react";
function Card({ className = "", children }) {
  return <div className={className}>{children}</div>;
}

function CardContent({ className = "", children }) {
  return <div className={className}>{children}</div>;
}

function Button({ className = "", children, variant = "default", onClick, type = "button" }) {
  const outlineClass =
    variant === "outline"
      ? "border border-slate-200 bg-white text-slate-900"
      : "";

  return (
    <button type={type} onClick={onClick} className={`${outlineClass} ${className}`}>
      {children}
    </button>
  );
}

const BRAND = {
  purple: "#9e6be5",
  orange: "#ff7500",
};

const GOOGLE_SHEET_API_URL = "https://script.google.com/macros/s/AKfycbx_EegCdS2i5C7u_ruefFCjbvSjqFB8bMg8VnL3Nm_DiSE3XF12-zY6MCwnycfsvQhbQw/exec";
const LOGIN_USERNAME = "admin";
const LOGIN_PASSWORD = "OOL2026!";

const sourceSheet = {
  name: "OOL CS Metrics Tracker",
  url: "https://docs.google.com/spreadsheets/d/1AnRLcYeQ_HvDLNQmAkgbrEsyFg0BwxqxIGckebQzs1o/edit?usp=sharing",
  recognizedTabs: [
    "Main",
    "Monthly Metric & Performance",
    "Weekly Metric & Performance",
    "T&A Summary",
    "Client Terms",
    "T&A Focus",
    "Off Track Updates",
    "Data Comparison",
  ],
};

const reportTabs = [
  {
    name: "Main",
    icon: Gauge,
    purpose: "Executive campaign health dashboard",
    formulas: ["Total SMS sent", "Total leads", "Average PRR", "Campaign status counts"],
    filters: ["Week Start", "Week Ending", "Campaign Status", "Account Manager"],
    usability: "Use as the one source view for leadership, AMs, and campaign health reviews.",
  },
  {
    name: "Monthly Metric & Performance",
    icon: BarChart3,
    purpose: "Month-level performance tracking by client and campaign",
    formulas: ["Monthly leads", "Monthly SMS sent", "Monthly PRR", "Guarantee progress"],
    filters: ["Month", "Client", "Status", "AM", "Lead Specialist"],
    usability: "Best for trend analysis, month-end reporting, and campaign pacing review.",
  },
  {
    name: "Weekly Metric & Performance",
    icon: LineChart,
    purpose: "Weekly pacing, response quality, and performance trend tracking",
    formulas: ["Weekly leads", "Weekly SMS sent", "Reply rate", "Lead velocity"],
    filters: ["Week", "Client", "Status", "Best Day", "Worst Day"],
    usability: "Best for weekly action items, cadence adjustment, and early warning signals.",
  },
  {
    name: "T&A Summary",
    icon: Users,
    purpose: "Account manager and portfolio summary",
    formulas: ["Portfolio value", "Total clients", "Total SAs", "Average PRR"],
    filters: ["AM", "Portfolio Status", "Client Status"],
    usability: "Best for team accountability, ownership review, and high-level portfolio checks.",
  },
  {
    name: "Client Terms",
    icon: CalendarDays,
    purpose: "Contract, guarantee, notice, and term visibility",
    formulas: ["Guarantee end date", "Current leads", "Needed leads", "Days remaining"],
    filters: ["Client", "Guarantee Window", "Notice Status", "Terms Type"],
    usability: "Best for guarantee tracking, 30-day notice monitoring, and campaign urgency review.",
  },
  {
    name: "T&A Focus",
    icon: ListChecks,
    purpose: "Focused client watch list and action priority tracker",
    formulas: ["Days in status", "Priority rank", "Current status", "Owner action"],
    filters: ["Owner", "Priority", "Status", "Days in Status"],
    usability: "Best for AM follow-through, focus meetings, and active issue tracking.",
  },
  {
    name: "Off Track Updates",
    icon: AlertTriangle,
    purpose: "Off-track campaign documentation and update log",
    formulas: ["Status age", "Issue category", "Latest update date", "Next action"],
    filters: ["Client", "Issue Type", "Owner", "Update Status"],
    usability: "Best for documenting blockers, next steps, and campaign recovery decisions.",
  },
  {
    name: "Data Comparison",
    icon: Database,
    purpose: "Cross-period and source-to-source performance comparison",
    formulas: ["Week over week change", "Month over month change", "Variance", "Delta percentage"],
    filters: ["Period A", "Period B", "Client", "Metric"],
    usability: "Best for comparing current performance against prior benchmarks or manual exports.",
  },
];

const mockKpis = [
  { label: "Total SMS Sent", value: "493,446", sub: "Current running month", icon: Activity, tone: "purple" },
  { label: "Total Leads", value: "1,640", sub: "Current running month", icon: TrendingUp, tone: "orange" },
  { label: "Average PRR", value: "0.332", sub: "Positive response rate", icon: Sparkles, tone: "purple" },
  { label: "On Track", value: "36", sub: "Campaigns currently healthy", icon: CheckCircle2, tone: "green" },
];

const sampleRows = [
  { client: "James Billington", status: "Off Track", leads: 39, needed: 6, prr: "0.29", owner: "AM Team", updated: "May 28, 2026" },
  { client: "Maggie Tuttle", status: "On Track", leads: 154, needed: 0, prr: "0.51", owner: "AM Team", updated: "May 28, 2026" },
  { client: "Cari Mohler", status: "Off Track", leads: 51, needed: 0, prr: "0.34", owner: "AM Team", updated: "May 27, 2026" },
  { client: "Phil Whittaker", status: "Watchlist", leads: 36, needed: 9, prr: "0.27", owner: "AM Team", updated: "May 26, 2026" },
  { client: "Chad Bates", status: "On Track", leads: 179, needed: 0, prr: "0.49", owner: "AM Team", updated: "May 28, 2026" },
  { client: "Marcin Koziol SA5", status: "Off Track", leads: 0, needed: 45, prr: "0.00", owner: "AM Team", updated: "May 25, 2026" },
];

const statusStyles = {
  "On Track": "bg-emerald-50 text-emerald-700 ring-emerald-200",
  Watchlist: "bg-amber-50 text-amber-700 ring-amber-200",
  "Off Track": "bg-rose-50 text-rose-700 ring-rose-200",
};

function classNames(...classes) {
  return classes.filter(Boolean).join(" ");
}

function KpiCard({ item }) {
  const Icon = item.icon;
  const isOrange = item.tone === "orange";
  const isGreen = item.tone === "green";
  return (
    <Card className="overflow-hidden rounded-2xl border border-slate-200 bg-white/90 shadow-sm">
      <CardContent className="p-5">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-sm font-medium text-slate-500">{item.label}</p>
            <p className="mt-2 text-3xl font-bold tracking-tight text-slate-950">{item.value}</p>
            <p className="mt-1 text-sm text-slate-500">{item.sub}</p>
          </div>
          <div
            className={classNames(
              "rounded-2xl p-3 text-white shadow-sm",
              isGreen ? "bg-emerald-500" : isOrange ? "bg-[#ff7500]" : "bg-[#9e6be5]"
            )}
          >
            <Icon className="h-5 w-5" />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function StatusPill({ status }) {
  return (
    <span className={classNames("inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold ring-1", statusStyles[status])}>
      {status}
    </span>
  );
}

function ReportTable({ search, status }) {
  const filtered = sampleRows.filter((row) => {
    const matchesSearch = row.client.toLowerCase().includes(search.toLowerCase());
    const matchesStatus = status === "All" || row.status === status;
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
      <div className="border-b border-slate-200 px-5 py-4">
        <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
          <div>
            <h3 className="text-base font-semibold text-slate-950">Live Report Preview</h3>
            <p className="text-sm text-slate-500">Designed to mirror Sheet-based campaign rows with searchable, filterable records.</p>
          </div>
          <div className="flex items-center gap-2 text-sm text-slate-500">
            <Table2 className="h-4 w-4" />
            {filtered.length} visible rows
          </div>
        </div>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full min-w-[760px] text-left text-sm">
          <thead className="bg-slate-50 text-xs uppercase tracking-wide text-slate-500">
            <tr>
              <th className="px-5 py-3 font-semibold">Client</th>
              <th className="px-5 py-3 font-semibold">Status</th>
              <th className="px-5 py-3 font-semibold">Leads</th>
              <th className="px-5 py-3 font-semibold">Needed</th>
              <th className="px-5 py-3 font-semibold">PRR</th>
              <th className="px-5 py-3 font-semibold">Owner</th>
              <th className="px-5 py-3 font-semibold">Updated</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {filtered.map((row) => (
              <tr key={row.client} className="hover:bg-slate-50/80">
                <td className="px-5 py-4 font-semibold text-slate-900">{row.client}</td>
                <td className="px-5 py-4"><StatusPill status={row.status} /></td>
                <td className="px-5 py-4 text-slate-700">{row.leads}</td>
                <td className="px-5 py-4 text-slate-700">{row.needed}</td>
                <td className="px-5 py-4 text-slate-700">{row.prr}</td>
                <td className="px-5 py-4 text-slate-700">{row.owner}</td>
                <td className="px-5 py-4 text-slate-500">{row.updated}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default function OodlesReportHub() {
  const [isLoggedIn, setIsLoggedIn] = useState(() => {
  return localStorage.getItem("oolReportHubLoggedIn") === "true";
});

const [loginUsername, setLoginUsername] = useState("");
const [loginPassword, setLoginPassword] = useState("");
const [loginError, setLoginError] = useState("");

function handleLogin(event) {
  event.preventDefault();

  const usernameIsCorrect = loginUsername.trim() === LOGIN_USERNAME;
  const passwordIsCorrect = loginPassword === LOGIN_PASSWORD;

  if (usernameIsCorrect && passwordIsCorrect) {
    localStorage.setItem("oolReportHubLoggedIn", "true");
    setIsLoggedIn(true);
    setLoginError("");
    setLoginUsername("");
    setLoginPassword("");
    return;
  }

  setLoginError("Incorrect username or password.");
}

function handleLogout() {
  localStorage.removeItem("oolReportHubLoggedIn");
  setIsLoggedIn(false);
}
  
  const [activeTab, setActiveTab] = useState("Main");
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("All");

  const [sheetData, setSheetData] = useState(null);
  const [isLoadingSheet, setIsLoadingSheet] = useState(true);
  const [sheetError, setSheetError] = useState("");

useEffect(() => {
  async function loadSheetData() {
    try {
      setIsLoadingSheet(true);
      setSheetError("");

      const response = await fetch(GOOGLE_SHEET_API_URL);
      const data = await response.json();

      setSheetData(data);
    } catch (error) {
      setSheetError("Unable to load Google Sheet data.");
      console.error(error);
    } finally {
      setIsLoadingSheet(false);
    }
  }

  loadSheetData();
}, []);

  const activeReport = useMemo(() => reportTabs.find((tab) => tab.name === activeTab), [activeTab]);
  const ActiveIcon = activeReport.icon;

  if (!isLoggedIn) {
  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top_left,_rgba(158,107,229,0.20),_transparent_34%),linear-gradient(180deg,#fff_0%,#f8fafc_45%,#fff_100%)] flex items-center justify-center px-4">
      <div className="w-full max-w-md rounded-[2rem] border border-slate-200 bg-white p-8 shadow-xl shadow-purple-100/60">
        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-[#9e6be5] text-white shadow-sm">
          <BarChart3 className="h-7 w-7" />
        </div>

        <div className="mt-6 text-center">
          <p className="text-xs font-semibold uppercase tracking-[0.22em] text-[#ff7500]">
            Oodles of Leads
          </p>
          <h1 className="mt-2 text-2xl font-black tracking-tight text-slate-950">
            Data Analyst Report Hub
          </h1>
          <p className="mt-3 text-sm leading-6 text-slate-500">
            Please log in to view campaign reports and performance dashboards.
          </p>
        </div>

        <form onSubmit={handleLogin} className="mt-7 space-y-4">
          <div>
            <label className="text-sm font-semibold text-slate-700">
              Username
            </label>
            <input
              value={loginUsername}
              onChange={(event) => setLoginUsername(event.target.value)}
              className="mt-2 h-12 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 text-sm outline-none transition focus:border-[#9e6be5] focus:bg-white focus:ring-4 focus:ring-purple-100"
              placeholder="Enter username"
            />
          </div>

          <div>
            <label className="text-sm font-semibold text-slate-700">
              Password
            </label>
            <input
              value={loginPassword}
              onChange={(event) => setLoginPassword(event.target.value)}
              type="password"
              className="mt-2 h-12 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 text-sm outline-none transition focus:border-[#9e6be5] focus:bg-white focus:ring-4 focus:ring-purple-100"
              placeholder="Enter password"
            />
          </div>

          {loginError && (
            <div className="rounded-2xl bg-rose-50 px-4 py-3 text-sm font-semibold text-rose-700 ring-1 ring-rose-100">
              {loginError}
            </div>
          )}

          <Button
  type="submit"
  className="h-12 w-full rounded-2xl bg-[#ff7500] font-bold text-white hover:bg-[#e86a00]"
>
  Log In
</Button>
        </form>

        <p className="mt-5 text-center text-xs leading-5 text-slate-400">
          Access is limited to authorized Oodles of Leads team members.
        </p>
      </div>
    </div>
  );
}

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top_left,_rgba(158,107,229,0.18),_transparent_34%),linear-gradient(180deg,#fff_0%,#f8fafc_45%,#fff_100%)] text-slate-950">
      <header className="sticky top-0 z-30 border-b border-white/60 bg-white/80 backdrop-blur-xl">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[#9e6be5] text-white shadow-sm">
              <BarChart3 className="h-6 w-6" />
            </div>
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.22em] text-[#ff7500]">Oodles of Leads</p>
              <h1 className="text-lg font-bold tracking-tight sm:text-xl">Data Analyst Report Hub</h1>
            </div>
          </div>
          <div className="hidden items-center gap-2 md:flex">
            <Button variant="outline" className="rounded-full border-slate-200 bg-white">
              <RefreshCw className="mr-2 h-4 w-4" />
              Sync Sheet
            </Button>
            <Button className="rounded-full bg-[#ff7500] text-white hover:bg-[#e86a00]">
              Open Reports
              <ChevronRight className="ml-2 h-4 w-4" />
            </Button>

            <Button
  onClick={handleLogout}
  variant="outline"
  className="rounded-full border-slate-200 bg-white"
>
  Log Out
</Button>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <section className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr] lg:items-stretch">
          <motion.div
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.45 }}
            className="rounded-[2rem] border border-white/70 bg-white/85 p-6 shadow-xl shadow-purple-100/50 sm:p-8"
          >
            <div className="inline-flex items-center rounded-full bg-purple-50 px-4 py-2 text-sm font-semibold text-[#7c4dcc] ring-1 ring-purple-100">
              <ShieldCheck className="mr-2 h-4 w-4" />
              Aligned to the recognized Sheet tabs only
            </div>
            <h2 className="mt-6 max-w-3xl text-4xl font-black tracking-tight text-slate-950 sm:text-5xl">
              A sharper home for campaign reports, performance checks, and AM action items.
            </h2>
            <p className="mt-5 max-w-2xl text-base leading-7 text-slate-600">
              This hub turns the Data Analyst reporting workbook into a clean website experience with executive KPIs, tab-based navigation, filters, searchable tables, status rules, and formula-friendly report sections.
            </p>
            <div className="mt-7 flex flex-wrap gap-3">
              <Button className="rounded-full bg-[#9e6be5] px-5 text-white hover:bg-[#8858d7]">
                View Dashboard
              </Button>
              <Button variant="outline" className="rounded-full border-slate-200 bg-white px-5">
                Review Source Mapping
              </Button>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.45, delay: 0.08 }}
            className="rounded-[2rem] border border-slate-200 bg-slate-950 p-6 text-white shadow-xl"
          >
            <div className="flex items-center justify-between gap-4">
              <div>
                <p className="text-sm font-semibold text-orange-300">Source Workbook</p>
                <h3 className="mt-1 text-2xl font-bold">{sourceSheet.name}</h3>
              </div>
              <Database className="h-8 w-8 text-[#ff7500]" />
            </div>
            <div className="mt-6 grid grid-cols-2 gap-3">
              {sourceSheet.recognizedTabs.map((tab) => (
                <div key={tab} className="rounded-2xl border border-white/10 bg-white/5 p-3 text-sm text-slate-200">
                  {tab}
                </div>
              ))}
            </div>
            <div className="mt-6 rounded-2xl bg-white/5 p-4 text-sm leading-6 text-slate-300">
              Website logic should ignore helper, archive, connection, testing, and old tabs. Only the approved tabs above should power navigation, filters, and reporting modules.
            </div>
            <div className="mt-4 rounded-2xl bg-white/5 p-4 text-sm leading-6 text-slate-300">
            {isLoadingSheet && "Loading Google Sheet data..."}
            {!isLoadingSheet && !sheetError && sheetData && "Google Sheet connected successfully."}
            {!isLoadingSheet && sheetError && sheetError}
            </div>
          </motion.div>
        </section>

        <section className="mt-8 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          {mockKpis.map((item) => <KpiCard key={item.label} item={item} />)}
        </section>

        <section className="mt-8 grid gap-6 lg:grid-cols-[300px_1fr]">
          <aside className="rounded-[1.75rem] border border-slate-200 bg-white p-4 shadow-sm">
            <div className="mb-4 flex items-center justify-between">
              <h3 className="font-bold text-slate-950">Report Tabs</h3>
              <SlidersHorizontal className="h-4 w-4 text-slate-400" />
            </div>
            <div className="space-y-2">
              {reportTabs.map((tab) => {
                const Icon = tab.icon;
                const active = tab.name === activeTab;
                return (
                  <button
                    key={tab.name}
                    onClick={() => setActiveTab(tab.name)}
                    className={classNames(
                      "flex w-full items-center gap-3 rounded-2xl px-4 py-3 text-left text-sm font-semibold transition",
                      active ? "bg-[#9e6be5] text-white shadow-sm" : "text-slate-600 hover:bg-slate-50 hover:text-slate-950"
                    )}
                  >
                    <Icon className="h-4 w-4 shrink-0" />
                    <span>{tab.name}</span>
                  </button>
                );
              })}
            </div>
          </aside>

          <div className="space-y-6">
            <Card className="rounded-[1.75rem] border border-slate-200 bg-white shadow-sm">
              <CardContent className="p-6">
                <div className="flex flex-col justify-between gap-5 xl:flex-row xl:items-start">
                  <div>
                    <div className="flex items-center gap-3">
                      <div className="rounded-2xl bg-orange-50 p-3 text-[#ff7500]">
                        <ActiveIcon className="h-5 w-5" />
                      </div>
                      <div>
                        <p className="text-sm font-semibold uppercase tracking-wide text-slate-400">Active Report</p>
                        <h2 className="text-2xl font-bold text-slate-950">{activeReport.name}</h2>
                      </div>
                    </div>
                    <p className="mt-4 max-w-3xl text-sm leading-6 text-slate-600">{activeReport.purpose}</p>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    <span className="rounded-full bg-purple-50 px-3 py-1 text-xs font-semibold text-[#7c4dcc] ring-1 ring-purple-100">Formula aware</span>
                    <span className="rounded-full bg-orange-50 px-3 py-1 text-xs font-semibold text-[#d96300] ring-1 ring-orange-100">Filter ready</span>
                    <span className="rounded-full bg-slate-50 px-3 py-1 text-xs font-semibold text-slate-600 ring-1 ring-slate-200">Sheet aligned</span>
                  </div>
                </div>

                <div className="mt-6 grid gap-4 lg:grid-cols-3">
                  <div className="rounded-2xl bg-slate-50 p-4">
                    <p className="mb-3 flex items-center text-sm font-bold text-slate-900"><Sparkles className="mr-2 h-4 w-4 text-[#9e6be5]" /> Formula logic</p>
                    <ul className="space-y-2 text-sm text-slate-600">
                      {activeReport.formulas.map((item) => <li key={item}>• {item}</li>)}
                    </ul>
                  </div>
                  <div className="rounded-2xl bg-slate-50 p-4">
                    <p className="mb-3 flex items-center text-sm font-bold text-slate-900"><Filter className="mr-2 h-4 w-4 text-[#ff7500]" /> Website filters</p>
                    <ul className="space-y-2 text-sm text-slate-600">
                      {activeReport.filters.map((item) => <li key={item}>• {item}</li>)}
                    </ul>
                  </div>
                  <div className="rounded-2xl bg-slate-50 p-4">
                    <p className="mb-3 flex items-center text-sm font-bold text-slate-900"><Clock3 className="mr-2 h-4 w-4 text-slate-500" /> Best use</p>
                    <p className="text-sm leading-6 text-slate-600">{activeReport.usability}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <div className="grid gap-3 rounded-[1.75rem] border border-slate-200 bg-white p-4 shadow-sm md:grid-cols-[1fr_190px_160px]">
              <div className="relative">
                <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                <input
                  value={search}
                  onChange={(event) => setSearch(event.target.value)}
                  placeholder="Search client or campaign"
                  className="h-11 w-full rounded-full border border-slate-200 bg-slate-50 pl-11 pr-4 text-sm outline-none transition focus:border-[#9e6be5] focus:bg-white focus:ring-4 focus:ring-purple-100"
                />
              </div>
              <select
                value={status}
                onChange={(event) => setStatus(event.target.value)}
                className="h-11 rounded-full border border-slate-200 bg-slate-50 px-4 text-sm outline-none transition focus:border-[#9e6be5] focus:bg-white focus:ring-4 focus:ring-purple-100"
              >
                <option>All</option>
                <option>On Track</option>
                <option>Watchlist</option>
                <option>Off Track</option>
              </select>
              <Button className="h-11 rounded-full bg-slate-950 text-white hover:bg-slate-800">
                Apply Filters
              </Button>
            </div>

            <ReportTable search={search} status={status} />
          </div>
        </section>

        <section className="mt-8 grid gap-6 lg:grid-cols-3">
          <Card className="rounded-[1.75rem] border border-slate-200 bg-white shadow-sm lg:col-span-2">
            <CardContent className="p-6">
              <h3 className="text-lg font-bold text-slate-950">Implementation Rules</h3>
              <div className="mt-5 grid gap-4 sm:grid-cols-2">
                {[
                  ["Recognized tabs only", "Navigation and data models must only include the eight approved report tabs."],
                  ["Formula preserved", "Calculated fields should stay formula-driven in the source Sheet, then display as clean web metrics."],
                  ["Filter first design", "Every report section should include client, status, date range, and owner filters where relevant."],
                  ["Status color system", "On Track, Watchlist, and Off Track should use consistent colors across cards, tables, and alerts."],
                ].map(([title, text]) => (
                  <div key={title} className="rounded-2xl border border-slate-100 bg-slate-50 p-4">
                    <p className="font-semibold text-slate-950">{title}</p>
                    <p className="mt-2 text-sm leading-6 text-slate-600">{text}</p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card className="rounded-[1.75rem] border border-slate-200 bg-white shadow-sm">
            <CardContent className="p-6">
              <h3 className="text-lg font-bold text-slate-950">Recommended Data Flow</h3>
              <div className="mt-5 space-y-4">
                {[
                  "Google Sheet remains source of truth",
                  "Apps Script or Sheets API publishes approved tab data",
                  "Website renders filters, KPI cards, and report tables",
                  "AM team uses one clean hub for review and action items",
                ].map((step, index) => (
                  <div key={step} className="flex gap-3">
                    <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-[#9e6be5] text-xs font-bold text-white">{index + 1}</div>
                    <p className="text-sm leading-6 text-slate-600">{step}</p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </section>
      </main>
    </div>
  );
}
