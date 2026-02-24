import { redirect } from "next/navigation";
import { featureFlags } from "@/lib/feature-flags";

export default function GroupsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  if (!featureFlags.groups) {
    redirect("/admin");
  }
  return <>{children}</>;
}
