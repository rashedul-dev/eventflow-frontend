/**
 * Utility to handle BigInt serialization errors
 * Converts BigInt values to numbers for JSON serialization
 */

export function serializeBigInt<T>(obj: T): T {
  if (obj === null || obj === undefined) {
    return obj;
  }

  if (typeof obj === "bigint") {
    return Number(obj) as T;
  }

  if (Array.isArray(obj)) {
    return obj.map(serializeBigInt) as T;
  }

  if (typeof obj === "object") {
    const serialized: any = {};
    for (const key in obj) {
      if (Object.prototype.hasOwnProperty.call(obj, key)) {
        serialized[key] = serializeBigInt((obj as any)[key]);
      }
    }
    return serialized;
  }

  return obj;
}

/**
 * Safe JSON stringify that handles BigInt values
 */
export function safeStringify(obj: any, space?: number): string {
  return JSON.stringify(serializeBigInt(obj), null, space);
}

/**
 * Middleware to serialize BigInt in API responses
 */
export function serializeResponse(data: any): any {
  return serializeBigInt(data);
}
