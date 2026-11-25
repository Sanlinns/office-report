export default function ReportCardGlow({ color = "#2563eb" }: { color?: string }) {
  return (
    <div aria-hidden="true" className="pointer-events-none absolute inset-0 -z-10 overflow-hidden rounded-[inherit]">
      <div
        className="absolute -right-24 -top-24 size-56 rounded-full opacity-35 blur-3xl"
        style={{ backgroundColor: color }}
      />
      <div
        className="absolute -bottom-24 -left-24 size-56 rounded-full opacity-20 blur-3xl"
        style={{ backgroundColor: color }}
      />
    </div>
  );
}