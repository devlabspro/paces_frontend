import type { Metadata } from "next";
import PacesProductApp from "@/components/paces-app/PacesProductApp";

export const metadata: Metadata = { title: "Data Library | Paces" };

export default function DataLibraryPage() {
  return <PacesProductApp view="data" />;
}
