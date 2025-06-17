import { z } from 'zod'

// Common sanitization schemas
export const sanitizeString = z.string().trim().min(1).max(1000)
export const sanitizeEmail = z.string().email().trim().toLowerCase()
export const sanitizeURL = z.string().url().trim()
export const sanitizeNumber = z.number().min(0).max(Number.MAX_SAFE_INTEGER)

// Sanitize object with specific rules
export function sanitizeObject<T extends object>(obj: T, schema: z.ZodType<T>): T {
  try {
    return schema.parse(obj)
  } catch (error) {
    if (error instanceof z.ZodError) {
      throw new Error(`Validation error: ${error.errors.map(e => e.message).join(', ')}`)
    }
    throw error
  }
}

// Sanitize query parameters
export function sanitizeQueryParams(params: Record<string, string | string[] | undefined>) {
  const sanitized: Record<string, string> = {}
  
  for (const [key, value] of Object.entries(params)) {
    if (value === undefined) continue
    const strValue = Array.isArray(value) ? value[0] : value
    sanitized[key] = sanitizeString.parse(strValue)
  }
  
  return sanitized
}

// Sanitize request body
export async function sanitizeRequestBody<T>(request: Request, schema: z.ZodType<T>): Promise<T> {
  const body = await request.json()
  return sanitizeObject(body, schema)
} 