import { ChatHero } from "@/components/home/chat-hero";
import { Featured } from "@/components/home/featured";
import { About } from "@/components/home/about";

export default function Home() {
  return (
    <>
      <ChatHero />
      <Featured />
      <About />
    </>
  );
}
