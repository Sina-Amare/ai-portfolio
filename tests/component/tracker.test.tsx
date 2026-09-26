import { describe, it, expect, vi } from "vitest";
import { render } from "@testing-library/react";
import { Tracker } from "@/components/analytics/tracker";

// Under the proxy's rewrite the router reports the internal /en path.
vi.mock("next/navigation", () => ({ usePathname: () => "/en/projects" }));

describe("Tracker", () => {
  it("beacons the public URL, and the entry referrer only once across a locale remount", () => {
    const fetchMock = vi.fn().mockResolvedValue(new Response(null, { status: 204 }));
    vi.stubGlobal("fetch", fetchMock);
    Object.defineProperty(document, "referrer", {
      value: "https://www.google.com/",
      configurable: true,
    });

    window.history.pushState(null, "", "/projects");
    const first = render(<Tracker />);
    first.unmount();
    // Switching language re-mounts the [lang] layout, Tracker included.
    window.history.pushState(null, "", "/fa/projects");
    render(<Tracker />);
    window.history.pushState(null, "", "/fa/admin");
    render(<Tracker />);

    const bodies = fetchMock.mock.calls.map(([, init]) => JSON.parse(init.body));
    expect(bodies).toEqual([
      { path: "/projects", referrer: "https://www.google.com/" },
      { path: "/fa/projects", referrer: "" },
    ]);
    vi.unstubAllGlobals();
  });
});
