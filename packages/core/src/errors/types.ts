import { BetSwirlError } from "./betSwirlError";

export class ChainError extends BetSwirlError {
  constructor(message: string, code: string, context?: Record<string, any>) {
    super(message, code, context);
    this.name = "ChainError";
  }
}

export class TransactionError extends BetSwirlError {
  constructor(message: string, code: string, context?: Record<string, any>) {
    super(message, code, context);
    this.name = "TransactionError";
  }
}

export class ConfigurationError extends BetSwirlError {
  constructor(message: string, code: string, context?: Record<string, any>) {
    super(message, code, context);
    this.name = "ConfigurationError";
  }
}
