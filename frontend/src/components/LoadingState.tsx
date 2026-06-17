export default function LoadingState({ label = 'Loading...' }: { label?: string }) {
  return (
    <div className="flex min-h-[40vh] items-center justify-center">
      <p className="text-sm uppercase tracking-[0.35em] text-zinc-400">{label}</p>
    </div>
  );
}
