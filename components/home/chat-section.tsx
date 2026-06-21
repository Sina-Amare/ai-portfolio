import { Container } from "../ui/container";
import { SectionHeading } from "../ui/section-heading";
import { Reveal } from "../motion/reveal";
import { Chat } from "../chat/chat";

export function ChatSection() {
  return (
    <section id="chat" className="scroll-mt-24 py-20 sm:py-28">
      <Container>
        <Reveal>
          <SectionHeading
            number="01"
            eyebrow="Live demo"
            title="Ask my AI assistant"
            description="This isn't a mockup — it's a real retrieval-augmented chatbot grounded in my CV and projects, with multi-provider failover. Ask it anything about my work, in English or فارسی."
          />
        </Reveal>
        <Reveal delay={0.1} className="mt-10">
          <Chat />
        </Reveal>
      </Container>
    </section>
  );
}
