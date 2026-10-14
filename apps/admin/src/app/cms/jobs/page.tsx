import type { Metadata } from "next";
import { AdminJobsView } from "@/components/admin/AdminJobsView";

export const metadata: Metadata = {
  title: "Pencarian & Kelola Loker | Admin Employr",
  description: "Pencarian, kurasi, crawl, dan sinkronisasi lowongan kerja portal Employr",
};

export default function AdminJobsPage() {
  return <AdminJobsView />;
}
