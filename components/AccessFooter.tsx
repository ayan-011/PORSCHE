export default function AccessFooter() {
  return (
    <section
      id="access"
      className="relative bg-garage-ink px-6 pb-10 pt-28 md:px-12 md:pt-36"
    >
      <div className="mx-auto flex max-w-6xl flex-col items-start justify-between gap-10 border-b border-white/10 pb-20 md:flex-row md:items-end">
        <h2 className="max-w-xl font-display text-4xl leading-tight text-garage-cream md:text-5xl">
          The door only opens
          <br />
          <span className="text-garage-red">from the inside.</span>
        </h2>
        <a
          href="mailto:access@carsgarage.co"
          className="group inline-flex shrink-0 items-center gap-3 rounded-full bg-garage-red px-7 py-4 text-xs font-semibold uppercase tracking-[0.25em] text-garage-ink transition hover:bg-garage-cream"
        >
          Request Access
          <span className="transition-transform group-hover:translate-x-1">
            →
          </span>
        </a>
      </div>

      <div className="mx-auto flex max-w-6xl flex-col-reverse items-center justify-between gap-6 pt-8 text-[11px] uppercase tracking-[0.25em] text-garage-cream/40 md:flex-row">
        <p>© {new Date().getFullYear()} CARS Garage. By invitation.</p>
        <div className="flex gap-8">
          <span>Instagram</span>
          <span>Journal</span>
          <span>Contact</span>
        </div>
      </div>
    </section>
  );
}
