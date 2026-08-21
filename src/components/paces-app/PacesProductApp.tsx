"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  Bot,
  Building2,
  Check,
  CheckCircle2,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  CircleHelp,
  CloudSun,
  Database,
  Download,
  FileCheck2,
  FileText,
  Filter,
  Layers3,
  LayoutGrid,
  ListFilter,
  LoaderCircle,
  LogOut,
  Map,
  MapPin,
  Menu,
  Moon,
  MoreHorizontal,
  PanelLeftClose,
  Plus,
  Search,
  Send,
  Settings,
  SlidersHorizontal,
  Sparkles,
  Star,
  Sun,
  Users,
  Wifi,
  WifiOff,
  X,
  Zap,
} from "lucide-react";
import { FormEvent, ReactNode, useEffect, useMemo, useState } from "react";
import { useLogin } from "@/context/LoginContext";
import { PacesDemoProvider, usePacesDemo } from "./PacesDemoContext";
import type { PacesProject, PacesSettings } from "@/lib/paces-api";
import styles from "./paces-product.module.css";

export type ProductView = "map" | "projects" | "reports" | "agent" | "data" | "team" | "settings";

type Site = {
  id: string;
  name: string;
  county: string;
  state: string;
  capacity: number;
  acres: number;
  buildable: number;
  score: number;
  stage: string;
  risk: "Low" | "Medium" | "High";
  marker: { left: string; top: string };
};

type PipelineSite = Site & { owner: string; due: string };

const fallbackSites: Site[] = [
  { id: "fallback-1", name: "Lone Star Solar", county: "Travis Co.", state: "TX", capacity: 240, acres: 1810, buildable: 1420, score: 9.2, stage: "Due diligence", risk: "Low", marker: { left: "58%", top: "31%" } },
  { id: "fallback-2", name: "High Plains Wind", county: "Sherman Co.", state: "KS", capacity: 420, acres: 6680, buildable: 5110, score: 8.9, stage: "Construction ready", risk: "Low", marker: { left: "44%", top: "52%" } },
  { id: "fallback-3", name: "Prairie Creek Storage", county: "McLean Co.", state: "IL", capacity: 180, acres: 226, buildable: 192, score: 8.7, stage: "Due diligence", risk: "Medium", marker: { left: "68%", top: "61%" } },
  { id: "fallback-4", name: "Redwood Data Campus", county: "Henrico Co.", state: "VA", capacity: 310, acres: 374, buildable: 301, score: 8.4, stage: "Submission", risk: "Medium", marker: { left: "31%", top: "69%" } },
  { id: "fallback-5", name: "Blue Ridge Solar", county: "Catawba Co.", state: "NC", capacity: 155, acres: 1124, buildable: 806, score: 7.9, stage: "Siting", risk: "High", marker: { left: "76%", top: "44%" } },
];

const markerPositions = [
  { left: "58%", top: "31%" }, { left: "44%", top: "52%" }, { left: "68%", top: "61%" },
  { left: "31%", top: "69%" }, { left: "76%", top: "44%" }, { left: "52%", top: "74%" },
];

function toSite(project: PacesProject, index: number): Site {
  return {
    id: project.id, name: project.name, county: `${project.county} Co.`, state: project.state,
    capacity: project.capacityMw, acres: project.acres, buildable: project.buildableAcres,
    score: project.score / 10, stage: project.stage, risk: project.risk,
    marker: markerPositions[index % markerPositions.length],
  };
}

function useSites() {
  const { data } = usePacesDemo();
  return useMemo(() => data?.projects?.length ? data.projects.map(toSite) : fallbackSites, [data]);
}

const navItems: { view: ProductView; label: string; href: string; icon: ReactNode }[] = [
  { view: "map", label: "Map", href: "/parcel/map", icon: <Map size={19} /> },
  { view: "projects", label: "Projects", href: "/projects", icon: <LayoutGrid size={19} /> },
  { view: "reports", label: "Reports", href: "/reports-center", icon: <FileText size={19} /> },
  { view: "agent", label: "Paces Agent", href: "/agent", icon: <Sparkles size={19} /> },
];

function PacesLogo({ compact = false }: { compact?: boolean }) {
  return (
    <span className={styles.logo} aria-label="Paces">
      <Image src="/paces-assets/paces-mark.svg" alt="" width={34} height={34} priority />
      {!compact ? <b>PACES</b> : null}
    </span>
  );
}

