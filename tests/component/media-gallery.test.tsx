import { beforeAll, describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { LocaleProvider } from "@/components/locale-provider";
import { MediaGallery } from "@/components/projects/media-gallery";

const items = [
  { type: "image" as const, src: "/a.png", caption: "A", captionFa: "اول" },
  { type: "image" as const, src: "/b.png", caption: "B", captionFa: "دوم" },
  { type: "image" as const, src: "/c.png", caption: "C", captionFa: "سوم" },
];

// jsdom has <dialog> but not its methods.
beforeAll(() => {
  HTMLDialogElement.prototype.showModal = function (this: HTMLDialogElement) {
    this.open = true;
  };
  HTMLDialogElement.prototype.close = function (this: HTMLDialogElement) {
    this.open = false;
    this.dispatchEvent(new Event("close"));
  };
});

describe("MediaGallery", () => {
  // Three items: with two, "next" and "previous" land on the same image.
  it("in RTL, ArrowLeft moves to the next image", async () => {
    const user = userEvent.setup();
    render(
      <LocaleProvider locale="fa">
        <MediaGallery items={items} label="gallery" />
      </LocaleProvider>,
    );
    await user.click(screen.getByRole("button", { name: "اول" }));
    await user.keyboard("{ArrowLeft}");
    expect(await screen.findByText(/2\/3/)).toBeInTheDocument();
  });

  it("opens as a modal dialog and hands focus back to its thumbnail on close", async () => {
    const user = userEvent.setup();
    render(
      <LocaleProvider locale="en">
        <MediaGallery items={items} label="gallery" />
      </LocaleProvider>,
    );
    const thumb = screen.getByRole("button", { name: "B" });
    await user.click(thumb);
    expect(screen.getByRole("dialog", { name: "gallery" })).toHaveAttribute("open");

    await user.click(screen.getByRole("button", { name: "Close" }));
    expect(screen.queryByRole("dialog")).toBeNull();
    expect(thumb).toHaveFocus();
  });

  it("shows resized thumbnails and the full-size image in the lightbox", async () => {
    const user = userEvent.setup();
    render(
      <LocaleProvider locale="en">
        <MediaGallery items={items} label="gallery" />
      </LocaleProvider>,
    );
    const thumb = screen.getByRole("img", { name: "A" });
    expect(thumb.getAttribute("srcset")).toContain("/_next/image?url=%2Fa.png");

    await user.click(screen.getByRole("button", { name: "A" }));
    const full = screen.getAllByRole("img", { name: "A" }).find((img) => img !== thumb)!;
    expect(full).toHaveAttribute("src", "/a.png");
  });
});
