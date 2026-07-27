const DEFAULT_ERROR_MESSAGE = 'Unable to complete the request.';

export const normalizeApiError = (error) => {
  if (
    error &&
    typeof error.message === 'string' &&
    Array.isArray(error.errors) &&
    Object.hasOwn(error, 'statusCode')
  ) {
    return error;
  }

  const responseData = error?.response?.data;

  return {
    message:
      typeof responseData?.message === 'string'
        ? responseData.message
        : DEFAULT_ERROR_MESSAGE,
    errors: Array.isArray(responseData?.errors) ? responseData.errors : [],
    statusCode: error?.response?.status || null,
  };
};
