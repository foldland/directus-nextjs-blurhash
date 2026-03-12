import type { ExtensionsServices } from '@directus/types'
import type { Logger } from 'pino'

type SettingsService = InstanceType<ExtensionsServices['SettingsService']>

/**
 * Retrieves a setting value from a service.
 * @param service - The service to retrieve the setting from.
 * @param field - The name of the setting field.
 * @param logger - Logger instance for logging progress and errors.
 * @returns The value of the setting, or null if not found.
 */
export async function getSetting(
  service: SettingsService,
  field: string,
  logger: Logger
): Promise<unknown | null> {
  try {
    const found = await service.readSingleton({ fields: [field] })
    return found[field]
  } catch (error) {
    logger.error(`[blurhasher]: Error reading settings: ${error}`)
    return null
  }
}
