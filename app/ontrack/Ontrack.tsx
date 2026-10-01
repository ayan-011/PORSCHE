
import { HorizontalScroll } from "./components/HorizontalScroll";
import LiquidGlassLens from "./components/LiquidGlassLens";
import Statement from "./components/RevealChar";
import Start from "./components/Start";
import StrechText from "./components/StretchText";

export default function Ontrack() {
  return (
    <main className="relative w-full text-[#151821] [clip-path:inset(0)]">
      {/* one fixed texture: no repeat, no scroll, only visible inside this section */}
      <div
        aria-hidden="true"
        className="pointer-events-none fixed inset-0 -z-10 bg-[url('/texture/carbonfiber2.jpg')] bg-cover bg-center bg-no-repeat opacity-5"
      />

      <Start title="01. On track" image="/ontrack/trackstart.jpg" />
      <Statement />
      <HorizontalScroll />
      <div className="h-screen w-full"></div>
      <StrechText />
      <LiquidGlassLens />

      {/* ...your last section unchanged */}
    </main>
  );
}