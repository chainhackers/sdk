import { BetSwirlError } from "./betSwirlError";

export class ChainError extends BetSwirlError {
  constructor(message: string, context?: Record<string, any>) {
    super(message, "CHAIN_ERROR", context);
    this.name = "ChainError";
  }
}

export class TransactionError extends BetSwirlError {
  constructor(message: string, context?: Record<string, any>) {
    super(message, "TRANSACTION_ERROR", context);
    this.name = "TransactionError";
  }
}

export class ConfigurationError extends BetSwirlError {
  constructor(message: string, context?: Record<string, any>) {
    super(message, "CONFIGURATION_ERROR", context);
    this.name = "ConfigurationError";
  }
}
