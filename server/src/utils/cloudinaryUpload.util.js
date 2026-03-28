import { getCloudinaryConfig, isCloudinaryConfigured, signCloudinaryParams } from "../config/cloudinary.js";

export async function uploadImageBufferToCloudinary({
  buffer,
  mimetype,
  folder = "misc",
}) {
  if (!isCloudinaryConfigured()) {
    const error = new Error("Cloudinary is not configured on the server");
    error.statusCode = 500;
    throw error;
  }

  const { cloudName, apiKey, apiSecret } = getCloudinaryConfig();
  const timestamp = Math.floor(Date.now() / 1000);
  const normalizedFolder = String(folder || "misc").trim() || "misc";
  const signedParams = {
    folder: `noorfit/${normalizedFolder}`,
    timestamp,
  };

  const signature = signCloudinaryParams(signedParams, apiSecret);
  const dataUri = `data:${mimetype || "image/jpeg"};base64,${buffer.toString("base64")}`;

  const response = await fetch(`https://api.cloudinary.com/v1_1/${cloudName}/image/upload`, {
    method: "POST",
    body: new URLSearchParams({
      file: dataUri,
      folder: signedParams.folder,
      timestamp: String(timestamp),
      api_key: apiKey,
      signature,
    }),
  });

  if (!response.ok) {
    const errorPayload = await response.json().catch(() => ({}));
    const error = new Error(errorPayload?.error?.message || "Cloudinary upload failed");
    error.statusCode = 502;
    throw error;
  }

  const result = await response.json();

  return {
    url: result.secure_url,
    publicId: result.public_id,
    width: result.width,
    height: result.height,
    format: result.format,
    bytes: result.bytes,
  };
}
