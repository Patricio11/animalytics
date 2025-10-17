/**
 * Standardized API response utilities
 * Consistent response format across all API routes
 */

export interface ApiSuccessResponse<T = unknown> {
  success: true;
  data: T;
  message?: string;
  meta?: {
    page?: number;
    limit?: number;
    total?: number;
    [key: string]: number | string | boolean | undefined;
  };
}

export interface ApiErrorResponse {
  success: false;
  error: string;
  errors?: Array<{
    field?: string;
    message: string;
  }>;
  code?: string;
}

/**
 * Success response with data
 */
export function successResponse<T>(
  data: T,
  message?: string,
  meta?: ApiSuccessResponse['meta']
): Response {
  const response: ApiSuccessResponse<T> = {
    success: true,
    data,
  };

  if (message) {
    response.message = message;
  }

  if (meta) {
    response.meta = meta;
  }

  return Response.json(response, {
    status: 200,
    headers: {
      'Content-Type': 'application/json',
    },
  });
}

/**
 * Error response with message
 */
export function errorResponse(
  error: string,
  statusCode: number = 400,
  errors?: Array<{ field?: string; message: string }>,
  code?: string
): Response {
  const response: ApiErrorResponse = {
    success: false,
    error,
  };

  if (errors && errors.length > 0) {
    response.errors = errors;
  }

  if (code) {
    response.code = code;
  }

  return Response.json(response, {
    status: statusCode,
    headers: {
      'Content-Type': 'application/json',
    },
  });
}

/**
 * Created response (201)
 */
export function createdResponse<T>(data: T, message?: string): Response {
  return Response.json(
    {
      success: true,
      data,
      message: message || 'Resource created successfully',
    } as ApiSuccessResponse<T>,
    {
      status: 201,
      headers: {
        'Content-Type': 'application/json',
      },
    }
  );
}

/**
 * No content response (204)
 */
export function noContentResponse(): Response {
  return new Response(null, {
    status: 204,
  });
}

/**
 * Unauthorized response (401)
 */
export function unauthorizedResponse(message: string = 'Unauthorized'): Response {
  return errorResponse(message, 401, undefined, 'UNAUTHORIZED');
}

/**
 * Forbidden response (403)
 */
export function forbiddenResponse(message: string = 'Forbidden'): Response {
  return errorResponse(message, 403, undefined, 'FORBIDDEN');
}

/**
 * Not found response (404)
 */
export function notFoundResponse(message: string = 'Resource not found'): Response {
  return errorResponse(message, 404, undefined, 'NOT_FOUND');
}

/**
 * Validation error response (422)
 */
export function validationErrorResponse(
  errors: Array<{ field?: string; message: string }>
): Response {
  return errorResponse(
    'Validation failed',
    422,
    errors,
    'VALIDATION_ERROR'
  );
}

/**
 * Server error response (500)
 */
export function serverErrorResponse(
  message: string = 'Internal server error'
): Response {
  return errorResponse(message, 500, undefined, 'SERVER_ERROR');
}
