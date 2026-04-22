import fs from 'node:fs/promises'
import sharp from 'sharp'

const DATA_URI_REGEX = /^data:(.+\/.+);base64,(.*)$/

export async function decodeDataUri(dataURI: string) {
  const matches = dataURI.match(DATA_URI_REGEX)
  /* v8 ignore if -- @preserve */
  if (!matches) {
    return
  }

  const mimeType = matches[1]
  const data = matches[2]
  /* v8 ignore if -- @preserve */
  if (!mimeType || !data) {
    return
  }

  const byteString = Buffer.from(data, 'base64')
  // new Blob([byteString], { type: mimeType })

  const image = sharp(byteString)
  return await image.metadata()
}

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
