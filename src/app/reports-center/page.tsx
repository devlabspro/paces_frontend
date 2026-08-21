import type { Metadata } from "next";
import PacesProductApp from "@/components/paces-app/PacesProductApp";

export const metadata: Metadata = { title: "Reports | Paces" };

export default function ReportsCenterPage() {
  return <PacesProductApp view="reports" />;
}
