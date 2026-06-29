import { supabase } from "./supabase";

export const FOOD_PHOTOS_BUCKET = "food-photos";
export const PROGRESS_PHOTOS_BUCKET = "progress-photos";

export async function resolvePhotoUrl(bucket, photo) {
  if (!photo?.storage_path) {
    return photo?.public_url || null;
  }

  const { data: signed, error } = await supabase.storage
    .from(bucket)
    .createSignedUrl(photo.storage_path, 60 * 60 * 24);

  if (!error && signed?.signedUrl) {
    return signed.signedUrl;
  }

  const { data: publicData } = supabase.storage
    .from(bucket)
    .getPublicUrl(photo.storage_path);

  return publicData?.publicUrl || photo.public_url || null;
}

export async function enrichPhotosWithDisplayUrls(photos, bucket) {
  return Promise.all(
    photos.map(async (photo) => ({
      ...photo,
      display_url: await resolvePhotoUrl(bucket, photo),
    }))
  );
}

export async function enrichPhotoWithDisplayUrl(photo, bucket) {
  return {
    ...photo,
    display_url: await resolvePhotoUrl(bucket, photo),
  };
}
