export default function PlaceholderPage({ title, description }) {
  return (
    <div>
      <h1 className="text-2xl font-semibold text-ink">{title}</h1>
      <p className="mt-1 text-sm text-ink/60 max-w-lg">{description}</p>
      <div className="mt-8 rounded-xl border border-dashed border-ink/20 bg-white/60 px-6 py-16 text-center text-sm text-ink/40">
        This section connects to the backend API once it's built.
      </div>
    </div>
  );
}
