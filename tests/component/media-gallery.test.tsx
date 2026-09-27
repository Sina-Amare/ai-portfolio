import { beforeAll, describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { LocaleProvider } from "@/components/locale-provider";
import { MediaGallery } from "@/components/projects/media-gallery";
import type { MediaItem } from "@/lib/projects";

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
  it("in RTL, ArrowLeft moves to the next image, counted in Persian digits", async () => {
    const user = userEvent.setup();
    render(
      <LocaleProvider locale="fa">
        <MediaGallery items={items} label="gallery" />
      </LocaleProvider>,
    );
    await user.click(screen.getByRole("button", { name: "اول" }));
    await user.keyboard("{ArrowLeft}");
    expect(await screen.findByText(/۲\/۳/)).toBeInTheDocument();
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

  it("uses a video's poster as its thumbnail, and a video must have one", () => {
    // @ts-expect-error next/image can't resize an .mp4, so a posterless video is a type error
    const posterless: MediaItem[] = [{ type: "video", src: "/v.mp4" }];
    expect(posterless).toHaveLength(1);

    render(
      <LocaleProvider locale="en">
        <MediaGallery
          items={[{ type: "video", src: "/v.mp4", poster: "/v.webp", caption: "V" }]}
          label="gallery"
        />
      </LocaleProvider>,
    );
    const thumb = screen.getByRole("img", { name: "V" });
    expect(thumb.getAttribute("srcset")).toContain("/_next/image?url=%2Fv.webp");
  });
});
