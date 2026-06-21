import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { Container } from "@/components/ui/container";

export default function NotFound() {
  return (
    <section className="flex min-h-[72vh] items-center">
      <Container className="text-center">
        <div className="eyebrow">Error 404</div>
        <h1 className="text-gradient mt-4 text-5xl font-semibold tracking-tight">
          Page not found
        </h1>
        <p className="text-muted mx-auto mt-4 max-w-md leading-relaxed">
          The page you&rsquo;re looking for doesn&rsquo;t exist or has moved.
        </p>
        <Link
          href="/"
          className="bg-accent hover:bg-accent-2 mt-8 inline-flex items-center gap-2 rounded-full px-5 py-2.5 text-sm font-medium text-white transition-colors"
        >
          <ArrowLeft className="h-4 w-4" /> Back home
        </Link>
      </Container>
    </section>
  );
}
