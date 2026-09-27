// @vitest-environment node
import { readFileSync } from "node:fs";
import { describe, it, expect } from "vitest";
import { projects } from "@/lib/projects";

/**
 * The case-study page and the chatbot must send people to the same repo. GitHub
 * redirects a renamed repo, so a stale link still "works" and nobody notices.
 */
describe("project repo links", () => {
  it.each(projects.map((p) => [p.slug, p.repo]))(
    "%s: the chatbot's note names the page's repo",
    (slug, repo) => {
      const note = readFileSync(`content/projects/${slug}.md`, "utf8");
      expect(note).toContain(repo.replace(/^https:\/\//, ""));
    },
  );
});
