import { MinimizedTimeTracker } from "@/components/time-tracker-components/mimized-time-tracker";
import { Navigation } from "@/components/navigation/navigation";

export default function ProtectedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <body className="flex">
      <Navigation />

      <main className="w-full overflow-scroll bg-zinc-100">{children}</main>
    </body>
  );
}
