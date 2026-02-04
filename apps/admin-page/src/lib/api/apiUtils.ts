import { HTTPError } from 'ky';

export async function getErrorMessage(error: Error) {
  let errorMessage = error.message && 'Oops! Something went wrong!';

  if (error instanceof HTTPError) {
    const body = await error.response.json();
    if (body && body?.message) {
      errorMessage = body.message;
    }
  }

  return errorMessage;
}

export type PaginatedResponse<T> = {
  currentPage: number;
  totalPage: number;
  data: T[];
};
