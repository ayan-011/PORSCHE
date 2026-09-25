const CARS = [
  {
    name: "Nocturne GT",
    tag: "1 of 12",
    detail: "6.2L V8 · Hand-formed carbon shell · Midnight blue over cream",
  },
  {
    name: "Vermillion 900",
    tag: "1 of 6",
    detail: "Twin-turbo flat-six · Track-tuned chassis · Signature red",
  },
  {
    name: "Silhouette RS",
    tag: "1 of 20",
    detail: "Naturally aspirated V10 · Analog steering feel · Sold new only",
  },
];

export default function Collection() {
  return (
    <section
      id="collection"
      className="relative bg-garage-ink px-6 py-28 md:px-12 md:py-36"
    >
      <div className="mx-auto max-w-6xl">
        <p className="mb-4 text-[11px] uppercase tracking-[0.4em] text-garage-red">
          Inside the garage
        </p>
        <h2 className="max-w-2xl font-display text-4xl leading-tight text-garage-cream md:text-5xl">
          Every car earns its spot on the floor.
        </h2>
        <p className="mt-6 max-w-xl text-sm leading-relaxed text-garage-cream/60">
          No showroom lighting, no sales pitch — just a rotating collection
          kept the way their builders intended. What you saw behind the door
          is only the beginning.
        </p>

        <div className="mt-16 grid gap-px overflow-hidden rounded-2xl bg-white/10 md:grid-cols-3">
          {CARS.map((car) => (
            <div
              key={car.name}
              className="group relative flex min-h-[280px] flex-col justify-end bg-garage-dusk p-8 transition-colors duration-500 hover:bg-garage-navy"
            >
              <span className="absolute right-6 top-6 text-[10px] uppercase tracking-[0.3em] text-garage-cream/40">
                {car.tag}
              </span>
              <div className="mb-6 h-px w-10 bg-garage-red transition-all duration-500 group-hover:w-16" />
              <h3 className="font-display text-2xl text-garage-cream">
                {car.name}
              </h3>
              <p className="mt-3 text-xs leading-relaxed text-garage-cream/50">
                {car.detail}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
