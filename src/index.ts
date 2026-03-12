import { defineHook } from '@directus/extensions-sdk'
import { generateBlurHashFromStream } from './blurhash.ts'
import { settings_detail_level, settings_regenerate } from './fields.ts'
import { runMigration } from './migration.ts'
import { regenerateAllImages } from './regenerate.ts'
import { getSetting } from './util.ts'

const hook = defineHook(
  ({ action, init }, { services, database, getSchema, logger }) => {
    const { AssetsService, ItemsService, FieldsService, SettingsService } =
      services

    /**
     * Extension initialization hook.
     * This hook is called when the extension is loaded.
     */
    init('routes.custom.after', async () => {
      logger.info('[blurhasher]: Initializing extension')
      const schema = await getSchema()
      const fieldsService = new FieldsService({
        knex: database,
        schema: schema,
      })
      /**
       * Migration
       */
      await runMigration(fieldsService, logger)

      const settings = new SettingsService({ schema: schema, knex: database })

      const is_regenerate = await getSetting(
        settings,
        settings_regenerate.field,
        logger
      )
      if (!is_regenerate) {
        return
      }
      /**
       * Regenerate all blurhashes if the setting is enabled.
       */
      try {
        logger.info('[blurhasher]: Regenerating blurhashes')

        const itemsService = new ItemsService('directus_files', {
          knex: database,
          schema: schema,
        })
        const assetsService = new AssetsService({
          knex: database,
          schema: schema,
        })
        await regenerateAllImages(itemsService, assetsService, logger)
        logger.info('[blurhasher]: Regeneration complete')
      } catch (error) {
        logger.error(
          `[blurhasher]: An error occurred while regenerating blurhashes: ${error}`
        )
      } finally {
        settings.upsertSingleton({ blurhasher_regenerate_on_restart: false })
      }
    })

    /**
     * Action hook for the `files.upload` action.
     * This hook is called when a file is uploaded to Directus.
     */
    action('files.upload', async ({ payload, key }, context) => {
      if (
        ![
          'image/jpeg',
          'image/png',
          'image/webp',
          'image/tiff',
          'image/avif',
        ].includes(payload.type)
      ) {
        // Skip non-image files
        return
      }

      const schema = await getSchema()

      const assetsService = new AssetsService({
        ...context,
        knex: context.database,
        schema: schema,
      })

      const itemsService = new ItemsService('directus_files', {
        knex: database,
        schema: schema,
      })

      const settings = new SettingsService({
        knex: database,
        schema: schema,
      })

      const detail_level = await getSetting(
        settings,
        settings_detail_level.field,
        logger
      )

      let size = 0
      switch (detail_level) {
        case 'low':
          size = 16
          break
        case 'high':
          size = 64
          break
        default:
          // Default value for medium detail
          size = 32
      }

      const { stream } = await assetsService.getAsset(key, {
        transformationParams: {
          quality: 100,
          height: size,
          width: size,
          format: 'png',
          fit: 'inside',
        },
      })

      const blurHash = await generateBlurHashFromStream(stream, logger)

      itemsService.updateOne(key, { blurhash: blurHash })
    })
  }
)

export default hook
