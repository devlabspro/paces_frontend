"use client";

import type { GeoJSONSource, Map as MapLibreMap, MapMouseEvent, StyleSpecification } from "maplibre-gl";
import { useEffect, useRef } from "react";
import styles from "./paces-product.module.css";

export type GeoSite = {
  id: string;
  name: string;
  score: number;
  risk: "Low" | "Medium" | "High";
  acres: number;
  coordinate: [number, number];
};

export type MapCommand = {
  id: number;
  type: "zoom-in" | "zoom-out" | "fit-results" | "focus-selected" | "reset-north" | "clear-drawing";
};

export type DrawSummary = {
  points: number;
  acres: number;
};

type Props = {
  sites: GeoSite[];
  selectedId: string;
  layers: string[];
  mapMode: "satellite" | "street";
  drawMode: boolean;
  command: MapCommand;
  onSelect: (id: string) => void;
  onDrawChange: (summary: DrawSummary) => void;
};

type FeatureCollection = GeoJSON.FeatureCollection<GeoJSON.Geometry, GeoJSON.GeoJsonProperties>;

const emptyCollection: FeatureCollection = { type: "FeatureCollection", features: [] };

function parcelPolygon(site: GeoSite): GeoJSON.Feature<GeoJSON.Polygon> {
  const [longitude, latitude] = site.coordinate;
  const sideMiles = Math.max(0.22, Math.sqrt(site.acres / 640));
  const latitudeDelta = sideMiles / 69 / 2;
  const longitudeDelta = sideMiles / Math.max(20, 69 * Math.cos(latitude * Math.PI / 180)) / 2;
  const skew = longitudeDelta * 0.22;
  return {
    type: "Feature",
    properties: { id: site.id, name: site.name, score: site.score, risk: site.risk },
    geometry: {
      type: "Polygon",
      coordinates: [[
        [longitude - longitudeDelta, latitude - latitudeDelta],
        [longitude + longitudeDelta, latitude - latitudeDelta + skew],
        [longitude + longitudeDelta - skew, latitude + latitudeDelta],
        [longitude - longitudeDelta - skew, latitude + latitudeDelta - skew],
        [longitude - longitudeDelta, latitude - latitudeDelta],
      ]],
    },
  };
}

function buildCollections(sites: GeoSite[]) {
  const parcels: FeatureCollection = { type: "FeatureCollection", features: sites.map(parcelPolygon) };
  const substations: FeatureCollection = {
    type: "FeatureCollection",
    features: sites.map((site, index) => ({
      type: "Feature",
      properties: { id: `substation-${site.id}`, capacity: Math.round(site.score * 42), voltage: index % 2 ? 230 : 345 },
      geometry: { type: "Point", coordinates: [site.coordinate[0] + 0.022 + index * 0.002, site.coordinate[1] + 0.012] },
    })),
  };
  const transmission: FeatureCollection = {
    type: "FeatureCollection",
    features: sites.map((site, index) => ({
      type: "Feature",
      properties: { id: `line-${site.id}`, voltage: index % 2 ? 230 : 345 },
      geometry: {
        type: "LineString",
        coordinates: [
          [site.coordinate[0] - 0.07, site.coordinate[1] - 0.035],
          [site.coordinate[0] + 0.025, site.coordinate[1] + 0.012],
          [site.coordinate[0] + 0.082, site.coordinate[1] + 0.052],
        ],
      },
    })),
  };
  const wetlands: FeatureCollection = {
    type: "FeatureCollection",
    features: sites.filter((site) => site.risk !== "Low").map((site) => {
      const [longitude, latitude] = site.coordinate;
      return {
        type: "Feature",
        properties: { id: `wetland-${site.id}` },
        geometry: { type: "Polygon", coordinates: [[[longitude - 0.018, latitude - 0.016], [longitude + 0.006, latitude - 0.021], [longitude + 0.021, latitude + 0.005], [longitude - 0.009, latitude + 0.017], [longitude - 0.018, latitude - 0.016]]] },
      };
    }),
  };
  const floodplains: FeatureCollection = {
    type: "FeatureCollection",
    features: sites.filter((site) => site.risk === "High").map((site) => {
      const [longitude, latitude] = site.coordinate;
      return {
        type: "Feature",
        properties: { id: `flood-${site.id}` },
        geometry: { type: "Polygon", coordinates: [[[longitude - 0.026, latitude - 0.01], [longitude + 0.031, latitude - 0.017], [longitude + 0.019, latitude + 0.021], [longitude - 0.022, latitude + 0.016], [longitude - 0.026, latitude - 0.01]]] },
      };
    }),
  };
  return { parcels, substations, transmission, wetlands, floodplains };
}

