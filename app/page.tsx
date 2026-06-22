import { ChatHero } from "@/components/home/chat-hero";
import { Featured } from "@/components/home/featured";
import { About } from "@/components/home/about";
import { Contact } from "@/components/home/contact";
import { ScrollToHash } from "@/components/scroll-to-hash";

export default function Home() {
  return (
    <>
      <ScrollToHash />
      <ChatHero />
      <Featured />
      <About />
      <Contact />
    </>
  );
}
