import type { Logger } from 'pino'
import { applySettings } from './utils/settings.ts'
import type { FieldsService } from './utils/types.ts'

interface InitBeforeServices {
  fieldsService: FieldsService
}

export async function routesCustomInitBefore(
  services: InitBeforeServices,
  logger: Logger
): Promise<void> {
  const { fieldsService } = services

  await applySettings(fieldsService, logger)
}
