export function Card({
  title,
  children,
}: {
  title: string;
  children?: React.ReactNode;
}): JSX.Element {
  return (
    <>
    <div className="border p-6 bg-black bg-[#ededed] md:border md:p-6 md:bg-black md:bg-[#ededed] sm:border sm:p-6 sm:bg-black sm:bg-[#ededed] lg:p-4 lg:w-1/2">
      <h1 className="text-xl border-b pb-2">{title}</h1>
      <p>{children}</p>
    </div>
    </>
  );
}
