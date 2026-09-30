import GarageHero from "@/components/GarageHero";
import Collection from "@/components/Collection";
import Atelier from "@/components/Atelier";
import AccessFooter from "@/components/AccessFooter";
import SmoothScroll from "@/components/SmoothScroll";   
import Ontrack from "./ontrack/Ontrack";  

export default function Home() {
  return (
    <SmoothScroll>
      <main className="bg-garage-ink">
        <GarageHero /> 
      <section id="ontrack">
          <Ontrack />
      </section>
 

    

        <Collection />
        <Atelier />
        <AccessFooter />
      </main>
    </SmoothScroll>
  );
}
