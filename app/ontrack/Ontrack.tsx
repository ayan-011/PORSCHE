
import { HorizontalScroll } from "./components/HorizontalScroll";
import LiquidGlassLens from "./components/LiquidGlassLens";
import Statement from "./components/RevealChar";
import Start from "./components/Start";
import StrechText from "./components/StretchText";



export default function Ontrack() {
  return (
  <main
  className="
    relative
    w-full
    text-[#151821]
    before:content-['']
    before:fixed
    before:inset-0
    before:bg-[url('/texture/carbonfiber2.jpg')]
    before:bg-cover
    before:bg-center
    before:bg-no-repeat
    before:opacity-5
    before:pointer-events-none
    before:z-0
  "
>
   

      <Start 
        title="01. On track"
        image="/ontrack/trackstart.jpg"
      />

      <Statement />
      <HorizontalScroll />
      <div className="h-screen w-full"></div>
      <StrechText />
      <LiquidGlassLens />


      <section className="flex h-screen flex-col items-center justify-center gap-4 px-6 text-center">
        <h2 className="max-w-xl font-serif text-3xl leading-tight sm:text-4xl">
          Nothing slips through.
        </h2>
        <p className="max-w-md text-[#151821]/60">
          Keep scrolling for the rest of the page.
        </p>
      </section>

    </main>
  );
}