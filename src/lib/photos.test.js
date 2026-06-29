import { describe, it, expect, vi, beforeEach } from "vitest";

const mockCreateSignedUrl = vi.fn();
const mockGetPublicUrl = vi.fn();
const mockFrom = vi.fn();

vi.mock("./supabase.js", () => ({
  supabase: {
    storage: {
      from: (...args) => mockFrom(...args),
    },
  },
}));

import {
  FOOD_PHOTOS_BUCKET,
  PROGRESS_PHOTOS_BUCKET,
  resolvePhotoUrl,
  enrichPhotosWithDisplayUrls,
  enrichPhotoWithDisplayUrl,
} from "./photos.js";

describe("photos helpers", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockFrom.mockReturnValue({
      createSignedUrl: mockCreateSignedUrl,
      getPublicUrl: mockGetPublicUrl,
    });
  });

  it("exports expected bucket names", () => {
    expect(FOOD_PHOTOS_BUCKET).toBe("food-photos");
    expect(PROGRESS_PHOTOS_BUCKET).toBe("progress-photos");
  });

  it("returns public_url when storage_path is missing", async () => {
    const url = await resolvePhotoUrl(PROGRESS_PHOTOS_BUCKET, {
      public_url: "https://example.com/photo.jpg",
    });
    expect(url).toBe("https://example.com/photo.jpg");
    expect(mockFrom).not.toHaveBeenCalled();
  });

  it("prefers signed URL when available", async () => {
    mockCreateSignedUrl.mockResolvedValue({
      data: { signedUrl: "https://signed.example/photo.jpg" },
      error: null,
    });

    const url = await resolvePhotoUrl(PROGRESS_PHOTOS_BUCKET, {
      storage_path: "jordan-blake/progress/2026-03-01/front-abc.jpg",
      public_url: "https://public.example/photo.jpg",
    });

    expect(mockFrom).toHaveBeenCalledWith(PROGRESS_PHOTOS_BUCKET);
    expect(url).toBe("https://signed.example/photo.jpg");
  });

  it("falls back to public storage URL when signing fails", async () => {
    mockCreateSignedUrl.mockResolvedValue({ data: null, error: new Error("denied") });
    mockGetPublicUrl.mockReturnValue({
      data: { publicUrl: "https://public.example/fallback.jpg" },
    });

    const url = await resolvePhotoUrl(FOOD_PHOTOS_BUCKET, {
      storage_path: "jordan-blake/2026-03-01/food.jpg",
      public_url: "https://stale.example/food.jpg",
    });

    expect(url).toBe("https://public.example/fallback.jpg");
  });

  it("enriches a batch of photos with display_url", async () => {
    mockCreateSignedUrl.mockResolvedValue({
      data: { signedUrl: "https://signed.example/batch.jpg" },
      error: null,
    });

    const photos = await enrichPhotosWithDisplayUrls(
      [{ id: "1", storage_path: "a/b.jpg" }],
      PROGRESS_PHOTOS_BUCKET
    );

    expect(photos).toHaveLength(1);
    expect(photos[0].display_url).toBe("https://signed.example/batch.jpg");
  });

  it("enriches a single photo with display_url", async () => {
    mockCreateSignedUrl.mockResolvedValue({
      data: { signedUrl: "https://signed.example/single.jpg" },
      error: null,
    });

    const photo = await enrichPhotoWithDisplayUrl(
      { id: "1", storage_path: "a/b.jpg" },
      FOOD_PHOTOS_BUCKET
    );

    expect(photo.display_url).toBe("https://signed.example/single.jpg");
  });
});
