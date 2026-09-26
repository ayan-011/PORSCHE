import GarageHero from "@/components/GarageHero";
import Collection from "@/components/Collection";
import Atelier from "@/components/Atelier";
import AccessFooter from "@/components/AccessFooter";
import SmoothScroll from "@/components/SmoothScroll";
import Ontrack from "@/app/ontrack/Ontrack";

export default function Home() {
  return (
    <SmoothScroll>
      <main className="bg-garage-ink">
        <GarageHero />
        <Ontrack/>
        <Collection />
        <Atelier />
        <AccessFooter />
      </main>
    </SmoothScroll>
  );
}
