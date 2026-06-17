import { Link } from 'react-router-dom';

export default function EmptyState({ title, description, actionLabel, actionTo }: {
  title: string;
  description: string;
  actionLabel?: string;
  actionTo?: string;
}) {
  return (
    <div className="rounded-[28px] border border-white/10 bg-white/5 p-10 text-center">
      <h3 className="text-xl font-semibold text-white">{title}</h3>
      <p className="mt-3 text-zinc-400">{description}</p>
      {actionLabel && actionTo ? (
        <Link to={actionTo} className="mt-6 inline-block rounded-full bg-amber-400 px-5 py-3 text-sm font-semibold text-black">
          {actionLabel}
        </Link>
      ) : null}
    </div>
  );
}
