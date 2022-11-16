export class PurchaseError {
  public readonly message!: string;

  public readonly code!: string;

  constructor(message: string, code?: string) {
    this.message = message;
    if(code) {
      this.code = code
    }
  }
}
