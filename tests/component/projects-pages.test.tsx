import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { LocaleProvider } from "@/components/locale-provider";
import { ProjectsIndex } from "@/components/projects/projects-index";
import { CaseStudy } from "@/components/projects/case-study";
import { getProject } from "@/lib/projects";
import { dict } from "@/lib/dictionary";

// <Reveal> server-renders `opacity: 0` until JS runs; a page title must not sit in one.
const hiddenUntilJs = (el: HTMLElement) => el.closest('[style*="opacity: 0"]');

describe("above-the-fold page titles", () => {
  it("/projects has a visible h1", () => {
    render(
      <LocaleProvider locale="en">
        <ProjectsIndex />
      </LocaleProvider>,
    );
    const h1 = screen.getByRole("heading", { level: 1, name: dict.en.projects.title });
    expect(hiddenUntilJs(h1)).toBeNull();
  });

  it("/projects loads the first cover (the desktop LCP) eagerly, the rest lazily", () => {
    const { container } = render(
      <LocaleProvider locale="en">
        <ProjectsIndex />
      </LocaleProvider>,
    );
    const loading = [...container.querySelectorAll("img")].map((i) => i.getAttribute("loading"));
    expect(loading[0]).toBe("eager");
    expect(loading.slice(1)).not.toContain("eager");
  });

  it("a case study's h1 is visible before hydration", () => {
    render(
      <LocaleProvider locale="en">
        <CaseStudy project={getProject("scrapegpt")!} />
      </LocaleProvider>,
    );
    expect(hiddenUntilJs(screen.getByRole("heading", { level: 1, name: "ScrapeGPT" }))).toBeNull();
  });
});
