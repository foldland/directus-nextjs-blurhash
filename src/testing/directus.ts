import {
  authentication,
  createDirectus,
  deleteFile,
  readFile,
  readFiles,
  rest,
  uploadFiles,
} from '@directus/sdk'
import type { Schema } from '../utils/directus-schema'
import { env } from './env'
import { getImageFile, type ImageFormat } from './image'

const client = createDirectus<Schema>(env.directusUrl)
  .with(rest())
  .with(authentication())

export async function login() {
  await client.login({ email: env.email, password: env.password })
}

export async function getBlurhash(id: string) {
  const file = await client.request(
    readFile(id, {
      fields: ['blurhash'],
    })
  )

  return file.blurhash
}

export async function uploadImage(path: string, format?: ImageFormat) {
  const image = await getImageFile(path, format)
  const formData = new FormData()
  formData.append('title', `Sunset Image ${format ?? 'default'}`)
  formData.append('file', image)
  return await client.request(
    uploadFiles(formData, {
      fields: ['id'],
    })
  )
}

export async function cleanupFiles() {
  const files = await client.request(
    readFiles({
      fields: ['id'],
    })
  )

  const deletions = files.map((file) => {
    return client.request(deleteFile(file.id))
  })
  await Promise.all(deletions)
}
