export class BusinessException extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'BusinessException';
    // Restore prototype chain
    Object.setPrototypeOf(this, BusinessException.prototype);
  }
}
