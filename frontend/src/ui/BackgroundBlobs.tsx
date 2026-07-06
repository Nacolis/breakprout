export default function BackgroundBlobs() {
  return (
    <div className="pointer-events-none absolute inset-0 z-0 overflow-hidden" aria-hidden="true">
      <div className="absolute -top-24 -left-24 h-72 w-72 rounded-full bg-brand/30 blur-3xl motion-safe:animate-[float-a_18s_ease-in-out_infinite]" />
      <div className="absolute top-1/3 -right-20 h-96 w-96 rounded-full bg-status-active/20 blur-3xl motion-safe:animate-[float-b_22s_ease-in-out_infinite]" />
      <div className="absolute bottom-[-6rem] left-1/3 h-80 w-80 rounded-full bg-status-pending/20 blur-3xl motion-safe:animate-[float-c_26s_ease-in-out_infinite]" />
    </div>
  );
}
