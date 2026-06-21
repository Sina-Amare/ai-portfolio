import { Hero } from "@/components/hero";
import { ChatSection } from "@/components/home/chat-section";
import { Featured } from "@/components/home/featured";
import { About } from "@/components/home/about";

export default function Home() {
  return (
    <>
      <Hero />
      <ChatSection />
      <Featured />
      <About />
    </>
  );
}
