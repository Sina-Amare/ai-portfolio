import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { LocaleProvider } from "@/components/locale-provider";
import { MediaGallery } from "@/components/projects/media-gallery";

const items = [
  { type: "image" as const, src: "/a.png", caption: "A", captionFa: "اول" },
  { type: "image" as const, src: "/b.png", caption: "B", captionFa: "دوم" },
  { type: "image" as const, src: "/c.png", caption: "C", captionFa: "سوم" },
];

describe("MediaGallery", () => {
  // Three items: with two, "next" and "previous" land on the same image.
  it("in RTL, ArrowLeft moves to the next image", async () => {
    const user = userEvent.setup();
    render(
      <LocaleProvider initial="fa">
        <MediaGallery items={items} label="gallery" />
      </LocaleProvider>,
    );
    await user.click(screen.getByRole("button", { name: "اول" }));
    await user.keyboard("{ArrowLeft}");
    expect(await screen.findByText(/2\/3/)).toBeInTheDocument();
  });
});