function ProductShell({ view, children }: { view: ProductView; children: ReactNode }) {
  const { username, logout } = useLogin();
  const { data, loading, syncing, error, refresh } = usePacesDemo();
  const router = useRouter();
  const [mobileNavOpen, setMobileNavOpen] = useState(false);
  const [theme, setTheme] = useState<"light" | "dark">("light");
  const [commandOpen, setCommandOpen] = useState(false);

  useEffect(() => {
    const stored = window.localStorage.getItem("paces:preferences:v1:theme");
    const preferred = window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
    setTheme(stored === "dark" || stored === "light" ? stored : preferred);
    const onKeyDown = (event: KeyboardEvent) => {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "k") {
        event.preventDefault();
        setCommandOpen((open) => !open);
      }
      if (event.key === "Escape") setCommandOpen(false);
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, []);

  const toggleTheme = () => {
    const next = theme === "light" ? "dark" : "light";
    setTheme(next);
    window.localStorage.setItem("paces:preferences:v1:theme", next);
  };

  const signOut = () => {
    logout();
    router.push("/login");
  };

  return (
    <div className={`${styles.appShell} ${theme === "dark" ? styles.darkTheme : ""}`}>
      <aside className={`${styles.sidebar} ${mobileNavOpen ? styles.sidebarOpen : ""}`}>
        <div className={styles.sidebarHead}>
          <Link href="/parcel/map" onClick={() => setMobileNavOpen(false)}><PacesLogo /></Link>
          <button className={styles.mobileClose} onClick={() => setMobileNavOpen(false)} aria-label="Close navigation"><X size={20} /></button>
        </div>
        <nav className={styles.primaryNav} aria-label="Product navigation">
          {navItems.map((item) => (
            <Link key={item.view} href={item.href} className={item.view === view ? styles.navActive : ""} onClick={() => setMobileNavOpen(false)}>
              {item.icon}<span>{item.label}</span>
              {item.view === "agent" ? <span className={styles.beta}>AI</span> : null}
            </Link>
          ))}
        </nav>
        <div className={styles.sidebarDivider} />
        <nav className={styles.secondaryNav} aria-label="Workspace navigation">
          <Link href="/data-library" className={view === "data" ? styles.navActive : ""} onClick={() => setMobileNavOpen(false)}><Database size={18} /><span>Data library</span></Link>
          <Link href="/team" className={view === "team" ? styles.navActive : ""} onClick={() => setMobileNavOpen(false)}><Users size={18} /><span>Team</span></Link>
        </nav>
        <div className={styles.sidebarBottom}>
          <Link href="/faq"><CircleHelp size={18} /><span>Help center</span></Link>
          <Link href="/account/settings" className={view === "settings" ? styles.navActive : ""}><Settings size={18} /><span>Settings</span></Link>
          <button onClick={signOut}><LogOut size={18} /><span>Sign out</span></button>
          <div className={styles.userCard}>
            <span className={styles.avatar}>{(username || "D").slice(0, 1).toUpperCase()}</span>
            <span><b>{username || "demo@paces.com"}</b><small>Development workspace</small></span>
            <MoreHorizontal size={17} />
          </div>
        </div>
      </aside>

      <section className={styles.workspace}>
        <header className={styles.topbar}>
          <button className={styles.mobileMenu} onClick={() => setMobileNavOpen(true)} aria-label="Open navigation"><Menu size={21} /></button>
          <div className={styles.mobileBrand}><PacesLogo /></div>
          <button className={styles.workspacePicker} onClick={() => setCommandOpen(true)}><span className={styles.workspaceMark}>P</span><span>{data?.settings.workspaceName || "Paces Development"}</span><kbd>⌘K</kbd></button>
          <div className={styles.topActions}>
            <span className={`${styles.syncStatus} ${error ? styles.syncError : ""}`}>{error ? <WifiOff size={14} /> : <Wifi size={14} />}{loading ? "Connecting" : syncing ? "Saving" : error ? "Offline" : "Live"}</span>
            <button className={styles.iconButton} onClick={toggleTheme} aria-label={`Switch to ${theme === "light" ? "dark" : "light"} theme`}>{theme === "light" ? <Moon size={18} /> : <Sun size={18} />}</button>
            <button className={styles.iconButton} aria-label="Open help"><CircleHelp size={19} /></button>
            <button className={styles.iconButton} aria-label="Open notifications"><span className={styles.notificationDot} /><CloudSun size={19} /></button>
            <button className={styles.agentButton} onClick={() => router.push("/agent")}><Sparkles size={16} />Ask Paces Agent</button>
          </div>
        </header>
        {error ? <div className={styles.serviceBanner}><WifiOff size={16} /><span><b>Demo service unavailable.</b> {error}</span><button onClick={() => void refresh()}>Retry</button></div> : null}
        {children}
      </section>
      {mobileNavOpen ? <button className={styles.navScrim} onClick={() => setMobileNavOpen(false)} aria-label="Close navigation" /> : null}
      {commandOpen ? <div className={styles.commandBackdrop} onMouseDown={() => setCommandOpen(false)}><section className={styles.commandPalette} role="dialog" aria-modal="true" aria-label="Quick navigation" onMouseDown={(event) => event.stopPropagation()}><header><Search size={18} /><input autoFocus placeholder="Jump to a workspace…" aria-label="Search workspace navigation" /><kbd>ESC</kbd></header><p>WORKSPACE</p>{[...navItems, { view: "data" as ProductView, label: "Data library", href: "/data-library", icon: <Database size={19} /> }, { view: "team" as ProductView, label: "Team", href: "/team", icon: <Users size={19} /> }].map((item) => <button key={item.href} onClick={() => { setCommandOpen(false); router.push(item.href); }}>{item.icon}<span>{item.label}</span><ChevronRight size={15} /></button>)}</section></div> : null}
    </div>
  );
}

function MapWorkspace() {
  const sites = useSites();
  const { saveSearch: persistSearch, createProject, data, syncing } = usePacesDemo();
  const [query, setQuery] = useState("");
  const [selectedId, setSelectedId] = useState<string>(sites[0].id);
  const [showFilters, setShowFilters] = useState(false);
  const [saved, setSaved] = useState(false);
  const [layerMenu, setLayerMenu] = useState(false);
  const [layers, setLayers] = useState(["Parcels", "Substations", "Transmission", "Wetlands"]);
  const [listCollapsed, setListCollapsed] = useState(false);
  const [notice, setNotice] = useState("");
  const selected = sites.find((site) => site.id === selectedId) || sites[0];

  const filteredSites = useMemo(() => {
    const normalized = query.trim().toLowerCase();
    return normalized ? sites.filter((site) => `${site.name} ${site.county} ${site.state}`.toLowerCase().includes(normalized)) : sites;
  }, [query, sites]);

  const toggleLayer = (name: string) => {
    setLayers((current) => current.includes(name) ? current.filter((layer) => layer !== name) : [...current, name]);
  };

  const saveSearch = async () => {
    try {
      await persistSearch(query ? `Search: ${query}` : "Virginia 300MW+", query, { minimumCapacity: 300, state: "VA" });
      setSaved(true);
      setNotice("Search saved to your workspace");
      window.setTimeout(() => setNotice(""), 2200);
    } catch { /* surfaced by the shared service banner */ }
  };

  const addProject = async () => {
    if (data?.projects.some((project) => project.id === selected.id)) {
      setNotice(`${selected.name} is already in Projects`);
      return;
    }
    try {
      await createProject({ name: selected.name, county: selected.county.replace(/ Co\.$/, ""), state: selected.state, capacityMw: selected.capacity, acres: selected.acres, buildableAcres: selected.buildable, score: Math.round(selected.score * 10), risk: selected.risk, owner: "Unassigned", stage: "Siting" });
      setNotice(`${selected.name} added to Projects`);
    } catch { /* surfaced by the shared service banner */ }
  };

  return (
    <main className={styles.mapPage}>
      <section className={`${styles.searchPanel} ${listCollapsed ? styles.searchPanelCollapsed : ""}`} aria-label="Site search">
        <div className={styles.panelTitleRow}>
          <div><span className={styles.eyebrow}>SITE ORIGINATION</span><h1>Search</h1></div>
          <button className={styles.iconButton} onClick={() => setListCollapsed((value) => !value)} aria-label={listCollapsed ? "Expand search panel" : "Collapse search panel"}>{listCollapsed ? <ChevronRight size={18} /> : <PanelLeftClose size={18} />}</button>
        </div>
        {!listCollapsed ? <>
          <div className={styles.searchBox}>
            <Search size={18} /><input aria-label="Search sites" value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search by region, state, etc…" /><button onClick={() => setShowFilters((value) => !value)} aria-label="Open search filters"><SlidersHorizontal size={18} /></button>
          </div>
          <div className={styles.filterChips}>
            <button onClick={() => setShowFilters((value) => !value)} className={showFilters ? styles.chipActive : ""}><Filter size={14} />Filters <span>4</span></button>
            <button>Virginia <X size={12} /></button>
            <button>300MW+ <X size={12} /></button>
          </div>
          {showFilters ? <div className={styles.filtersCard}>
            <div><span>Project type</span><button>Data center <ChevronDown size={13} /></button></div>
            <div><span>Minimum capacity</span><button>300 MW <ChevronDown size={13} /></button></div>
            <div><span>Parcel area</span><button>100+ acres <ChevronDown size={13} /></button></div>
            <div><span>Grid proximity</span><button>5 miles <ChevronDown size={13} /></button></div>
          </div> : null}
          <div className={styles.resultsHead}><span><b>{filteredSites.length}</b> priority parcels</span><button onClick={() => void saveSearch()} disabled={syncing}>{saved ? <Check size={14} /> : <Star size={14} />}{saved ? "Saved" : syncing ? "Saving…" : "Save search"}</button></div>
          <div className={styles.siteList}>
            {filteredSites.map((site, index) => <button key={site.id} onClick={() => setSelectedId(site.id)} className={selected.id === site.id ? styles.siteActive : ""}>
              <span className={styles.rank}>{index + 1}</span>
              <span className={styles.siteThumb} style={{ backgroundPosition: `${24 + index * 17}% ${30 + index * 11}%` }} />
              <span className={styles.siteCopy}><b>{site.name}</b><small>{site.county}, {site.state}</small><span><em>{site.capacity} MW</em><em>{site.acres} acres</em></span></span>
              <span className={styles.score}>{site.score}</span>
            </button>)}
            {filteredSites.length === 0 ? <div className={styles.emptyState}><MapPin size={25} /><b>No matching sites</b><span>Try a broader location or clear a filter.</span></div> : null}
          </div>
        </> : null}
      </section>

      <section className={styles.mapCanvas} aria-label="Interactive parcel map">
        <div className={styles.mapToolbar}>
          <button onClick={() => setLayerMenu((value) => !value)} className={layerMenu ? styles.toolbarActive : ""}><Layers3 size={17} />Layers <span>{layers.length}</span></button>
          <button><ListFilter size={17} />Legend</button>
          <button><MapPin size={17} />Draw area</button>
        </div>
        {layerMenu ? <div className={styles.layerCard}>
          <div><b>Map layers</b><button onClick={() => setLayerMenu(false)}><X size={16} /></button></div>
          {[
            ["Parcels", "Land"], ["Substations", "Power"], ["Transmission", "Power"], ["Wetlands", "Environmental"], ["Floodplains", "Environmental"], ["Permitting predictor", "Permitting"],
          ].map(([name, category]) => <label key={name}><input type="checkbox" checked={layers.includes(name)} onChange={() => toggleLayer(name)} /><span><b>{name}</b><small>{category}</small></span></label>)}
        </div> : null}
        <div className={styles.mapMode}><button className={styles.modeActive}>Satellite</button><button>Street</button></div>
        <div className={styles.zoomControl}><button aria-label="Zoom in">+</button><button aria-label="Zoom out">−</button></div>
        {sites.map((site) => <button key={site.id} className={`${styles.mapMarker} ${selected.id === site.id ? styles.markerActive : ""}`} style={site.marker} onClick={() => setSelectedId(site.id)} aria-label={`Select ${site.name}`}><span>{site.score.toFixed(1)}</span></button>)}
        <article className={styles.siteDetail}>
          <div className={styles.detailImage} />
          <div className={styles.detailContent}>
            <div className={styles.detailTop}><span className={styles.topSite}><Sparkles size={12} />Top site</span><button aria-label="More site actions"><MoreHorizontal size={18} /></button></div>
            <h2>{selected.name}</h2><p>{selected.county}, {selected.state}</p>
            <div className={styles.scoreLine}><b>{selected.score}</b><span><i style={{ width: `${selected.score * 10}%` }} /></span><small>Site score</small></div>
            <dl><div><dt>Capacity</dt><dd>{selected.capacity} MW</dd></div><div><dt>Parcel area</dt><dd>{selected.acres} acres</dd></div><div><dt>Buildable</dt><dd>{selected.buildable} acres</dd></div><div><dt>Risk level</dt><dd className={styles.lowRisk}>{selected.risk}</dd></div></dl>
            <div className={styles.constraintSummary}><span><CheckCircle2 size={16} /><b>No critical constraints found</b></span><small>Screened across power, permitting and environmental layers.</small></div>
            <div className={styles.detailActions}><button onClick={() => void addProject()} disabled={syncing}><Plus size={15} />{syncing ? "Saving…" : "Add project"}</button><Link href="/reports-center"><FileText size={15} />Order report</Link></div>
          </div>
        </article>
        {notice ? <div className={styles.toast}><CheckCircle2 size={17} />{notice}</div> : null}
      </section>
    </main>
  );
}

function ProjectsWorkspace() {
  const router = useRouter();
  const { data, moveProject: persistMove, syncing } = usePacesDemo();
  const [dragged, setDragged] = useState<{ id: string; stage: string } | null>(null);
  const [query, setQuery] = useState("");
  const [viewMode, setViewMode] = useState<"board" | "list">("board");
  const stages = ["Siting", "Due diligence", "Submission", "Construction ready"];
  const pipeline = useMemo<Record<string, PipelineSite[]>>(() => {
    const next = Object.fromEntries(stages.map((stage) => [stage, []])) as Record<string, PipelineSite[]>;
    if (data?.projects.length) {
      data.projects.forEach((project, index) => {
        const stage = stages.includes(project.stage) ? project.stage : "Siting";
        next[stage].push({ ...toSite(project, index), owner: project.owner, due: project.dueDate ? new Date(project.dueDate).toLocaleDateString(undefined, { month: "short", day: "numeric" }) : "No date" });
      });
    } else {
      fallbackSites.forEach((site, index) => next[site.stage].push({ ...site, owner: ["Jordan Lee", "Jordan Lee", "Maya Chen", "Alex Morgan", "Priya Shah"][index], due: "Syncing" }));
    }
    return next;
  }, [data]);

  const moveProject = async (id: string, from: string, to: string) => {
    if (from === to) return;
    try { await persistMove(id, to); } catch { /* surfaced by the shared service banner */ }
  };

  const allProjects = Object.entries(pipeline).flatMap(([stage, stageSites]) => stageSites.map((site) => ({ ...site, stage })));
  const visibleProjects = allProjects.filter((project) => project.name.toLowerCase().includes(query.toLowerCase()));

  return (
    <main className={styles.pageSurface}>
      <div className={styles.pageHeader}>
        <div><span className={styles.eyebrow}>PIPELINE MANAGEMENT</span><h1>Projects</h1><p>Track every opportunity from origination to shovel-ready.</p></div>
        <button className={styles.primaryAction} onClick={() => router.push("/parcel/map")}><Plus size={16} />New project</button>
      </div>
      <div className={styles.pageTools}>
        <label><Search size={17} /><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search projects" /></label>
        <button><Filter size={15} />Filter</button><button><Users size={15} />Owner</button>
        <span className={styles.toolSpacer} />
        <div className={styles.segmented}><button className={viewMode === "board" ? styles.selectedSegment : ""} onClick={() => setViewMode("board")}><LayoutGrid size={15} />Board</button><button className={viewMode === "list" ? styles.selectedSegment : ""} onClick={() => setViewMode("list")}><ListFilter size={15} />List</button></div>
      </div>
      {viewMode === "board" ? <div className={styles.pipelineBoard}>
        {stages.map((stage, stageIndex) => <section key={stage} className={styles.pipelineColumn} aria-busy={syncing} onDragOver={(event) => event.preventDefault()} onDrop={() => { if (dragged) void moveProject(dragged.id, dragged.stage, stage); setDragged(null); }}>
          <header><span className={`${styles.stageDot} ${stage === "Shovel ready" ? styles.stageComplete : ""}`} /><b>{stage}</b><em>{pipeline[stage].length}</em><button aria-label={`More ${stage} actions`}><MoreHorizontal size={16} /></button></header>
          <div className={styles.pipelineCards}>
            {pipeline[stage].filter((site) => site.name.toLowerCase().includes(query.toLowerCase())).map((site) => <article key={site.id} draggable onDragStart={() => setDragged({ id: site.id, stage })}>
              <div className={styles.cardImage} style={{ backgroundPosition: `${20 + stageIndex * 17}% ${24 + stageIndex * 12}%` }}><span>{site.score.toFixed(1)} score</span></div>
              <h3>{site.name}</h3><p><MapPin size={13} />{site.county}, {site.state}</p>
              <div className={styles.cardStats}><span><small>Capacity</small><b>{site.capacity} MW</b></span><span><small>Area</small><b>{site.acres} ac</b></span></div>
              <div className={styles.cardFooter}><span className={styles.tinyAvatar}>{site.owner.split(" ").map((part) => part[0]).join("")}</span><small>{site.due}</small>{stageIndex < stages.length - 1 ? <button onClick={() => void moveProject(site.id, stage, stages[stageIndex + 1])} disabled={syncing} aria-label={`Advance ${site.name}`}><ChevronRight size={15} /></button> : <CheckCircle2 size={16} />}</div>
            </article>)}
            {pipeline[stage].length === 0 ? <div className={styles.dropZone}><Plus size={17} /><span>Drop a project here</span></div> : null}
          </div>
        </section>)}
      </div> : <div className={styles.projectTable}>
        <div className={styles.tableRowHead}><span>Project</span><span>Stage</span><span>Capacity</span><span>Score</span><span>Owner</span><span /></div>
        {visibleProjects.map((project) => <div className={styles.tableRow} key={project.id}><span><span className={styles.tableThumb} /><b>{project.name}</b><small>{project.county}, {project.state}</small></span><span className={styles.stagePill}>{project.stage}</span><span>{project.capacity} MW</span><span>{project.score}</span><span>{project.owner}</span><button><MoreHorizontal size={17} /></button></div>)}
      </div>}
    </main>
  );
}

const reportCards = [
  { title: "Fast Modular Due Diligence", description: "Power, permitting, interconnection, environmental and site risk in one expert-reviewed report.", time: "5 business days", icon: <FileCheck2 size={21} />, tag: "Most popular" },
  { title: "N-1-1 Power Flow Study", description: "Model contingency risk and available power with expert validation for investment-grade decisions.", time: "10 business days", icon: <Zap size={21} />, tag: "Power" },
  { title: "Permitting Risk Report", description: "Jurisdiction, zoning, ordinance and approval-path analysis for a specific site.", time: "48 hours", icon: <Building2 size={21} />, tag: "Permitting" },
];

function ReportsWorkspace() {
  const { data, createReport, syncing } = usePacesDemo();
  const [activeTab, setActiveTab] = useState<"catalog" | "orders">("catalog");
  const [ordering, setOrdering] = useState<string | null>(null);
  const [projectId, setProjectId] = useState("");
  const [priority, setPriority] = useState("Standard");
  const ordered = data?.reports || [];

  useEffect(() => {
    if (!projectId && data?.projects[0]) setProjectId(data.projects[0].id);
  }, [data, projectId]);

  const confirmOrder = async () => {
    if (!ordering || !projectId) return;
    const type = ordering.includes("Permitting") ? "Permitting" : ordering.includes("Power") ? "Interconnection" : "Site diligence";
    try {
      await createReport({ projectId, type, priority });
      setOrdering(null);
      setActiveTab("orders");
    } catch { /* surfaced by the shared service banner */ }
  };

  const downloadSummary = (name: string) => {
    const blob = new Blob([`Paces report summary\n\n${name}\nStatus: Expert validated\nGenerated for the local product prototype.`], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = `${name.toLowerCase().replace(/[^a-z0-9]+/g, "-")}.txt`;
    anchor.click();
    URL.revokeObjectURL(url);
  };

  return (
    <main className={styles.pageSurface}>
      <div className={styles.pageHeader}><div><span className={styles.eyebrow}>DECISION-READY DILIGENCE</span><h1>Reports</h1><p>Order expert-validated analysis and track every deliverable.</p></div><button className={styles.primaryAction} onClick={() => setOrdering(reportCards[0].title)}><Plus size={16} />Order report</button></div>
      <div className={styles.tabBar}><button onClick={() => setActiveTab("catalog")} className={activeTab === "catalog" ? styles.tabActive : ""}>Report catalog</button><button onClick={() => setActiveTab("orders")} className={activeTab === "orders" ? styles.tabActive : ""}>My reports <span>{ordered.length}</span></button></div>
      {activeTab === "catalog" ? <>
        <section className={styles.reportHero}><div><span><Sparkles size={15} />PACES REPORTS</span><h2>De-risk every site before you invest.</h2><p>Modular diligence built on hundreds of integrated datasets, automation, and expert review.</p></div><Image src="/paces-dashboard/search-reference.avif" alt="Paces report site analysis preview" width={470} height={314} /></section>
        <div className={styles.reportGrid}>{reportCards.map((report) => <article key={report.title}><div className={styles.reportIcon}>{report.icon}</div><span className={styles.reportTag}>{report.tag}</span><h3>{report.title}</h3><p>{report.description}</p><div><span><CheckCircle2 size={14} />Expert validated</span><span><LoaderCircle size={14} />{report.time}</span></div><button onClick={() => setOrdering(report.title)}>Start report <ChevronRight size={15} /></button></article>)}</div>
      </> : <section className={styles.ordersTable}>
        <header><span>Report</span><span>Project</span><span>Status</span><span>Requested</span><span /></header>
        {ordered.map((report) => <div key={report.id}><span><span className={styles.fileBadge}><FileText size={18} /></span><b>{report.type}</b><small>{report.priority} delivery</small></span><span>{report.project}</span><span className={report.status === "Ready" ? styles.statusReady : styles.statusProgress}>{report.status === "Ready" ? <CheckCircle2 size={14} /> : <LoaderCircle size={14} />}{report.status}</span><span>{new Date(report.requestedAt).toLocaleDateString()}</span><button disabled={report.status !== "Ready"} onClick={() => downloadSummary(`${report.project} ${report.type}`)}><Download size={16} />Download</button></div>)}
        {ordered.length === 0 ? <div className={styles.tableEmpty}><FileText size={20} /><span>No reports yet. Start with modular diligence.</span></div> : null}
      </section>}
      {ordering ? <div className={styles.modalBackdrop} role="presentation" onMouseDown={() => setOrdering(null)}><section className={styles.orderModal} role="dialog" aria-modal="true" aria-labelledby="order-title" onMouseDown={(event) => event.stopPropagation()}><button className={styles.modalClose} onClick={() => setOrdering(null)} aria-label="Close report order"><X size={19} /></button><span className={styles.modalIcon}><FileCheck2 size={24} /></span><h2 id="order-title">Order {ordering}</h2><p>Select the project and confirm the diligence scope. A Paces expert reviews every high-stakes output.</p><label>Project<select value={projectId} onChange={(event) => setProjectId(event.target.value)}>{data?.projects.map((project) => <option key={project.id} value={project.id}>{project.name} — {project.county} Co., {project.state}</option>)}</select></label><label>Priority<select value={priority} onChange={(event) => setPriority(event.target.value)}><option value="Standard">Standard delivery</option><option value="Priority">Priority delivery</option></select></label><div className={styles.orderScope}><span><Check />Power and interconnection</span><span><Check />Permitting and zoning</span><span><Check />Environmental constraints</span><span><Check />Expert validation</span></div><div className={styles.modalActions}><button onClick={() => setOrdering(null)}>Cancel</button><button onClick={() => void confirmOrder()} disabled={syncing || !projectId}>{syncing ? "Creating…" : "Confirm order"} <ChevronRight size={15} /></button></div></section></div> : null}
    </main>
  );
}

type AgentMessage = { role: "agent" | "user"; text: string; result?: boolean };

function AgentWorkspace() {
  const sites = useSites();
  const { data, createAgentRun } = usePacesDemo();
  const [prompt, setPrompt] = useState("");
  const [busy, setBusy] = useState(false);
  const [messages, setMessages] = useState<AgentMessage[]>([
    { role: "agent", text: "Good afternoon. Tell me the development outcome you want, and I’ll coordinate the site, power, permitting, and pipeline work." },
  ]);

  const runPrompt = async (event?: FormEvent) => {
    event?.preventDefault();
    const task = prompt.trim();
    if (!task || busy) return;
    setMessages((current) => [...current, { role: "user", text: task }]);
    setPrompt("");
    setBusy(true);
    try {
      const run = await createAgentRun(task);
      setMessages((current) => [...current, { role: "agent", text: run.summary, result: true }]);
    } catch {
      setMessages((current) => [...current, { role: "agent", text: "I couldn’t reach the demo service. Check the connection banner and retry." }]);
    } finally {
      setBusy(false);
    }
  };

  const quickTask = (text: string) => { setPrompt(text); };

  return (
    <main className={styles.agentPage}>
      <aside className={styles.agentHistory}><div><h2>Agent runs</h2><button onClick={() => { setMessages(messages.slice(0, 1)); setPrompt(""); }} aria-label="New agent run"><Plus size={16} /></button></div><label><Search size={15} /><input placeholder="Search runs" /></label>{data?.agentRuns.length ? data.agentRuns.map((run, index) => <button key={run.id} className={index === 0 ? styles.runActive : ""}><Sparkles size={15} /><span><b>{run.prompt}</b><small>{new Date(run.createdAt).toLocaleDateString()}</small></span></button>) : <button className={styles.runActive}><Sparkles size={15} /><span><b>Start a new workflow</b><small>Ready</small></span></button>}</aside>
      <section className={styles.agentMain}>
        <header><div><span className={styles.agentOrb}><Sparkles size={20} /></span><span><h1>Paces Agent</h1><small><i />Ready to run development workflows</small></span></div><button><MoreHorizontal size={19} /></button></header>
        <div className={styles.chatScroller}>
          <div className={styles.agentIntro}><span className={styles.agentOrbLarge}><Bot size={28} /></span><h2>What are we building today?</h2><p>Direct an end-to-end workflow, or start with a common development task.</p><div>{["Identify viable sites", "Triage my pipeline", "Run permitting diligence", "Prepare an application"].map((task) => <button key={task} onClick={() => quickTask(task === "Identify viable sites" ? "Identify the top 100 data center sites in Virginia near substations with 300MW+ withdrawal capacity" : task)}>{task}<ChevronRight size={14} /></button>)}</div></div>
          <div className={styles.messages}>{messages.map((message, index) => <div key={index} className={message.role === "user" ? styles.userMessage : styles.agentMessage}>{message.role === "agent" ? <span className={styles.messageAvatar}><Sparkles size={14} /></span> : null}<div><p>{message.text}</p>{message.result ? <article className={styles.agentResult}><header><span><CheckCircle2 size={17} />Top {Math.min(3, sites.length)} opportunities prioritized</span><em>Live workspace data</em></header>{sites.slice(0, 3).map((site, siteIndex) => <Link href="/parcel/map" key={site.id}><span>{siteIndex + 1}</span><span className={styles.resultThumb} /><span><b>{site.name}</b><small>{site.county}, {site.state}</small></span><em>{site.capacity} MW</em><strong>{site.score}</strong></Link>)}<footer><Link href="/parcel/map">Open all results in Map <ChevronRight size={14} /></Link></footer></article> : null}</div></div>)}{busy ? <div className={styles.agentThinking}><span className={styles.messageAvatar}><Sparkles size={14} /></span><p><i /><i /><i />Paces Agent is screening datasets…</p></div> : null}</div>
        </div>
        <form className={styles.agentComposer} onSubmit={(event) => void runPrompt(event)}><button type="button" aria-label="Attach project context"><Plus size={18} /></button><textarea value={prompt} onChange={(event) => setPrompt(event.target.value)} placeholder="Ask Paces Agent to run a workflow…" rows={1} onKeyDown={(event) => { if (event.key === "Enter" && !event.shiftKey) { event.preventDefault(); void runPrompt(); } }} /><button type="submit" disabled={!prompt.trim() || busy} aria-label="Send request"><Send size={17} /></button><small>Paces Agent can make mistakes. Expert review is included for high-stakes deliverables.</small></form>
      </section>
    </main>
  );
}

function SettingsWorkspace() {
  const { data, saveSettings, syncing } = usePacesDemo();
  const [saved, setSaved] = useState(false);
  const [form, setForm] = useState<PacesSettings>({ workspaceName: "Paces Development", primaryMarket: "Virginia", projectType: "Data center", capacityUnit: "MW", expertReviewNotifications: true, weeklyPipelineSummary: true });

  useEffect(() => { if (data?.settings) setForm(data.settings); }, [data]);

  const update = <K extends keyof PacesSettings>(key: K, value: PacesSettings[K]) => setForm((current) => ({ ...current, [key]: value }));
  const submit = async () => {
    try {
      await saveSettings(form);
      setSaved(true);
      window.setTimeout(() => setSaved(false), 1800);
    } catch { /* surfaced by the shared service banner */ }
  };

  return <main className={styles.pageSurface}><div className={styles.pageHeader}><div><span className={styles.eyebrow}>WORKSPACE</span><h1>Settings</h1><p>Configure your development workspace and default project criteria.</p></div><button className={styles.primaryAction} onClick={() => void submit()} disabled={syncing}>{saved ? <Check size={16} /> : null}{saved ? "Saved" : syncing ? "Saving…" : "Save changes"}</button></div><div className={styles.settingsLayout}><nav><button className={styles.settingsActive}>General</button><button>Project defaults</button><button>Data connections</button><button>Notifications</button><button>Security</button></nav><section><h2>General settings</h2><p>These details appear across your shared Paces workspace.</p><div className={styles.settingsForm}><label>Workspace name<input value={form.workspaceName} onChange={(event) => update("workspaceName", event.target.value)} /></label><label>Primary market<select value={form.primaryMarket} onChange={(event) => update("primaryMarket", event.target.value)}><option>Virginia</option><option>Texas</option><option>United States — national</option></select></label><label>Default project type<select value={form.projectType} onChange={(event) => update("projectType", event.target.value)}><option>Data center</option><option>Solar</option><option>Battery storage</option></select></label><label>Default capacity unit<select value={form.capacityUnit} onChange={(event) => update("capacityUnit", event.target.value)}><option value="MW">Megawatts (MW)</option><option value="GW">Gigawatts (GW)</option></select></label></div><label className={styles.settingToggle}><span><b>Expert review notifications</b><small>Notify project owners when an expert-validated deliverable is ready.</small></span><input type="checkbox" checked={form.expertReviewNotifications} onChange={(event) => update("expertReviewNotifications", event.target.checked)} /></label><label className={styles.settingToggle}><span><b>Weekly pipeline summary</b><small>Email a weekly digest of project risk and stage changes.</small></span><input type="checkbox" checked={form.weeklyPipelineSummary} onChange={(event) => update("weeklyPipelineSummary", event.target.checked)} /></label></section></div></main>;
}

function UtilityWorkspace({ view }: { view: "data" | "team" | "settings" }) {
  const { data } = usePacesDemo();
  if (view === "data") {
    const categories = [
      ["Power & grid", "Substations, transmission, queue, hosting and withdrawal capacity", "48 datasets", <Zap key="power" size={20} />],
      ["Permitting", "Jurisdictions, zoning, ordinances, timelines and permitting predictor", "31 datasets", <Building2 key="permits" size={20} />],
      ["Environmental", "Wetlands, floodplains, species, conservation and contamination", "42 datasets", <CloudSun key="environment" size={20} />],
      ["Land & ownership", "Parcels, acreage, buildable area, ownership and site control", "28 datasets", <MapPin key="land" size={20} />],
    ] as const;
    return <main className={styles.pageSurface}><div className={styles.pageHeader}><div><span className={styles.eyebrow}>CONNECTED DATA</span><h1>Data library</h1><p>Public, proprietary, and workspace data that powers every Paces workflow.</p></div><button className={styles.primaryAction}><Plus size={16} />Add workspace data</button></div><div className={styles.librarySummary}><div><Database size={23} /><span><b>149 connected datasets</b><small>Updated continuously across development categories</small></span></div><div><span><b>142</b><small>Updated this week</small></span><span><b>7</b><small>Workspace sources</small></span></div></div><div className={styles.libraryGrid}>{categories.map(([title, copy, count, icon]) => <article key={title}><span>{icon}</span><em>{count}</em><h2>{title}</h2><p>{copy}</p><button>Browse datasets <ChevronRight size={15} /></button></article>)}</div></main>;
  }
  if (view === "team") {
    const members = (data?.team || []).map((member) => [member.name, member.name.split(" ").map((part) => part[0]).join(""), member.role, member.status]);
    return <main className={styles.pageSurface}><div className={styles.pageHeader}><div><span className={styles.eyebrow}>WORKSPACE COLLABORATION</span><h1>Team</h1><p>Manage access and keep development work coordinated.</p></div><button className={styles.primaryAction}><Plus size={16} />Invite member</button></div><section className={styles.teamTable}><header><span>Member</span><span>Role</span><span>Last active</span><span>Access</span><span /></header>{members.map(([name, initials, role, active], index) => <div key={name}><span><i>{initials}</i><span><b>{name}</b><small>{index === 3 ? "services@paces.com" : `${name.toLowerCase().replace(" ", ".")}@paces.dev`}</small></span></span><span>{role}</span><span><i className={styles.onlineDot} />{active}</span><span>{index === 0 ? "Full workspace" : "Projects & reports"}</span><button aria-label={`More actions for ${name}`}><MoreHorizontal size={17} /></button></div>)}</section></main>;
  }
  return <SettingsWorkspace />;
}

export default function PacesProductApp({ view }: { view: ProductView }) {
  const pathname = usePathname();
  const resolvedView: ProductView = pathname.startsWith("/projects") ? "projects" : pathname.startsWith("/reports-center") ? "reports" : pathname.startsWith("/agent") ? "agent" : pathname.startsWith("/data-library") ? "data" : pathname.startsWith("/team") ? "team" : pathname.startsWith("/account/settings") ? "settings" : view;
  const content = resolvedView === "map" ? <MapWorkspace /> : resolvedView === "projects" ? <ProjectsWorkspace /> : resolvedView === "reports" ? <ReportsWorkspace /> : resolvedView === "agent" ? <AgentWorkspace /> : <UtilityWorkspace view={resolvedView} />;
  return <PacesDemoProvider><ProductShell view={resolvedView}>{content}</ProductShell></PacesDemoProvider>;
}
