export default function Atelier() {
  return (
    <section
      id="atelier"
      className="relative overflow-hidden bg-garage-navy px-6 py-28 md:px-12 md:py-36"
    >
      <div
        aria-hidden
        className="pointer-events-none absolute -right-40 top-1/2 h-[600px] w-[600px] -translate-y-1/2 rounded-full bg-garage-red/20 blur-[140px]"
      />
      <div className="relative mx-auto grid max-w-6xl gap-12 md:grid-cols-2 md:items-center">
        <div>
          <p className="mb-4 text-[11px] uppercase tracking-[0.4em] text-garage-cream/60">
            The atelier
          </p>
          <h2 className="font-display text-4xl leading-tight text-garage-cream md:text-5xl">
            Kept, not just parked.
          </h2>
        </div>
        <div className="space-y-6 text-sm leading-relaxed text-garage-cream/70">
          <p>
            Climate-stable storage, in-house detailing, and a technician team
            that knows every car on the floor by its service history, not its
            plate number.
          </p>
          <p>
            We open the door for very few people. If you&apos;re one of them,
            you&apos;ll already know what to ask for.
          </p>
          <div className="grid grid-cols-3 gap-6 pt-4 text-garage-cream">
            <div>
              <p className="font-display text-3xl">24</p>
              <p className="mt-1 text-[10px] uppercase tracking-[0.25em] text-garage-cream/50">
                Bays
              </p>
            </div>
            <div>
              <p className="font-display text-3xl">1</p>
              <p className="mt-1 text-[10px] uppercase tracking-[0.25em] text-garage-cream/50">
                Location
              </p>
            </div>
            <div>
              <p className="font-display text-3xl">∞</p>
              <p className="mt-1 text-[10px] uppercase tracking-[0.25em] text-garage-cream/50">
                Patience
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
