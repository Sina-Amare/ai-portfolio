import { afterEach, beforeEach, describe, it, expect, vi } from "vitest";
import { act, render } from "@testing-library/react";

// Under the proxy's rewrite the router reports the internal /en path.
const nav = vi.hoisted(() => ({ path: "/en/projects" }));
vi.mock("next/navigation", () => ({ usePathname: () => nav.path }));

// The tracker keeps its state at module scope (it must survive a locale
// remount), so every test loads a fresh copy.
async function load() {
  vi.resetModules();
  const { Tracker } = await import("@/components/analytics/tracker");
  const { track } = await import("@/lib/analytics/client");
  return { Tracker, track };
}

let fetchMock: ReturnType<typeof vi.fn>;
const bodies = () => fetchMock.mock.calls.map(([, init]) => JSON.parse(init.body));
const setVisibility = (v: "visible" | "hidden") =>
  Object.defineProperty(document, "visibilityState", { value: v, configurable: true });
const setReferrer = (value: string) =>
  Object.defineProperty(document, "referrer", { value, configurable: true });

beforeEach(() => {
  fetchMock = vi.fn().mockResolvedValue(new Response(null, { status: 204 }));
  vi.stubGlobal("fetch", fetchMock);
  setVisibility("visible");
  setReferrer("");
});

afterEach(() => {
  vi.useRealTimers();
  vi.unstubAllGlobals();
  document.body.innerHTML = "";
  nav.path = "/en/projects";
});

describe("Tracker", () => {
  it("beacons the public URL, and the entry referrer only once across a locale remount", async () => {
    const { Tracker } = await load();
    setReferrer("https://www.google.com/");

    window.history.pushState(null, "", "/projects");
    const first = render(<Tracker />);
    first.unmount();
    // Switching language re-mounts the [lang] layout, Tracker included.
    window.history.pushState(null, "", "/fa/projects");
    render(<Tracker />);
    window.history.pushState(null, "", "/fa/admin");
    render(<Tracker />);

    expect(bodies()).toEqual([
      { t: "pv", path: "/projects", referrer: "https://www.google.com/" },
      { t: "pv", path: "/fa/projects", referrer: "" },
    ]);
  });

  it("counts only visible time with recent activity, and flushes it each minute and on hide", async () => {
    vi.useFakeTimers({ now: 0 });
    const { Tracker, track } = await load();
    const hero = document.createElement("section");
    hero.dataset.analyticsSection = "hero";
    hero.getBoundingClientRect = () => ({ top: 0, bottom: 500 }) as DOMRect;
    document.body.append(hero);

    window.history.pushState(null, "", "/");
    render(<Tracker />);
    // Opening the page is activity: its first minute counts, then the visitor idles.
    act(() => vi.advanceTimersByTime(120_000));
    // Back after two idle minutes: 5 more active seconds, a chip question, then the tab hides.
    act(() => {
      window.dispatchEvent(new Event("pointerdown"));
      track("chat_ask", "chip");
      vi.advanceTimersByTime(5_000);
      setVisibility("hidden");
      document.dispatchEvent(new Event("visibilitychange"));
    });
    // Hidden: nothing accrues, so the periodic flush has nothing to send.
    act(() => vi.advanceTimersByTime(120_000));

    expect(bodies()).toEqual([
      { t: "pv", path: "/", referrer: "" },
      { t: "eng", path: "/", ms: 60_000, sections: { hero: 60_000 }, events: [] },
      {
        t: "eng",
        path: "/",
        ms: 5_000,
        sections: { hero: 5_000 },
        events: [{ n: "chat_ask", p: "chip" }],
      },
    ]);
  });

  it("credits a route change's last moments to the old page without reading the new page", async () => {
    vi.useFakeTimers({ now: 0 });
    const { Tracker } = await load();
    const hero = () => {
      const el = document.createElement("section");
      el.dataset.analyticsSection = "hero";
      el.getBoundingClientRect = () => ({ top: 0, bottom: 500 }) as DOMRect;
      return el;
    };
    document.body.append(hero());

    window.history.pushState(null, "", "/");
    const { rerender } = render(<Tracker />);
    act(() => vi.advanceTimersByTime(2_900));
    // Switch to Persian: by the time the tracker hears of it, the DOM is the new page's.
    document.body.replaceChildren(hero());
    window.history.pushState(null, "", "/fa");
    nav.path = "/fa";
    rerender(<Tracker />);

    expect(bodies()).toEqual([
      { t: "pv", path: "/", referrer: "" },
      // All 2.9 s of time, but dwell only from the two scans of the old page.
      { t: "eng", path: "/", ms: 2_900, sections: { hero: 2_000 }, events: [] },
      { t: "pv", path: "/fa", referrer: "" },
    ]);
  });

  it("notes résumé and outbound clicks from any link", async () => {
    vi.useFakeTimers({ now: 0 });
    const { Tracker } = await load();
    document.body.innerHTML = `
      <a href="/resume.pdf">CV</a>
      <a href="https://github.com/Sina-Amare/scrapegpt"><span>repo</span></a>
      <a href="/fa/projects">internal</a>`;
    for (const a of document.querySelectorAll("a"))
      a.addEventListener("click", (e) => e.preventDefault());

    window.history.pushState(null, "", "/");
    render(<Tracker />);
    act(() => {
      for (const el of document.querySelectorAll<HTMLElement>("a, span")) el.click();
      window.dispatchEvent(new Event("pagehide"));
    });

    expect(bodies()[1].events).toEqual([
      { n: "resume_download" },
      { n: "outbound", p: "repo" },
      { n: "outbound", p: "repo" },
    ]);
  });

  it("sends nothing from an automated browser", async () => {
    const { Tracker } = await load();
    Object.defineProperty(navigator, "webdriver", { value: true, configurable: true });
    window.history.pushState(null, "", "/");
    render(<Tracker />);
    Object.defineProperty(navigator, "webdriver", { value: false, configurable: true });
    expect(fetchMock).not.toHaveBeenCalled();
  });
});
