import { AppLayout } from "@/components/layout/AppLayout";

export default function VetLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <AppLayout>{children}</AppLayout>;
}