import { v2 as cloudinary } from "cloudinary";

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME!,
  api_key: process.env.CLOUDINARY_API_KEY!,
  api_secret: process.env.CLOUDINARY_API_SECRET!,
});

export async function uploadBookCover(
  imageUrl: string,
  bookId: string
): Promise<string | null> {
  try {
    const result = await cloudinary.uploader.upload(imageUrl, {
      public_id: bookId,
      folder: "bookaryao/covers",
      transformation: [
        { width: 400, height: 600, crop: "fill", gravity: "center" },
        { quality: "auto", fetch_format: "auto" },
      ],
      overwrite: true,
    });
    return result.secure_url;
  } catch {
    console.error("Failed to upload cover to Cloudinary");
    return null;
  }
}

export async function deleteBookCover(bookId: string): Promise<void> {
  try {
    await cloudinary.uploader.destroy(`bookaryao/covers/${bookId}`);
  } catch {
    console.error("Failed to delete cover from Cloudinary");
  }
}
