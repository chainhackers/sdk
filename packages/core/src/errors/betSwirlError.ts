export class BetSwirlError extends Error {
  public code: string;
  public context?: Record<string, any>;

  constructor(message: string, code: string, context?: Record<string, any>) {
    super(message);
    this.name = "BetSwirlError";
    this.code = code;
    this.context = context;
  }
}
