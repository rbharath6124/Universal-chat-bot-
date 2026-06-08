import Hero from "../components/Hero";
import Marquee from "../components/Marquee";
import Programs from "../components/Programs";
import Journey from "../components/Journey";
import Stats from "../components/Stats";
import Certificates from "../components/Certificates";
import Testimonials from "../components/Testimonials";
import CTA from "../components/CTA";

export default function HomePage() {
  return (
    <main>
      <Hero />
      <Marquee />
      <Programs />
      <Journey />
      <Stats />
      <Certificates />
      <Testimonials />
      <CTA />
    </main>
  );
}
