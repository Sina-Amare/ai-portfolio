import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { Search } from "lucide-react";
import { LocaleProvider } from "@/components/locale-provider";
import { ProjectCardView } from "@/components/projects/project-card";

describe("ProjectCardView", () => {
  it("links the whole card, draws the focus ring on the card, and skips GitHub without a repo", () => {
    render(
      <LocaleProvider locale="en">
        <ProjectCardView
          href="/projects#agent"
          label="Agent — tagline"
          eyebrow="Workplace agent"
          name="Agent"
          tagline="tagline"
          summary="summary"
          stack={["Python"]}
          icon={Search}
        />
      </LocaleProvider>,
    );

    const link = screen.getByRole("link", { name: "Agent — tagline" });
    expect(link).toHaveAttribute("href", "/projects#agent");
    // The link's own ring is clipped by the card's overflow-hidden (ui-1).
    expect(link.parentElement).toHaveClass("has-[>a:focus-visible]:outline-2");
    expect(screen.queryByRole("link", { name: /GitHub/ })).toBeNull();
  });
});
