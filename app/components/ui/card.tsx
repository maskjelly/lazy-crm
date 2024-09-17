export function Card({
  title,
  children,
  className,
}: {
  title: string;
  children?: React.ReactNode;
  className?: string;
}): JSX.Element {
  return (
    <div className={`card p-6 ${className || ''}`}>
      <h2 className="text-xl font-semibold border-b border-accent pb-2 mb-4">{title}</h2>
      <div>{children}</div>
    </div>
  );
}
