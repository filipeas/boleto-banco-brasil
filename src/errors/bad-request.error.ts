import { AppError } from './app.error';

export class BadRequestError extends AppError {
  constructor(message: string) {
    super(message, 400, 'bab_request_error');
  }
}
