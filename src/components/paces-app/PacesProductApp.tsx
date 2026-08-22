"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import {
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
  GitCompareArrows,
  Layers3,
  LayoutGrid,
  ListFilter,
  LoaderCircle,
  LocateFixed,
  LogOut,
  Map,
  MapPin,
  Menu,
  Moon,
  MoreHorizontal,
  PanelLeftClose,
  Plus,
  RotateCcw,
  Ruler,
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
import { PacesMapSurface, type DrawSummary, type MapCommand } from "./PacesMapSurface";
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
  coordinate: [number, number];
};

type PipelineSite = Site & { owner: string; due: string };

const fallbackSites: Site[] = [
  { id: "fallback-1", name: "Lone Star Solar", county: "Travis Co.", state: "TX", capacity: 240, acres: 1810, buildable: 1420, score: 9.2, stage: "Due diligence", risk: "Low", coordinate: [-97.7427, 30.2682] },
  { id: "fallback-2", name: "High Plains Wind", county: "Sherman Co.", state: "KS", capacity: 420, acres: 6680, buildable: 5110, score: 8.9, stage: "Construction ready", risk: "Low", coordinate: [-101.774, 39.351] },
  { id: "fallback-3", name: "Prairie Creek Storage", county: "McLean Co.", state: "IL", capacity: 180, acres: 226, buildable: 192, score: 8.7, stage: "Due diligence", risk: "Medium", coordinate: [-88.9937, 40.4842] },
  { id: "fallback-4", name: "Redwood Data Campus", county: "Henrico Co.", state: "VA", capacity: 310, acres: 374, buildable: 301, score: 8.4, stage: "Submission", risk: "Medium", coordinate: [-77.398, 37.541] },
  { id: "fallback-5", name: "Blue Ridge Solar", county: "Catawba Co.", state: "NC", capacity: 155, acres: 1124, buildable: 806, score: 7.9, stage: "Siting", risk: "High", coordinate: [-81.173, 35.706] },
];

const stateCenters: Record<string, [number, number]> = {
  TX: [-97.743, 30.267], KS: [-101.78, 39.35], IL: [-88.994, 40.484], VA: [-77.398, 37.541], NC: [-81.173, 35.706],
  GA: [-84.388, 33.749], AZ: [-112.074, 33.448], CA: [-121.494, 38.582], OH: [-82.999, 39.961], PA: [-76.884, 40.273],
};

function toSite(project: PacesProject, index: number): Site {
  const center = stateCenters[project.state] || [-98.5, 39.5];
  const coordinate: [number, number] = [center[0] + (index % 3) * 0.035, center[1] + (index % 2) * 0.028];
  return {
    id: project.id, name: project.name, county: `${project.county} Co.`, state: project.state,
    capacity: project.capacityMw, acres: project.acres, buildable: project.buildableAcres,
    score: project.score / 10, stage: project.stage, risk: project.risk,
    coordinate,
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
      <AgentLogoMark size="medium" />
      {!compact ? <b>PACES</b> : null}
    </span>
  );
}

function AgentLogoMark({ size = "large" }: { size?: "small" | "medium" | "large" }) {
  return <span className={`${styles.agentLogoMark} ${styles[`agentLogoMark${size[0].toUpperCase()}${size.slice(1)}`]}`} aria-hidden="true"><i /><i /><b /></span>;
}

