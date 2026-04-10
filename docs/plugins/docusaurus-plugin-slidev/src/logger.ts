import logger from "@docusaurus/logger";

const PLUGIN_PREFIX = "Slidev Plugin";

export function logInfo(message: string): void {
  logger.info`[${PLUGIN_PREFIX}] ${message}`;
}

export function logWarn(message: string): void {
  logger.warn`[${PLUGIN_PREFIX}] ${message}`;
}

export function logError(message: string): void {
  logger.error`[${PLUGIN_PREFIX}] ${message}`;
}

export function logSuccess(message: string): void {
  logger.success`[${PLUGIN_PREFIX}] ${message}`;
}

export function formatPath(filePath: string): string {
  return logger.path(filePath);
}

export function formatCode(code: string): string {
  return logger.code(code);
}
