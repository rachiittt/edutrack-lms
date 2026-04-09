import axios from 'axios';

export const getApiError = (error: unknown, defaultMessage = 'An unexpected error occurred'): string => {
  if (axios.isAxiosError(error)) {
    return error.response?.data?.message || defaultMessage;
  }
  if (error instanceof Error) {
    return error.message;
  }
  return typeof error === 'string' ? error : defaultMessage;
};
