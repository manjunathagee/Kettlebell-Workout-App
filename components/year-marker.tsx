export function YearMarker({ year }: { year: string }) {
  return (
    <div className="relative z-20 flex justify-center my-8">
      <div className="bg-amber-500 text-slate-900 font-bold px-4 py-1 rounded-full text-sm">{year}</div>
    </div>
  )
}
