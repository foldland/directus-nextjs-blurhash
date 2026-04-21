import fs from 'node:fs/promises'
import sharp from 'sharp'

export type ImageFormat =
  | 'avif'
  | 'gif'
  | 'jpeg'
  | 'jpg'
  | 'png'
  | 'tiff'
  | 'webp'

export async function getImageFile(
  path: string,
  format?: ImageFormat
): Promise<Blob> {
  let buffer: Buffer<ArrayBuffer>
  let type = 'image/jpeg'
  if (format) {
    const bytes = await sharp(path)
      .autoOrient()
      .toFormat(format)
      .timeout({ seconds: 5 })
      .toBuffer()

    buffer = Buffer.from(bytes)
    type = `image/${format}`
  } else {
    buffer = await fs.readFile(path)
  }

  return new Blob([buffer], { type: type })
}
