import type { ApolloError } from "@apollo/client";
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

export class SubgraphError extends BetSwirlError {
  public apolloError: ApolloError;
  constructor(
    message: string,
    code: string,
    apolloError: ApolloError,
    context?: Record<string, any>
  ) {
    context ? (context.apolloError = apolloError) : (context = { apolloError });
    super(message, code, context);
    this.name = "SubgraphError";
    this.apolloError = apolloError;
  }
}
