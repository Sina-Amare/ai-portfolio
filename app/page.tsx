import { ChatHero } from "@/components/home/chat-hero";
import { Featured } from "@/components/home/featured";
import { About } from "@/components/home/about";
import { Contact } from "@/components/home/contact";

export default function Home() {
  return (
    <>
      <ChatHero />
      <Featured />
      <About />
      <Contact />
    </>
  );
}
