export class AppError {
  public readonly message!: string;

  public readonly statusCode!: number;

  public readonly type!: string;

  constructor(message: string, statusCode: number, type: string) {
    this.message = message;
    this.statusCode = statusCode;
    this.type = type;
  }
}
