import { defineHook } from '@directus/extensions-sdk'
import type { AbstractService } from '@directus/types'
import { fileUploadAction } from './file_upload_action.ts'
import {
  routesCustomInitAfter,
  routesCustomInitBefore,
} from './routes_custom_init.ts'
import {
  CollectionNames,
  type DirectusFile,
  type DirectusSettings,
} from './utils/directus-schema.ts'

const hook = defineHook(
  ({ action, init }, { services, database, getSchema }) => {
    const { AssetsService, ItemsService, FieldsService, SettingsService } =
      services

    init('routes.custom.before', async () => {
      const schema = await getSchema()
      const options = {
        knex: database,
        schema: schema,
      }

      const fieldsService = new FieldsService(options)

      await routesCustomInitBefore(fieldsService)
    })

    init('routes.custom.after', async () => {
      const schema = await getSchema()
      const options = {
        knex: database,
        schema: schema,
      }

      const assetsService = new AssetsService(options)
      const itemsService = new ItemsService<DirectusFile>(
        CollectionNames.directus_files,
        options
      )
      const settingsService = new SettingsService(
        options
      ) as AbstractService<DirectusSettings>

      await routesCustomInitAfter(assetsService, itemsService, settingsService)
    })

    action('files.upload', async (meta, context) => {
      const schema = context.schema ?? (await getSchema())
      const options = {
        knex: database,
        schema: schema,
      }
      const assetsService = new AssetsService(options)

      const itemsService = new ItemsService<DirectusFile>(
        CollectionNames.directus_files,
        options
      )

      const settings = new SettingsService(
        options
      ) as AbstractService<DirectusSettings>

      await fileUploadAction(meta, assetsService, itemsService, settings)
    })
  }
)

export default hook
