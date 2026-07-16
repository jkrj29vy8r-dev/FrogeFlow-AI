export default function DashboardLoading() {
  return (
    <div className="flex h-full items-center justify-center py-32">
      <div className="h-8 w-8 animate-spin rounded-full border-4 border-[hsl(var(--border))] border-t-[hsl(var(--primary))]" />
    </div>
  );
}
