export interface ApiError {
  error?: string;
  details?: string;
  missing_items?: string[];
  code?: number;
}

export interface ErrorContext {
  action: string;
  component?: string;
  additionalInfo?: Record<string, unknown>;
}

export class GameError extends Error {
  public context: ErrorContext;
  public apiError?: ApiError;
  public isNetworkError: boolean;
  public isAuthError: boolean;

  constructor(
    message: string,
    context: ErrorContext,
    apiError?: ApiError,
    isNetworkError = false,
    isAuthError = false
  ) {
    super(message);
    this.name = "GameError";
    this.context = context;
    this.apiError = apiError;
    this.isNetworkError = isNetworkError;
    this.isAuthError = isAuthError;
  }
}

export const createGameError = (
  message: string,
  context: ErrorContext,
  apiError?: ApiError,
  isNetworkError = false,
  isAuthError = false
): GameError => {
  return new GameError(message, context, apiError, isNetworkError, isAuthError);
};

interface ApiErrorResponse {
  response?: {
    status?: number;
    data?: {
      error?: string;
      missing_items?: string[];
    };
  };
}

export const handleApiError = (
  error: unknown,
  context: ErrorContext
): GameError => {
  console.error(`Error in ${context.action}:`, error);

  const apiError = error as ApiErrorResponse;

  // Network errors
  if (!apiError.response) {
    return createGameError(
      "Network error - please check your connection",
      context,
      undefined,
      true
    );
  }

  // Authentication errors
  if (apiError.response?.status === 401) {
    return createGameError(
      "Authentication failed - please log in again",
      context,
      apiError.response?.data,
      false,
      true
    );
  }

  // API errors with details
  if (apiError.response?.data?.error) {
    return createGameError(
      apiError.response.data.error,
      context,
      apiError.response.data
    );
  }

  // Generic error
  return createGameError(
    "An unexpected error occurred",
    context,
    apiError.response?.data
  );
};

export const getErrorMessage = (error: GameError): string => {
  if (error.isNetworkError) {
    return "Connection lost. Please check your internet connection and try again.";
  }

  if (error.isAuthError) {
    return "Your session has expired. Please log in again.";
  }

  if (error.apiError?.missing_items) {
    return `Missing required items: ${error.apiError.missing_items.join(", ")}`;
  }

  return error.message || "An unexpected error occurred.";
};

export const shouldRetry = (error: GameError): boolean => {
  return error.isNetworkError && !error.isAuthError;
};

export const logError = (error: GameError): void => {
  console.error("Game Error:", {
    message: error.message,
    context: error.context,
    apiError: error.apiError,
    isNetworkError: error.isNetworkError,
    isAuthError: error.isAuthError,
    stack: error.stack,
  });
};