function polygonAcres(points: [number, number][]) {
  if (points.length < 3) return 0;
  const averageLatitude = points.reduce((sum, point) => sum + point[1], 0) / points.length;
  const longitudeMeters = 111_320 * Math.cos(averageLatitude * Math.PI / 180);
  const latitudeMeters = 110_540;
  let area = 0;
  points.forEach((point, index) => {
    const next = points[(index + 1) % points.length];
    area += point[0] * longitudeMeters * next[1] * latitudeMeters;
    area -= next[0] * longitudeMeters * point[1] * latitudeMeters;
  });
  return Math.round(Math.abs(area / 2) / 4046.8564224);
}

function drawingCollection(points: [number, number][]): FeatureCollection {
  if (!points.length) return emptyCollection;
  const features: GeoJSON.Feature[] = [
    ...points.map((coordinate, index) => ({ type: "Feature" as const, properties: { index }, geometry: { type: "Point" as const, coordinates: coordinate } })),
  ];
  if (points.length >= 2) features.push({ type: "Feature", properties: {}, geometry: { type: "LineString", coordinates: points } });
  if (points.length >= 3) features.push({ type: "Feature", properties: {}, geometry: { type: "Polygon", coordinates: [[...points, points[0]]] } });
  return { type: "FeatureCollection", features } as FeatureCollection;
}

function mapStyle(collections: ReturnType<typeof buildCollections>): StyleSpecification {
  return {
    version: 8,
    sources: {
      satellite: { type: "raster", tiles: ["https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}"], tileSize: 256, attribution: "Tiles © Esri" },
      street: { type: "raster", tiles: ["https://tile.openstreetmap.org/{z}/{x}/{y}.png"], tileSize: 256, attribution: "© OpenStreetMap contributors" },
      parcels: { type: "geojson", data: collections.parcels },
      substations: { type: "geojson", data: collections.substations },
      transmission: { type: "geojson", data: collections.transmission },
      wetlands: { type: "geojson", data: collections.wetlands },
      floodplains: { type: "geojson", data: collections.floodplains },
      drawing: { type: "geojson", data: emptyCollection },
    },
    layers: [
      { id: "satellite", type: "raster", source: "satellite" },
      { id: "street", type: "raster", source: "street", layout: { visibility: "none" } },
      { id: "wetlands-fill", type: "fill", source: "wetlands", paint: { "fill-color": "#19a7a0", "fill-opacity": 0.38, "fill-outline-color": "#0c7470" } },
      { id: "floodplains-fill", type: "fill", source: "floodplains", paint: { "fill-color": "#377ce5", "fill-opacity": 0.3, "fill-outline-color": "#215aa6" } },
      { id: "transmission-halo", type: "line", source: "transmission", paint: { "line-color": "#ffffff", "line-width": 5, "line-opacity": 0.75 } },
      { id: "transmission-line", type: "line", source: "transmission", paint: { "line-color": "#f2a93b", "line-width": 2.4, "line-dasharray": [2, 1] } },
      { id: "parcels-fill", type: "fill", source: "parcels", paint: { "fill-color": ["match", ["get", "risk"], "Low", "#b8eb7f", "Medium", "#f3d77a", "#ef9279"], "fill-opacity": 0.34 } },
      { id: "parcels-outline", type: "line", source: "parcels", paint: { "line-color": "#e8ffd0", "line-width": 2 } },
      { id: "permitting-fill", type: "fill", source: "parcels", layout: { visibility: "none" }, paint: { "fill-color": ["interpolate", ["linear"], ["get", "score"], 7, "#e66f61", 8.5, "#e9ce68", 10, "#86cb72"], "fill-opacity": 0.44 } },
      { id: "selected-fill", type: "fill", source: "parcels", filter: ["==", ["get", "id"], ""], paint: { "fill-color": "#c9ee9d", "fill-opacity": 0.58 } },
      { id: "selected-outline", type: "line", source: "parcels", filter: ["==", ["get", "id"], ""], paint: { "line-color": "#ffffff", "line-width": 4 } },
      { id: "substation-halo", type: "circle", source: "substations", paint: { "circle-radius": 8, "circle-color": "#ffffff", "circle-opacity": 0.94 } },
      { id: "hosting-capacity", type: "circle", source: "substations", layout: { visibility: "none" }, paint: { "circle-radius": ["interpolate", ["linear"], ["get", "capacity"], 250, 13, 420, 25], "circle-color": "#7b5ab4", "circle-opacity": 0.22, "circle-stroke-color": "#b89adf", "circle-stroke-width": 2 } },
      { id: "substation-point", type: "circle", source: "substations", paint: { "circle-radius": 5, "circle-color": "#6f4aa8", "circle-stroke-color": "#3f245f", "circle-stroke-width": 1 } },
      { id: "site-points", type: "circle", source: "parcels", paint: { "circle-radius": 7, "circle-color": "#173f39", "circle-stroke-color": "#ffffff", "circle-stroke-width": 2 } },
      { id: "drawing-fill", type: "fill", source: "drawing", filter: ["==", ["geometry-type"], "Polygon"], paint: { "fill-color": "#c9ee9d", "fill-opacity": 0.22 } },
      { id: "drawing-line", type: "line", source: "drawing", filter: ["==", ["geometry-type"], "LineString"], paint: { "line-color": "#c9ee9d", "line-width": 3, "line-dasharray": [2, 1] } },
      { id: "drawing-points", type: "circle", source: "drawing", filter: ["==", ["geometry-type"], "Point"], paint: { "circle-radius": 5, "circle-color": "#c9ee9d", "circle-stroke-color": "#173f39", "circle-stroke-width": 2 } },
    ],
  };
}

