import { defineHook } from '@directus/extensions-sdk'
import type { AbstractService } from '@directus/types'
import { fileUploadAction } from './file_upload_action.ts'
import { routesCustomInitAfter } from './routes_custom_init_after.ts'
import { routesCustomInitBefore } from './routes_custom_init_before.ts'
import {
  CollectionNames,
  type DirectusFile,
  type DirectusSettings,
} from './utils/directus-schema.ts'

const hook = defineHook(
  ({ action, init }, { services, database, getSchema, logger }) => {
    const { AssetsService, ItemsService, FieldsService, SettingsService } =
      services

    init('routes.custom.before', async () => {
      const schema = await getSchema()
      const options = {
        knex: database,
        schema: schema,
      }

      const fieldsService = new FieldsService(options)

      await routesCustomInitBefore({ fieldsService: fieldsService }, logger)
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

      await routesCustomInitAfter(
        {
          assetsService: assetsService,
          itemsService: itemsService,
          settingsService: settingsService,
        },
        logger
      )
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
      const settingsService = new SettingsService(
        options
      ) as AbstractService<DirectusSettings>

      await fileUploadAction(
        meta,
        {
          assetsService: assetsService,
          itemsService: itemsService,
          settingsService: settingsService,
        },
        logger
      )
    })
  }
)

export default hook
