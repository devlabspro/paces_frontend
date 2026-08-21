import type { Metadata } from "next";
import PacesProductApp from "@/components/paces-app/PacesProductApp";

export const metadata: Metadata = { title: "Map | Paces" };

export default function ParcelMapPage() {
  return <PacesProductApp view="map" />;
}