function setSource(map: MapLibreMap, name: string, data: FeatureCollection) {
  const source = map.getSource(name) as GeoJSONSource | undefined;
  source?.setData(data);
}

function fitSites(map: MapLibreMap, sites: GeoSite[]) {
  if (!sites.length) return;
  if (sites.length === 1) {
    map.easeTo({ center: sites[0].coordinate, zoom: 11.5, duration: 700 });
    return;
  }
  const longitudes = sites.map((site) => site.coordinate[0]);
  const latitudes = sites.map((site) => site.coordinate[1]);
  const mobile = map.getContainer().clientWidth < 820;
  map.fitBounds([[Math.min(...longitudes), Math.min(...latitudes)], [Math.max(...longitudes), Math.max(...latitudes)]], { padding: mobile ? { top: 92, right: 30, bottom: 290, left: 30 } : { top: 110, right: 370, bottom: 90, left: 80 }, maxZoom: 11, duration: 800 });
}

function applyMapState(map: MapLibreMap, layers: string[], mapMode: "satellite" | "street", selectedId: string) {
  const visibility = (name: string) => layers.includes(name) ? "visible" : "none";
  map.setLayoutProperty("satellite", "visibility", mapMode === "satellite" ? "visible" : "none");
  map.setLayoutProperty("street", "visibility", mapMode === "street" ? "visible" : "none");
  map.setFilter("selected-fill", ["==", ["get", "id"], selectedId]);
  map.setFilter("selected-outline", ["==", ["get", "id"], selectedId]);
  ["parcels-fill", "parcels-outline", "selected-fill", "selected-outline", "site-points"].forEach((id) => map.setLayoutProperty(id, "visibility", visibility("Parcels")));
  ["substation-halo", "substation-point"].forEach((id) => map.setLayoutProperty(id, "visibility", visibility("Substations")));
  map.setLayoutProperty("hosting-capacity", "visibility", visibility("Hosting capacity"));
  ["transmission-halo", "transmission-line"].forEach((id) => map.setLayoutProperty(id, "visibility", visibility("Transmission")));
  map.setLayoutProperty("wetlands-fill", "visibility", visibility("Wetlands"));
  map.setLayoutProperty("floodplains-fill", "visibility", visibility("Floodplains"));
  map.setLayoutProperty("permitting-fill", "visibility", visibility("Permitting predictor"));
}

