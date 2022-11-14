
            import { AppError } from './app.error';

            type TypeError = 'auth_error' | 'expired_error';

            export class UnauthozitedError extends AppError {
                constructor(message: string, type: TypeError = 'auth_error') {
                    super(message, 401, type);
                }
            }
            