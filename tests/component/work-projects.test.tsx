import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { LocaleProvider } from "@/components/locale-provider";
import { WorkProjects } from "@/components/projects/work-projects";

describe("WorkProjects", () => {
  it("home preview: each agent card links to its entry on /projects", () => {
    render(
      <LocaleProvider locale="en">
        <WorkProjects preview />
      </LocaleProvider>,
    );
    expect(screen.getByRole("link", { name: /^Social Research Agent — / })).toHaveAttribute(
      "href",
      "/projects#social-research-agent",
    );
    expect(screen.getByRole("link", { name: /^Business Intelligence Agents — / })).toHaveAttribute(
      "href",
      "/projects#business-intelligence-agents",
    );
  });

  it("/projects: one link-free mini case study per agent, anchored by its id", () => {
    const { container } = render(
      <LocaleProvider locale="fa">
        <WorkProjects />
      </LocaleProvider>,
    );
    const ids = [...container.querySelectorAll("article")].map((a) => a.id);
    expect(ids).toEqual(["social-research-agent", "business-intelligence-agents"]);
    expect(container.querySelectorAll("article a")).toHaveLength(0);
    expect(screen.getAllByRole("heading", { level: 4, name: "مسیر کار" })).toHaveLength(2);
    // The sidebar year is a number, so dropping digits() would still typecheck.
    expect(container).toHaveTextContent("۲۰۲۵");
    expect(container).not.toHaveTextContent("2025");
  });
});