export function PacesMapSurface({ sites, selectedId, layers, mapMode, drawMode, command, onSelect, onDrawChange }: Props) {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<MapLibreMap | null>(null);
  const loadedRef = useRef(false);
  const sitesRef = useRef(sites);
  const drawModeRef = useRef(drawMode);
  const onSelectRef = useRef(onSelect);
  const onDrawChangeRef = useRef(onDrawChange);
  const drawPointsRef = useRef<[number, number][]>([]);

  useEffect(() => { sitesRef.current = sites; }, [sites]);
  useEffect(() => { drawModeRef.current = drawMode; }, [drawMode]);
  useEffect(() => { onSelectRef.current = onSelect; }, [onSelect]);
  useEffect(() => { onDrawChangeRef.current = onDrawChange; }, [onDrawChange]);

  useEffect(() => {
    if (!containerRef.current || mapRef.current) return;
    let disposed = false;
    void import("maplibre-gl").then(({ Map }) => {
      if (disposed || !containerRef.current) return;
      const collections = buildCollections(sitesRef.current);
      const map = new Map({
        container: containerRef.current,
        style: mapStyle(collections),
        center: sitesRef.current[0]?.coordinate || [-98.5, 39.5],
        zoom: 4.2,
        minZoom: 3,
        maxZoom: 18,
        attributionControl: { compact: true },
        cooperativeGestures: true,
      });
      mapRef.current = map;
      map.on("load", () => {
        loadedRef.current = true;
        applyMapState(map, layers, mapMode, selectedId);
        fitSites(map, sitesRef.current);
      });
      map.on("click", (event: MapMouseEvent) => {
        if (drawModeRef.current) {
          drawPointsRef.current = [...drawPointsRef.current, [event.lngLat.lng, event.lngLat.lat]];
          setSource(map, "drawing", drawingCollection(drawPointsRef.current));
          onDrawChangeRef.current({ points: drawPointsRef.current.length, acres: polygonAcres(drawPointsRef.current) });
          return;
        }
        const feature = map.queryRenderedFeatures(event.point, { layers: ["site-points", "parcels-fill"] })[0];
        const id = feature?.properties?.id;
        if (typeof id === "string") onSelectRef.current(id);
      });
      map.on("mousemove", (event: MapMouseEvent) => {
        if (drawModeRef.current) {
          map.getCanvas().style.cursor = "crosshair";
          return;
        }
        const features = map.queryRenderedFeatures(event.point, { layers: ["site-points", "parcels-fill"] });
        map.getCanvas().style.cursor = features.length ? "pointer" : "grab";
      });
    });
    return () => {
      disposed = true;
      loadedRef.current = false;
      mapRef.current?.remove();
      mapRef.current = null;
    };
  }, []);

  useEffect(() => {
    const map = mapRef.current;
    if (!map || !loadedRef.current) return;
    const collections = buildCollections(sites);
    setSource(map, "parcels", collections.parcels);
    setSource(map, "substations", collections.substations);
    setSource(map, "transmission", collections.transmission);
    setSource(map, "wetlands", collections.wetlands);
    setSource(map, "floodplains", collections.floodplains);
  }, [sites]);

  useEffect(() => {
    const map = mapRef.current;
    if (!map || !loadedRef.current) return;
    map.setFilter("selected-fill", ["==", ["get", "id"], selectedId]);
    map.setFilter("selected-outline", ["==", ["get", "id"], selectedId]);
  }, [selectedId]);

  useEffect(() => {
    const map = mapRef.current;
    if (!map || !loadedRef.current) return;
    map.setLayoutProperty("satellite", "visibility", mapMode === "satellite" ? "visible" : "none");
    map.setLayoutProperty("street", "visibility", mapMode === "street" ? "visible" : "none");
  }, [mapMode]);

  useEffect(() => {
    const map = mapRef.current;
    if (!map || !loadedRef.current) return;
    applyMapState(map, layers, mapMode, selectedId);
  }, [layers, mapMode, selectedId]);

  useEffect(() => {
    const map = mapRef.current;
    if (!map || !loadedRef.current || command.id === 0) return;
    if (command.type === "zoom-in") map.zoomIn({ duration: 250 });
    if (command.type === "zoom-out") map.zoomOut({ duration: 250 });
    if (command.type === "fit-results") fitSites(map, sitesRef.current);
    if (command.type === "focus-selected") {
      const site = sitesRef.current.find((candidate) => candidate.id === selectedId);
      if (site) map.easeTo({ center: site.coordinate, zoom: 12.2, duration: 750 });
    }
    if (command.type === "reset-north") map.easeTo({ bearing: 0, pitch: 0, duration: 450 });
    if (command.type === "clear-drawing") {
      drawPointsRef.current = [];
      setSource(map, "drawing", emptyCollection);
      onDrawChangeRef.current({ points: 0, acres: 0 });
    }
  }, [command, selectedId]);

  return <div ref={containerRef} className={styles.mapEngine} role="application" aria-label="Interactive parcel and infrastructure map. Use pointer or keyboard controls to pan and zoom." />;
}
