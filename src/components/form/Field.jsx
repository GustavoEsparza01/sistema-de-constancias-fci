export default function Field({ label, hint, children }) {
  return (
    <div className="flex flex-col gap-space-2xs">
      <label className="font-bold text-on-surface text-label-md">{label}</label>
      {children}
      {hint ? <div className="italic text-on-surface-variant text-label-sm">{hint}</div> : null}
    </div>
  );
}