function ProductShell({ view, children }: { view: ProductView; children: ReactNode }) {
  const { username, logout } = useLogin();
  const { data, loading, syncing, error, refresh } = usePacesDemo();
  const router = useRouter();
  const [mobileNavOpen, setMobileNavOpen] = useState(false);
  const [theme, setTheme] = useState<"light" | "dark">("light");
  const [commandOpen, setCommandOpen] = useState(false);

  useEffect(() => {
    const stored = window.localStorage.getItem("paces:preferences:v2:theme");
    setTheme(stored === "dark" || stored === "light" ? stored : "light");
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
    window.localStorage.setItem("paces:preferences:v2:theme", next);
  };

  const signOut = () => {
    logout();
    router.push("/login");
  };

  return (
    <div className={`${styles.appShell} ${theme === "dark" ? styles.darkTheme : ""} ${view === "agent" ? styles.agentReferenceShell : ""}`}>
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
            <button className={styles.agentButton} onClick={() => router.push("/agent")}><Sparkles size={16} /><span>Ask Paces Agent</span></button>
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
  const [draftFilters, setDraftFilters] = useState({ state: "", minimumCapacity: 0, minimumAcres: 0, maximumRisk: "Any" });
  const [appliedFilters, setAppliedFilters] = useState(draftFilters);
  const [saved, setSaved] = useState(false);
  const [layerMenu, setLayerMenu] = useState(false);
  const [legendOpen, setLegendOpen] = useState(false);
  const [drawMode, setDrawMode] = useState(false);
  const [mapMode, setMapMode] = useState<"satellite" | "street">("satellite");
  const [layers, setLayers] = useState(["Parcels", "Substations", "Transmission", "Hosting capacity", "Wetlands"]);
  const [mapCommand, setMapCommand] = useState<MapCommand>({ id: 0, type: "fit-results" });
  const [drawSummary, setDrawSummary] = useState<DrawSummary>({ points: 0, acres: 0 });
  const [compareIds, setCompareIds] = useState<string[]>([]);
  const [compareOpen, setCompareOpen] = useState(false);
  const [listCollapsed, setListCollapsed] = useState(false);
  const [mobileDetailOpen, setMobileDetailOpen] = useState(false);
  const [notice, setNotice] = useState("");
  const selected = sites.find((site) => site.id === selectedId) || sites[0];

  const filteredSites = useMemo(() => {
    const normalized = query.trim().toLowerCase();
    const riskRank = { Low: 1, Medium: 2, High: 3 } as const;
    const maximumRisk = appliedFilters.maximumRisk === "Any" ? 3 : riskRank[appliedFilters.maximumRisk as keyof typeof riskRank];
    return sites.filter((site) => {
      if (normalized && !`${site.name} ${site.county} ${site.state}`.toLowerCase().includes(normalized)) return false;
      if (appliedFilters.state && site.state !== appliedFilters.state) return false;
      if (site.capacity < appliedFilters.minimumCapacity || site.acres < appliedFilters.minimumAcres) return false;
      return riskRank[site.risk] <= maximumRisk;
    });
  }, [appliedFilters, query, sites]);

  const activeFilterCount = [appliedFilters.state, appliedFilters.minimumCapacity > 0, appliedFilters.minimumAcres > 0, appliedFilters.maximumRisk !== "Any"].filter(Boolean).length;

  const sendMapCommand = (type: MapCommand["type"]) => setMapCommand((current) => ({ id: current.id + 1, type }));
  const comparedSites = sites.filter((site) => compareIds.includes(site.id));
  const gridDistance = Math.max(0.7, Number(((10 - selected.score) * 1.45).toFixed(1)));
  const wetlandsImpact = selected.risk === "Low" ? 0 : selected.risk === "Medium" ? Math.max(2, Math.round(selected.acres * 0.018)) : Math.max(8, Math.round(selected.acres * 0.052));

  const toggleCompare = (id: string) => {
    setCompareIds((current) => {
      if (current.includes(id)) return current.filter((siteId) => siteId !== id);
      if (current.length >= 3) {
        setNotice("Compare up to three sites at a time");
        return current;
      }
      return [...current, id];
    });
  };

  const toggleLayer = (name: string) => {
    setLayers((current) => current.includes(name) ? current.filter((layer) => layer !== name) : [...current, name]);
  };

  const saveSearch = async () => {
    try {
      await persistSearch(query ? `Search: ${query}` : "Priority parcel search", query, appliedFilters);
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
      <section className={`${styles.searchPanel} ${listCollapsed ? styles.searchPanelCollapsed : ""} ${mobileDetailOpen ? styles.searchPanelUnderDetail : ""}`} aria-label="Site search">
        <div className={styles.panelTitleRow}>
          <div><span className={styles.eyebrow}>SITE ORIGINATION</span><h1>Search</h1></div>
          <button className={styles.iconButton} onClick={() => setListCollapsed((value) => !value)} aria-label={listCollapsed ? "Expand search panel" : "Collapse search panel"}>{listCollapsed ? <ChevronRight size={18} /> : <PanelLeftClose size={18} />}</button>
        </div>
        {!listCollapsed ? <>
          <div className={styles.searchBox}>
            <Search size={18} /><input aria-label="Search sites" value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search by region, state, etc…" /><button onClick={() => setShowFilters((value) => !value)} aria-label="Open search filters"><SlidersHorizontal size={18} /></button>
          </div>
          <div className={styles.filterChips}>
            <button onClick={() => setShowFilters((value) => !value)} className={showFilters ? styles.chipActive : ""}><Filter size={14} />Filters <span>{activeFilterCount}</span></button>
            {appliedFilters.state ? <button onClick={() => setAppliedFilters((current) => ({ ...current, state: "" }))}>{appliedFilters.state} <X size={12} /></button> : null}
            {appliedFilters.minimumCapacity > 0 ? <button onClick={() => setAppliedFilters((current) => ({ ...current, minimumCapacity: 0 }))}>{appliedFilters.minimumCapacity}MW+ <X size={12} /></button> : null}
            {appliedFilters.minimumAcres > 0 ? <button onClick={() => setAppliedFilters((current) => ({ ...current, minimumAcres: 0 }))}>{appliedFilters.minimumAcres} acres+ <X size={12} /></button> : null}
            {appliedFilters.maximumRisk !== "Any" ? <button onClick={() => setAppliedFilters((current) => ({ ...current, maximumRisk: "Any" }))}>{appliedFilters.maximumRisk} risk max <X size={12} /></button> : null}
          </div>
          {showFilters ? <div className={styles.filtersCard}>
            <label><span>State</span><select value={draftFilters.state} onChange={(event) => setDraftFilters((current) => ({ ...current, state: event.target.value }))}><option value="">All states</option>{Array.from(new Set(sites.map((site) => site.state))).sort().map((state) => <option key={state}>{state}</option>)}</select></label>
            <label><span>Minimum capacity</span><select value={draftFilters.minimumCapacity} onChange={(event) => setDraftFilters((current) => ({ ...current, minimumCapacity: Number(event.target.value) }))}><option value={0}>Any capacity</option><option value={150}>150 MW+</option><option value={300}>300 MW+</option><option value={400}>400 MW+</option></select></label>
            <label><span>Parcel area</span><select value={draftFilters.minimumAcres} onChange={(event) => setDraftFilters((current) => ({ ...current, minimumAcres: Number(event.target.value) }))}><option value={0}>Any parcel</option><option value={100}>100+ acres</option><option value={500}>500+ acres</option><option value={1000}>1,000+ acres</option></select></label>
            <label><span>Maximum risk</span><select value={draftFilters.maximumRisk} onChange={(event) => setDraftFilters((current) => ({ ...current, maximumRisk: event.target.value }))}><option>Any</option><option>Low</option><option>Medium</option><option>High</option></select></label>
            <div className={styles.filterActions}><button onClick={() => { const reset = { state: "", minimumCapacity: 0, minimumAcres: 0, maximumRisk: "Any" }; setDraftFilters(reset); setAppliedFilters(reset); window.setTimeout(() => sendMapCommand("fit-results"), 0); }}>Clear</button><button onClick={() => { setAppliedFilters(draftFilters); setShowFilters(false); window.setTimeout(() => sendMapCommand("fit-results"), 0); }}>Apply filters</button></div>
          </div> : null}
          <div className={styles.resultsHead}><span><b>{filteredSites.length}</b> priority parcels</span><button onClick={() => void saveSearch()} disabled={syncing}>{saved ? <Check size={14} /> : <Star size={14} />}{saved ? "Saved" : syncing ? "Saving…" : "Save search"}</button></div>
          <div className={styles.siteList}>
            {filteredSites.map((site, index) => <button key={site.id} onClick={() => { setSelectedId(site.id); setMobileDetailOpen(true); window.setTimeout(() => sendMapCommand("focus-selected"), 0); }} className={selected.id === site.id ? styles.siteActive : ""}>
              <span className={styles.rank}>{index + 1}</span>
              <span className={styles.siteThumb} style={{ backgroundPosition: `${24 + index * 17}% ${30 + index * 11}%` }} />
              <span className={styles.siteCopy}><b>{site.name}</b><small>{site.county}, {site.state}</small><span><em>{site.capacity} MW</em><em>{site.acres} acres</em></span></span>
              <span className={styles.score}>{site.score}</span>
            </button>)}
            {filteredSites.length === 0 ? <div className={styles.emptyState}><MapPin size={25} /><b>No matching sites</b><span>Try a broader location or clear a filter.</span></div> : null}
          </div>
        </> : null}
      </section>

      <section className={`${styles.mapCanvas} ${drawMode ? styles.drawMode : ""}`} aria-label="Interactive parcel map">
        <PacesMapSurface
          sites={filteredSites}
          selectedId={selected.id}
          layers={layers}
          mapMode={mapMode}
          drawMode={drawMode}
          command={mapCommand}
          onSelect={(id) => { setSelectedId(id); setMobileDetailOpen(true); }}
          onDrawChange={setDrawSummary}
        />
        <div className={styles.mapToolbar}>
          <button onClick={() => setLayerMenu((value) => !value)} className={layerMenu ? styles.toolbarActive : ""}><Layers3 size={17} />Layers <span>{layers.length}</span></button>
          <button onClick={() => setLegendOpen((value) => !value)} className={legendOpen ? styles.toolbarActive : ""}><ListFilter size={17} />Legend</button>
          <button onClick={() => setDrawMode((value) => !value)} className={drawMode ? styles.toolbarActive : ""}><Ruler size={17} />{drawMode ? "Finish area" : "Measure area"}</button>
          <button onClick={() => sendMapCommand("fit-results")}><LocateFixed size={17} />Fit results</button>
        </div>
        {layerMenu ? <div className={styles.layerCard}>
          <div><span><b>Map layers</b><small>{layers.length} visible · live demo data</small></span><button onClick={() => setLayerMenu(false)}><X size={16} /></button></div>
          {[
            ["Parcels", "Land", "County assessor"], ["Substations", "Power", "Updated weekly"], ["Transmission", "Power", "230–345 kV"], ["Hosting capacity", "Power", "Modeled capacity"], ["Wetlands", "Environmental", "NWI screening"], ["Floodplains", "Environmental", "FEMA screening"], ["Permitting predictor", "Permitting", "Paces score"],
          ].map(([name, category, freshness]) => <label key={name}><input type="checkbox" checked={layers.includes(name)} onChange={() => toggleLayer(name)} /><span><b>{name}</b><small>{category} · {freshness}</small></span><em>{layers.includes(name) ? "ON" : "OFF"}</em></label>)}
        </div> : null}
        {legendOpen ? <aside className={styles.legendCard} aria-label="Map legend"><b>Map legend</b><span><i className={styles.legendParcel} />Low-risk parcel</span><span><i className={styles.legendPower} />Transmission line</span><span><i className={styles.legendSubstation} />Substation / capacity</span><span><i className={styles.legendWater} />Wetland constraint</span><span><i className={styles.legendFlood} />Floodplain</span></aside> : null}
        {drawMode ? <div className={styles.drawHint}><Ruler size={16} /><span><b>Measure site area</b><small>{drawSummary.points < 3 ? `Tap the map to add boundary points · ${drawSummary.points} placed` : `${drawSummary.points} points · approximately ${drawSummary.acres.toLocaleString()} acres`}</small></span>{drawSummary.points ? <button onClick={() => sendMapCommand("clear-drawing")}>Clear</button> : null}<button onClick={() => setDrawMode(false)}>Done</button></div> : null}
        <div className={styles.mapMode}><button className={mapMode === "satellite" ? styles.modeActive : ""} onClick={() => setMapMode("satellite")}>Satellite</button><button className={mapMode === "street" ? styles.modeActive : ""} onClick={() => setMapMode("street")}>Street</button></div>
        <div className={styles.zoomControl}><button aria-label="Zoom in" onClick={() => sendMapCommand("zoom-in")}>+</button><button aria-label="Zoom out" onClick={() => sendMapCommand("zoom-out")}>−</button><button aria-label="Reset map orientation" onClick={() => sendMapCommand("reset-north")}><RotateCcw size={14} /></button></div>
        <article className={`${styles.siteDetail} ${mobileDetailOpen ? styles.mobileDetailOpen : ""}`}>
          <div className={styles.detailImage} />
          <div className={styles.detailContent}>
            <div className={styles.detailTop}><span className={styles.topSite}><Sparkles size={12} />Top site</span><button className={styles.mobileDetailClose} onClick={() => setMobileDetailOpen(false)} aria-label="Close site details"><X size={18} /></button><button className={styles.desktopDetailMenu} aria-label="More site actions"><MoreHorizontal size={18} /></button></div>
            <h2>{selected.name}</h2><p>{selected.county}, {selected.state} · {selected.coordinate[1].toFixed(4)}, {selected.coordinate[0].toFixed(4)}</p>
            <div className={styles.scoreLine}><b>{selected.score}</b><span><i style={{ width: `${selected.score * 10}%` }} /></span><small>Site score</small></div>
            <dl><div><dt>Capacity</dt><dd>{selected.capacity} MW</dd></div><div><dt>Parcel area</dt><dd>{selected.acres} acres</dd></div><div><dt>Buildable</dt><dd>{selected.buildable} acres</dd></div><div><dt>Risk level</dt><dd className={styles.lowRisk}>{selected.risk}</dd></div></dl>
            <div className={styles.constraintGrid}><span><small>Nearest substation</small><b>{gridDistance} mi</b></span><span><small>Available capacity</small><b>{Math.round(selected.score * 42)} MW</b></span><span><small>Wetland overlap</small><b>{wetlandsImpact} acres</b></span><span><small>Flood exposure</small><b>{selected.risk === "High" ? "Elevated" : selected.risk === "Medium" ? "Review" : "Minimal"}</b></span></div>
            <div className={`${styles.constraintSummary} ${selected.risk === "High" ? styles.constraintWarning : ""}`}><span><CheckCircle2 size={16} /><b>{selected.risk === "Low" ? "No critical constraints found" : selected.risk === "Medium" ? "Two constraints need review" : "Diligence review recommended"}</b></span><small>Pre-screened across power, permitting, floodplain, and wetland layers.</small></div>
            <div className={styles.detailActions}><button onClick={() => void addProject()} disabled={syncing}><Plus size={15} />{syncing ? "Saving…" : "Add project"}</button><Link href="/reports-center"><FileText size={15} />Order report</Link></div>
            <button className={`${styles.compareToggle} ${compareIds.includes(selected.id) ? styles.compareToggleActive : ""}`} onClick={() => toggleCompare(selected.id)}><GitCompareArrows size={14} />{compareIds.includes(selected.id) ? "Remove from comparison" : "Add to site comparison"}</button>
          </div>
        </article>
        {compareIds.length ? <div className={styles.compareTray}><span><GitCompareArrows size={16} /><b>{compareIds.length}</b> site{compareIds.length === 1 ? "" : "s"} selected</span><button onClick={() => setCompareIds([])}>Clear</button><button onClick={() => setCompareOpen(true)} disabled={compareIds.length < 2}>Compare</button></div> : null}
        {notice ? <div className={styles.toast}><CheckCircle2 size={17} />{notice}</div> : null}
      </section>
      {compareOpen ? <div className={styles.modalBackdrop} onMouseDown={() => setCompareOpen(false)}><section className={`${styles.orderModal} ${styles.mapCompareModal}`} role="dialog" aria-modal="true" aria-labelledby="compare-title" onMouseDown={(event) => event.stopPropagation()}><button className={styles.modalClose} onClick={() => setCompareOpen(false)} aria-label="Close site comparison"><X size={17} /></button><span className={styles.modalIcon}><GitCompareArrows size={22} /></span><h2 id="compare-title">Compare priority sites</h2><p>Review capacity, usable land, grid proximity, and screening risk side by side.</p><div className={styles.comparisonGrid}>{comparedSites.map((site, index) => <article key={site.id} className={index === 0 ? styles.comparisonLeader : ""}><header><span>{index === 0 ? "BEST FIT" : `OPTION ${index + 1}`}</span><b>{site.score.toFixed(1)}</b></header><h3>{site.name}</h3><small>{site.county}, {site.state}</small><dl><div><dt>Capacity</dt><dd>{site.capacity} MW</dd></div><div><dt>Buildable</dt><dd>{site.buildable.toLocaleString()} ac</dd></div><div><dt>Grid distance</dt><dd>{Math.max(0.7, Number(((10 - site.score) * 1.45).toFixed(1)))} mi</dd></div><div><dt>Risk</dt><dd>{site.risk}</dd></div></dl><button onClick={() => { setSelectedId(site.id); setCompareOpen(false); setMobileDetailOpen(true); window.setTimeout(() => sendMapCommand("focus-selected"), 0); }}>Open on map</button></article>)}</div><div className={styles.modalActions}><button onClick={() => setCompareOpen(false)}>Close</button><button onClick={() => { setCompareOpen(false); setNotice("Comparison exported to your workspace"); }}><Download size={14} />Export summary</button></div></section></div> : null}
    </main>
  );
}

function ProjectsWorkspace() {
  const router = useRouter();
  const { data, createProject, updateProject, moveProject: persistMove, syncing } = usePacesDemo();
  const [dragged, setDragged] = useState<{ id: string; stage: string } | null>(null);
  const [query, setQuery] = useState("");
  const [viewMode, setViewMode] = useState<"board" | "list">("board");
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [stageFilter, setStageFilter] = useState("All");
  const [riskFilter, setRiskFilter] = useState("All");
  const [ownerFilter, setOwnerFilter] = useState("All");
  const [newProjectOpen, setNewProjectOpen] = useState(false);
  const [selectedProjectId, setSelectedProjectId] = useState<string | null>(null);
  const [formError, setFormError] = useState("");
  const [projectDraft, setProjectDraft] = useState({ name: "", county: "", state: "VA", capacityMw: 300, acres: 250, projectType: "Data center" });
  const [projectEdits, setProjectEdits] = useState({ stage: "Siting", owner: "Unassigned", dueDate: "" });
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
  const owners = Array.from(new Set(allProjects.map((project) => project.owner))).sort();
  const matchesFilters = (project: PipelineSite) => project.name.toLowerCase().includes(query.toLowerCase()) && (stageFilter === "All" || project.stage === stageFilter) && (riskFilter === "All" || project.risk === riskFilter) && (ownerFilter === "All" || project.owner === ownerFilter);
  const visibleProjects = allProjects.filter(matchesFilters);
  const selectedProject = allProjects.find((project) => project.id === selectedProjectId);
  const activeFilters = [stageFilter !== "All", riskFilter !== "All", ownerFilter !== "All"].filter(Boolean).length;

  const openProject = (project: PipelineSite) => {
    setSelectedProjectId(project.id);
    const source = data?.projects.find((item) => item.id === project.id);
    setProjectEdits({ stage: project.stage, owner: project.owner, dueDate: source?.dueDate || "" });
  };

  const submitProject = async () => {
    setFormError("");
    if (projectDraft.name.trim().length < 3 || projectDraft.county.trim().length < 2 || !/^[A-Za-z]{2}$/.test(projectDraft.state)) {
      setFormError("Add a project name, county, and two-letter state code.");
      return;
    }
    try {
      await createProject({
        name: projectDraft.name.trim(), county: projectDraft.county.trim(), state: projectDraft.state.toUpperCase(),
        capacityMw: projectDraft.capacityMw, acres: projectDraft.acres, buildableAcres: Math.round(projectDraft.acres * .78),
        score: 75, risk: "Low", owner: "Unassigned", stage: "Siting",
      });
      setProjectDraft({ name: "", county: "", state: "VA", capacityMw: 300, acres: 250, projectType: "Data center" });
      setNewProjectOpen(false);
    } catch { /* surfaced by the shared service banner */ }
  };

  const saveProjectDetails = async () => {
    if (!selectedProject) return;
    try {
      await updateProject(selectedProject.id, { stage: projectEdits.stage, owner: projectEdits.owner, dueDate: projectEdits.dueDate || null });
      setSelectedProjectId(null);
    } catch { /* surfaced by the shared service banner */ }
  };

  return (
    <main className={styles.pageSurface}>
      <div className={styles.pageHeader}>
        <div><span className={styles.eyebrow}>PIPELINE MANAGEMENT</span><h1>Projects</h1><p>Track every opportunity from origination to shovel-ready.</p></div>
        <button className={styles.primaryAction} onClick={() => setNewProjectOpen(true)}><Plus size={16} />New project</button>
      </div>
      <div className={styles.pageTools}>
        <label><Search size={17} /><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search projects" /></label>
        <button className={filtersOpen ? styles.toolActive : ""} onClick={() => setFiltersOpen((value) => !value)}><Filter size={15} />Filter{activeFilters ? <span className={styles.toolCount}>{activeFilters}</span> : null}</button>
        <button onClick={() => setFiltersOpen(true)}><Users size={15} />{ownerFilter === "All" ? "Owner" : ownerFilter}</button>
        <span className={styles.toolSpacer} />
        <div className={styles.segmented}><button className={viewMode === "board" ? styles.selectedSegment : ""} onClick={() => setViewMode("board")}><LayoutGrid size={15} />Board</button><button className={viewMode === "list" ? styles.selectedSegment : ""} onClick={() => setViewMode("list")}><ListFilter size={15} />List</button></div>
      </div>
      {filtersOpen ? <section className={styles.projectFilters} aria-label="Project filters"><label>Stage<select value={stageFilter} onChange={(event) => setStageFilter(event.target.value)}><option>All</option>{stages.map((stage) => <option key={stage}>{stage}</option>)}</select></label><label>Risk<select value={riskFilter} onChange={(event) => setRiskFilter(event.target.value)}><option>All</option><option>Low</option><option>Medium</option><option>High</option></select></label><label>Owner<select value={ownerFilter} onChange={(event) => setOwnerFilter(event.target.value)}><option>All</option>{owners.map((owner) => <option key={owner}>{owner}</option>)}</select></label><button onClick={() => { setStageFilter("All"); setRiskFilter("All"); setOwnerFilter("All"); }}>Clear filters</button><span>{visibleProjects.length} projects shown</span></section> : null}
      {viewMode === "board" ? <div className={styles.pipelineBoard}>
        {stages.map((stage, stageIndex) => {
          const stageProjects = pipeline[stage].filter(matchesFilters);
          return <section key={stage} className={styles.pipelineColumn} aria-busy={syncing} onDragOver={(event) => event.preventDefault()} onDrop={() => { if (dragged) void moveProject(dragged.id, dragged.stage, stage); setDragged(null); }}>
            <header><span className={`${styles.stageDot} ${stage === "Construction ready" ? styles.stageComplete : ""}`} /><b>{stage}</b><em>{stageProjects.length}</em><button aria-label={`More ${stage} actions`}><MoreHorizontal size={16} /></button></header>
            <div className={styles.pipelineCards}>
              {stageProjects.map((site) => <article key={site.id} draggable onDragStart={() => setDragged({ id: site.id, stage })}>
                <div className={styles.cardImage} style={{ backgroundPosition: `${20 + stageIndex * 17}% ${24 + stageIndex * 12}%` }}><span>{site.score.toFixed(1)} score</span></div>
                <button className={styles.cardDetails} onClick={() => openProject(site)}><b>{site.name}</b><small><MapPin size={13} />{site.county}, {site.state}</small></button>
                <div className={styles.cardStats}><span><small>Capacity</small><b>{site.capacity} MW</b></span><span><small>Area</small><b>{site.acres} ac</b></span></div>
                <div className={styles.cardFooter}><span className={styles.tinyAvatar}>{site.owner.split(" ").map((part) => part[0]).join("")}</span><small>{site.due}</small>{stageIndex < stages.length - 1 ? <button onClick={() => void moveProject(site.id, stage, stages[stageIndex + 1])} disabled={syncing} aria-label={`Advance ${site.name}`}><ChevronRight size={15} /></button> : <CheckCircle2 size={16} />}</div>
              </article>)}
              {stageProjects.length === 0 ? <div className={styles.dropZone}><Plus size={17} /><span>{activeFilters || query ? "No matching projects" : "Drop a project here"}</span></div> : null}
            </div>
          </section>;
        })}
      </div> : <div className={styles.projectTable}>
        <div className={styles.tableRowHead}><span>Project</span><span>Stage</span><span>Capacity</span><span>Score</span><span>Owner</span><span /></div>
        {visibleProjects.map((project) => <div className={styles.tableRow} key={project.id}><span><span className={styles.tableThumb} /><b>{project.name}</b><small>{project.county}, {project.state}</small></span><span className={styles.stagePill}>{project.stage}</span><span>{project.capacity} MW</span><span>{project.score}</span><span>{project.owner}</span><button onClick={() => openProject(project)} aria-label={`Open ${project.name}`}><MoreHorizontal size={17} /></button></div>)}
      </div>}
      {newProjectOpen ? <div className={styles.modalBackdrop} role="presentation" onMouseDown={() => setNewProjectOpen(false)}><section className={`${styles.orderModal} ${styles.projectModal}`} role="dialog" aria-modal="true" aria-labelledby="new-project-title" onMouseDown={(event) => event.stopPropagation()}><button className={styles.modalClose} onClick={() => setNewProjectOpen(false)} aria-label="Close new project form"><X size={19} /></button><span className={styles.modalIcon}><MapPin size={23} /></span><h2 id="new-project-title">Create a development project</h2><p>Add the core site criteria now. Paces will carry the project through screening, diligence, and submission.</p><div className={styles.projectForm}><label>Project name<input autoFocus value={projectDraft.name} maxLength={160} onChange={(event) => setProjectDraft((current) => ({ ...current, name: event.target.value }))} placeholder="Ashburn North Campus" /></label><label>Project type<select value={projectDraft.projectType} onChange={(event) => setProjectDraft((current) => ({ ...current, projectType: event.target.value }))}><option>Data center</option><option>Solar</option><option>Battery storage</option><option>Wind</option></select></label><label>County<input value={projectDraft.county} maxLength={100} onChange={(event) => setProjectDraft((current) => ({ ...current, county: event.target.value }))} placeholder="Loudoun" /></label><label>State<input value={projectDraft.state} maxLength={2} onChange={(event) => setProjectDraft((current) => ({ ...current, state: event.target.value.toUpperCase().replace(/[^A-Z]/g, "") }))} /></label><label>Capacity (MW)<input type="number" min={1} max={50000} value={projectDraft.capacityMw} onChange={(event) => setProjectDraft((current) => ({ ...current, capacityMw: Number(event.target.value) }))} /></label><label>Parcel area (acres)<input type="number" min={1} max={1000000} value={projectDraft.acres} onChange={(event) => setProjectDraft((current) => ({ ...current, acres: Number(event.target.value) }))} /></label></div>{formError ? <p className={styles.formError} role="alert">{formError}</p> : null}<div className={styles.modalActions}><button onClick={() => setNewProjectOpen(false)}>Cancel</button><button onClick={() => void submitProject()} disabled={syncing}>{syncing ? "Creating…" : "Create project"}<ChevronRight size={15} /></button></div></section></div> : null}
      {selectedProject ? <div className={styles.modalBackdrop} role="presentation" onMouseDown={() => setSelectedProjectId(null)}><section className={`${styles.orderModal} ${styles.projectDetailModal}`} role="dialog" aria-modal="true" aria-labelledby="project-detail-title" onMouseDown={(event) => event.stopPropagation()}><button className={styles.modalClose} onClick={() => setSelectedProjectId(null)} aria-label="Close project details"><X size={19} /></button><span className={styles.modalIcon}><Building2 size={23} /></span><h2 id="project-detail-title">{selectedProject.name}</h2><p>{selectedProject.county}, {selectedProject.state} · {selectedProject.capacity} MW · score {selectedProject.score}</p><div className={styles.projectHealth}><span><small>Risk</small><b>{selectedProject.risk}</b></span><span><small>Buildable</small><b>{selectedProject.buildable} acres</b></span><span><small>Readiness</small><b>{Math.round(selectedProject.score * 10)}%</b></span></div><div className={styles.projectForm}><label>Stage<select value={projectEdits.stage} onChange={(event) => setProjectEdits((current) => ({ ...current, stage: event.target.value }))}>{stages.map((stage) => <option key={stage}>{stage}</option>)}</select></label><label>Owner<select value={projectEdits.owner} onChange={(event) => setProjectEdits((current) => ({ ...current, owner: event.target.value }))}><option>Unassigned</option>{owners.filter((owner) => owner !== "Unassigned").map((owner) => <option key={owner}>{owner}</option>)}</select></label><label>Target date<input type="date" value={projectEdits.dueDate} onChange={(event) => setProjectEdits((current) => ({ ...current, dueDate: event.target.value }))} /></label></div><div className={styles.projectNextStep}><Sparkles size={17} /><span><b>Recommended next step</b><small>{selectedProject.stage === "Siting" ? "Order modular diligence before site-control spend." : selectedProject.stage === "Due diligence" ? "Review power and permitting constraints in parallel." : "Confirm submission package completeness."}</small></span></div><div className={styles.modalActions}><button onClick={() => { setSelectedProjectId(null); router.push(`/reports-center?project=${encodeURIComponent(selectedProject.id)}`); }}>Order report</button><button onClick={() => void saveProjectDetails()} disabled={syncing}>{syncing ? "Saving…" : "Save project"}<ChevronRight size={15} /></button></div></section></div> : null}
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
  const searchParams = useSearchParams();
  const [activeTab, setActiveTab] = useState<"catalog" | "orders">("catalog");
  const [ordering, setOrdering] = useState<string | null>(null);
  const [projectId, setProjectId] = useState("");
  const [priority, setPriority] = useState("Standard");
  const [handledProject, setHandledProject] = useState("");
  const ordered = data?.reports || [];

  useEffect(() => {
    if (!projectId && data?.projects[0]) setProjectId(data.projects[0].id);
  }, [data, projectId]);

  useEffect(() => {
    const requestedProject = searchParams.get("project") || "";
    if (!requestedProject || requestedProject === handledProject || !data?.projects.some((project) => project.id === requestedProject)) return;
    setProjectId(requestedProject);
    setOrdering(reportCards[0].title);
    setHandledProject(requestedProject);
  }, [data, handledProject, searchParams]);

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

const demoAgentSites = [
  { name: "Ashburn North", location: "Loudoun Co.", capacity: "480 MW", score: "9.6" },
  { name: "Manassas East", location: "Prince William Co.", capacity: "420 MW", score: "9.1" },
  { name: "Bealeton Substation", location: "Fauquier Co.", capacity: "380 MW", score: "8.7" },
  { name: "Remington Area", location: "Culpeper Co.", capacity: "310 MW", score: "8.3" },
  { name: "Warrenton South", location: "Fauquier Co.", capacity: "260 MW", score: "7.9" },
];

function AgentWorkspace() {
  const sites = useSites();
  const { data, createAgentRun } = usePacesDemo();
  const [prompt, setPrompt] = useState("");
  const [busy, setBusy] = useState(false);
  const [messages, setMessages] = useState<AgentMessage[]>([]);

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
      <aside className={styles.agentHistory}><div><h2>Agent runs</h2><button onClick={() => { setMessages([]); setPrompt(""); }} aria-label="New agent run"><Plus size={16} /></button></div><label><Search size={15} /><input placeholder="Search runs" /></label>{data?.agentRuns.length ? data.agentRuns.map((run, index) => <button key={run.id} className={index === 0 ? styles.runActive : ""}><Sparkles size={15} /><span><b>{run.prompt}</b><small>{new Date(run.createdAt).toLocaleDateString()}</small></span></button>) : <button className={styles.runActive}><Sparkles size={15} /><span><b>Virginia data center origination</b><small>Demo workflow</small></span></button>}</aside>
      <section className={styles.agentMain}>
        <header><div><span className={styles.agentOrb}><AgentLogoMark size="small" /></span><span><h1>Paces Agent</h1><small><i />Autonomous execution</small></span></div><button aria-label="Agent options"><MoreHorizontal size={19} /></button></header>
        <div className={styles.chatScroller}>
          <section className={styles.agentIntro} aria-labelledby="agent-title">
            <span className={styles.agentOrbLarge}><AgentLogoMark /></span>
            <span className={styles.agentKicker}>PACES AGENT</span>
            <h2 id="agent-title">Autonomous Execution</h2>
            <p>Run complete power development workflows, end to end.</p>
            <div className={styles.agentCapabilities} aria-label="Agent capabilities">
              <span><MapPin size={15} />Origination</span>
              <span><Zap size={15} />Power diligence</span>
              <span><FileCheck2 size={15} />Permitting</span>
            </div>
          </section>

          <section className={styles.demoWorkflow} aria-label="Featured autonomous workflow">
            <div className={styles.demoPrompt}><span>Identify the top 100 data center sites in Virginia near substations with 300MW+ withdrawal capacity</span><button onClick={() => quickTask("Identify the top 100 data center sites in Virginia near substations with 300MW+ withdrawal capacity")} aria-label="Reuse this prompt"><ChevronRight size={15} /></button></div>
            <div className={styles.demoProgress}>
              <span><i />Substation withdrawal capacity was queried across Virginia</span>
              <span><i />1,254 matching parcels were screened</span>
              <span><i />Results were ranked by proximity, capacity, and permitting risk</span>
            </div>
            <article className={styles.demoResultCard}>
              <header><div><h3>Done — 1,254 qualifying sites found</h3><p>Showing top 100 · ranked by grid proximity and withdrawal capacity</p></div><em>EXPERT READY</em></header>
              <div className={styles.demoResultHead}><span>#</span><span>Location</span><span>Capacity</span><span>Score</span></div>
              {demoAgentSites.map((site, index) => <Link href="/parcel/map" key={site.name} className={styles.demoResultRow}><span>{index + 1}</span><span className={styles.demoParcel}><i /></span><span><b>{site.name}</b><small>{site.location}, VA</small></span><em>{site.capacity}</em><strong><i style={{ width: `${Number(site.score) * 10}%` }} />{site.score}</strong></Link>)}
              <footer><Link href="/parcel/map">Open all results in Map <ChevronRight size={14} /></Link></footer>
            </article>

            <div className={styles.powerStudyPreview}>
              <div className={styles.powerStudyCopy}><span className={styles.agentMiniMark}><AgentLogoMark size="small" /></span><p>Recommended POI is the 345 kV line touching the northeast corner of the site. Your expert-reviewed N-1-1 study can be ready in 48 hours.</p></div>
              <article className={styles.powerStudyMap}>
                <div><b>Loudoun Co. — Ashburn North</b><small>480 MW · 350.72 acres</small></div>
                <span className={styles.poiCard}><b>345 kV — POI</b><small>NE corner · Ashburn North</small></span>
                <span className={styles.siteBoundary}>Loudoun Co. Site</span>
                <i className={styles.lineOne} /><i className={styles.lineTwo} /><i className={styles.lineThree} />
              </article>
            </div>
          </section>
          <div className={styles.messages}>{messages.map((message, index) => <div key={index} className={message.role === "user" ? styles.userMessage : styles.agentMessage}>{message.role === "agent" ? <span className={styles.messageAvatar}><Sparkles size={14} /></span> : null}<div><p>{message.text}</p>{message.result ? <article className={styles.agentResult}><header><span><CheckCircle2 size={17} />Top {Math.min(3, sites.length)} opportunities prioritized</span><em>Live workspace data</em></header>{sites.slice(0, 3).map((site, siteIndex) => <Link href="/parcel/map" key={site.id}><span>{siteIndex + 1}</span><span className={styles.resultThumb} /><span><b>{site.name}</b><small>{site.county}, {site.state}</small></span><em>{site.capacity} MW</em><strong>{site.score}</strong></Link>)}<footer><Link href="/parcel/map">Open all results in Map <ChevronRight size={14} /></Link></footer></article> : null}</div></div>)}{busy ? <div className={styles.agentThinking}><span className={styles.messageAvatar}><Sparkles size={14} /></span><p><i /><i /><i />Paces Agent is screening datasets…</p></div> : null}</div>
        </div>
        <form className={styles.agentComposer} onSubmit={(event) => void runPrompt(event)}><button type="button" aria-label="Attach project context"><Plus size={18} /></button><textarea value={prompt} onChange={(event) => setPrompt(event.target.value)} placeholder="Tell Paces Agent the development outcome you need…" rows={1} onKeyDown={(event) => { if (event.key === "Enter" && !event.shiftKey) { event.preventDefault(); void runPrompt(); } }} /><button type="submit" disabled={!prompt.trim() || busy} aria-label="Run workflow"><Send size={17} /></button><small>Autonomous execution · expert-grade results</small></form>
      </section>
    </main>
  );
}

function SettingsWorkspace() {
  const { data, saveSettings, syncing } = usePacesDemo();
  const { username } = useLogin();
  const [saved, setSaved] = useState(false);
  const [activeSection, setActiveSection] = useState<"general" | "defaults" | "connections" | "notifications" | "security">("general");
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

  const section = activeSection === "general" ? <><h2>General settings</h2><p>These details appear across your shared Paces workspace.</p><div className={styles.settingsForm}><label>Workspace name<input value={form.workspaceName} maxLength={120} onChange={(event) => update("workspaceName", event.target.value)} /></label><label>Primary market<select value={form.primaryMarket} onChange={(event) => update("primaryMarket", event.target.value)}><option>Virginia</option><option>Texas</option><option>United States — national</option></select></label></div></> : activeSection === "defaults" ? <><h2>Project defaults</h2><p>Use consistent assumptions when new opportunities enter the pipeline.</p><div className={styles.settingsForm}><label>Default project type<select value={form.projectType} onChange={(event) => update("projectType", event.target.value)}><option>Data center</option><option>Solar</option><option>Battery storage</option></select></label><label>Default capacity unit<select value={form.capacityUnit} onChange={(event) => update("capacityUnit", event.target.value)}><option value="MW">Megawatts (MW)</option><option value="GW">Gigawatts (GW)</option></select></label></div><div className={styles.settingsNote}><Sparkles size={17} /><span><b>Applied to new projects</b><small>Existing project assumptions are not changed.</small></span></div></> : activeSection === "connections" ? <><h2>Data connections</h2><p>Monitor the trusted data feeding search, scoring, and diligence.</p><div className={styles.connectionList}>{data?.dataCategories.map((category) => <div key={category.name}><span className={styles.onlineDot} /><span><b>{category.name}</b><small>{category.layers} layers · {category.freshness}</small></span><em>Healthy</em></div>)}</div></> : activeSection === "notifications" ? <><h2>Notifications</h2><p>Keep project owners informed without adding operational noise.</p><label className={styles.settingToggle}><span><b>Expert review notifications</b><small>Notify owners when an expert-validated deliverable is ready.</small></span><input type="checkbox" checked={form.expertReviewNotifications} onChange={(event) => update("expertReviewNotifications", event.target.checked)} /></label><label className={styles.settingToggle}><span><b>Weekly pipeline summary</b><small>Email a weekly digest of project risk and stage changes.</small></span><input type="checkbox" checked={form.weeklyPipelineSummary} onChange={(event) => update("weeklyPipelineSummary", event.target.checked)} /></label></> : <><h2>Security</h2><p>Review the authenticated demo session and workspace boundary.</p><div className={styles.securityPanel}><span className={styles.avatar}>{(username || "D").slice(0, 1).toUpperCase()}</span><span><b>{username || "demo@paces.com"}</b><small>Current authenticated workspace member</small></span><em><CheckCircle2 size={14} />Session active</em></div><div className={styles.settingsNote}><CheckCircle2 size={17} /><span><b>Isolated Paces workspace</b><small>Paces records use their own API scope and tables; pest-control records are not shared.</small></span></div></>;

  return <main className={styles.pageSurface}><div className={styles.pageHeader}><div><span className={styles.eyebrow}>WORKSPACE</span><h1>Settings</h1><p>Configure your development workspace and default project criteria.</p></div>{activeSection !== "connections" && activeSection !== "security" ? <button className={styles.primaryAction} onClick={() => void submit()} disabled={syncing}>{saved ? <Check size={16} /> : null}{saved ? "Saved" : syncing ? "Saving…" : "Save changes"}</button> : null}</div><div className={styles.settingsLayout}><nav>{([['general','General'],['defaults','Project defaults'],['connections','Data connections'],['notifications','Notifications'],['security','Security']] as const).map(([id,label]) => <button key={id} className={activeSection === id ? styles.settingsActive : ""} onClick={() => setActiveSection(id)}>{label}</button>)}</nav><section>{section}</section></div></main>;
}

function UtilityWorkspace({ view }: { view: "data" | "team" | "settings" }) {
  const { data, createDataSource, inviteTeamMember, syncing } = usePacesDemo();
  const [expandedCategory, setExpandedCategory] = useState("");
  const [dataModalOpen, setDataModalOpen] = useState(false);
  const [inviteModalOpen, setInviteModalOpen] = useState(false);
  const [utilityError, setUtilityError] = useState("");
  const [sourceDraft, setSourceDraft] = useState({ name: "", category: "Power & grid", sourceType: "CSV upload" });
  const [inviteDraft, setInviteDraft] = useState({ name: "", email: "", role: "Viewer", access: "View only" });
  const catalog = [
    { title: "Power & grid", copy: "Substations, transmission, queue, hosting and withdrawal capacity", count: "48 datasets", icon: <Zap key="power" size={20} />, datasets: ["Substation withdrawal capacity", "Transmission lines & voltage", "Interconnection queue", "N-1 contingency constraints"] },
    { title: "Permitting", copy: "Jurisdictions, zoning, ordinances, timelines and permitting predictor", count: "31 datasets", icon: <Building2 key="permits" size={20} />, datasets: ["County ordinances", "Zoning compatibility", "Permit matrix", "Community sentiment"] },
    { title: "Environmental", copy: "Wetlands, floodplains, species, conservation and contamination", count: "42 datasets", icon: <CloudSun key="environment" size={20} />, datasets: ["National Wetlands Inventory", "FEMA flood hazards", "Protected species", "Hazardous sites"] },
    { title: "Land & ownership", copy: "Parcels, acreage, buildable area, ownership and site control", count: "28 datasets", icon: <MapPin key="land" size={20} />, datasets: ["Parcel boundaries", "Assessor ownership", "Buildable acreage", "Road access"] },
  ];

  const submitSource = async () => {
    setUtilityError("");
    if (sourceDraft.name.trim().length < 3) { setUtilityError("Enter a descriptive source name."); return; }
    try {
      await createDataSource({ ...sourceDraft, name: sourceDraft.name.trim() });
      setSourceDraft({ name: "", category: "Power & grid", sourceType: "CSV upload" });
      setDataModalOpen(false);
    } catch { /* surfaced by shared service banner */ }
  };

  const submitInvite = async () => {
    setUtilityError("");
    if (inviteDraft.name.trim().length < 2 || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(inviteDraft.email)) { setUtilityError("Enter the member’s name and a valid email address."); return; }
    try {
      await inviteTeamMember({ ...inviteDraft, name: inviteDraft.name.trim(), email: inviteDraft.email.trim().toLowerCase() });
      setInviteDraft({ name: "", email: "", role: "Viewer", access: "View only" });
      setInviteModalOpen(false);
    } catch { /* surfaced by shared service banner */ }
  };

  if (view === "data") {
    const sources = data?.workspaceSources || [];
    return <main className={styles.pageSurface}><div className={styles.pageHeader}><div><span className={styles.eyebrow}>CONNECTED DATA</span><h1>Data library</h1><p>Public, proprietary, and workspace data that powers every Paces workflow.</p></div><button className={styles.primaryAction} onClick={() => { setUtilityError(""); setDataModalOpen(true); }}><Plus size={16} />Add workspace data</button></div><div className={styles.librarySummary}><div><Database size={23} /><span><b>{149 + sources.length} connected datasets</b><small>Updated continuously across development categories</small></span></div><div><span><b>142</b><small>Updated this week</small></span><span><b>{sources.length}</b><small>Workspace sources</small></span></div></div>{sources.length ? <section className={styles.workspaceSources}><header><span><b>Workspace sources</b><small>Private data available to your Paces workflows</small></span><em>{sources.length} connected</em></header>{sources.map((source) => <div key={source.id}><Database size={17} /><span><b>{source.name}</b><small>{source.category} · {source.sourceType}</small></span><em><i className={styles.onlineDot} />{source.status}</em></div>)}</section> : null}<div className={styles.libraryGrid}>{catalog.map((category) => <article key={category.title} className={expandedCategory === category.title ? styles.libraryExpanded : ""}><span>{category.icon}</span><em>{category.count}</em><h2>{category.title}</h2><p>{category.copy}</p><button onClick={() => setExpandedCategory((current) => current === category.title ? "" : category.title)}>{expandedCategory === category.title ? "Hide datasets" : "Browse datasets"} <ChevronDown size={15} /></button>{expandedCategory === category.title ? <div className={styles.datasetList}>{category.datasets.map((dataset) => <span key={dataset}><CheckCircle2 size={14} />{dataset}</span>)}</div> : null}</article>)}</div>{dataModalOpen ? <div className={styles.modalBackdrop} role="presentation" onMouseDown={() => setDataModalOpen(false)}><section className={styles.orderModal} role="dialog" aria-modal="true" aria-labelledby="source-title" onMouseDown={(event) => event.stopPropagation()}><button className={styles.modalClose} onClick={() => setDataModalOpen(false)} aria-label="Close data source form"><X size={19} /></button><span className={styles.modalIcon}><Database size={23} /></span><h2 id="source-title">Connect workspace data</h2><p>Add a named source to the isolated Paces workspace. File transfer can be connected later without changing the data contract.</p><div className={styles.projectForm}><label>Source name<input autoFocus maxLength={120} value={sourceDraft.name} onChange={(event) => setSourceDraft((current) => ({ ...current, name: event.target.value }))} placeholder="Virginia queue export" /></label><label>Category<select value={sourceDraft.category} onChange={(event) => setSourceDraft((current) => ({ ...current, category: event.target.value }))}>{catalog.map((category) => <option key={category.title}>{category.title}</option>)}</select></label><label>Source type<select value={sourceDraft.sourceType} onChange={(event) => setSourceDraft((current) => ({ ...current, sourceType: event.target.value }))}><option>CSV upload</option><option>GeoJSON upload</option><option>Secure API</option><option>Cloud warehouse</option></select></label></div>{utilityError ? <p className={styles.formError} role="alert">{utilityError}</p> : null}<div className={styles.modalActions}><button onClick={() => setDataModalOpen(false)}>Cancel</button><button onClick={() => void submitSource()} disabled={syncing}>{syncing ? "Connecting…" : "Connect source"}<ChevronRight size={15} /></button></div></section></div> : null}</main>;
  }
  if (view === "team") {
    const members = data?.team || [];
    return <main className={styles.pageSurface}><div className={styles.pageHeader}><div><span className={styles.eyebrow}>WORKSPACE COLLABORATION</span><h1>Team</h1><p>Manage access and keep development work coordinated.</p></div><button className={styles.primaryAction} onClick={() => { setUtilityError(""); setInviteModalOpen(true); }}><Plus size={16} />Invite member</button></div><section className={styles.teamTable}><header><span>Member</span><span>Role</span><span>Last active</span><span>Access</span><span /></header>{members.map((member) => <div key={member.id}><span><i>{member.name.split(" ").map((part) => part[0]).join("")}</i><span><b>{member.name}</b><small>{member.email || `${member.name.toLowerCase().replace(" ", ".")}@paces.dev`}</small></span></span><span>{member.role}</span><span><i className={styles.onlineDot} />{member.status}</span><span>{member.access || "Projects & reports"}</span><span /></div>)}</section>{inviteModalOpen ? <div className={styles.modalBackdrop} role="presentation" onMouseDown={() => setInviteModalOpen(false)}><section className={styles.orderModal} role="dialog" aria-modal="true" aria-labelledby="invite-title" onMouseDown={(event) => event.stopPropagation()}><button className={styles.modalClose} onClick={() => setInviteModalOpen(false)} aria-label="Close invitation form"><X size={19} /></button><span className={styles.modalIcon}><Users size={23} /></span><h2 id="invite-title">Invite a workspace member</h2><p>Assign the minimum access this person needs. They will appear as invited until they join.</p><div className={styles.projectForm}><label>Full name<input autoFocus maxLength={120} value={inviteDraft.name} onChange={(event) => setInviteDraft((current) => ({ ...current, name: event.target.value }))} placeholder="Taylor Reed" /></label><label>Email address<input type="email" maxLength={254} value={inviteDraft.email} onChange={(event) => setInviteDraft((current) => ({ ...current, email: event.target.value }))} placeholder="taylor@company.com" /></label><label>Role<select value={inviteDraft.role} onChange={(event) => setInviteDraft((current) => ({ ...current, role: event.target.value }))}><option>Development lead</option><option>GIS analyst</option><option>Permitting</option><option>Interconnection</option><option>Viewer</option></select></label><label>Access<select value={inviteDraft.access} onChange={(event) => setInviteDraft((current) => ({ ...current, access: event.target.value }))}><option>Full workspace</option><option>Projects & reports</option><option>View only</option></select></label></div>{utilityError ? <p className={styles.formError} role="alert">{utilityError}</p> : null}<div className={styles.modalActions}><button onClick={() => setInviteModalOpen(false)}>Cancel</button><button onClick={() => void submitInvite()} disabled={syncing}>{syncing ? "Sending…" : "Send invitation"}<ChevronRight size={15} /></button></div></section></div> : null}</main>;
  }
  return <SettingsWorkspace />;
}

export default function PacesProductApp({ view }: { view: ProductView }) {
  const pathname = usePathname();
  const resolvedView: ProductView = pathname.startsWith("/projects") ? "projects" : pathname.startsWith("/reports-center") ? "reports" : pathname.startsWith("/agent") ? "agent" : pathname.startsWith("/data-library") ? "data" : pathname.startsWith("/team") ? "team" : pathname.startsWith("/account/settings") ? "settings" : view;
  const content = resolvedView === "map" ? <MapWorkspace /> : resolvedView === "projects" ? <ProjectsWorkspace /> : resolvedView === "reports" ? <ReportsWorkspace /> : resolvedView === "agent" ? <AgentWorkspace /> : <UtilityWorkspace view={resolvedView} />;
  return <PacesDemoProvider><ProductShell view={resolvedView}>{content}</ProductShell></PacesDemoProvider>;
}
