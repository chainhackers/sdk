import type { BetSwirlEventData, BetSwirlFunctionData } from "../interfaces";
import type { Abi, Hash, TransactionReceipt, PublicClient as ViemPublicClient, CallReturnType, Hex, Account } from "viem";

export abstract class BetSwirlWallet {
    abstract getChainId(): number;

    abstract getPublicClient(chainId?: number): ViemPublicClient;
    abstract getAccount(chainId?: number): Account | undefined;

    abstract readContract<
        TFunctionData extends BetSwirlFunctionData<Abi, string, readonly any[]>
    >(functionData: TFunctionData, gasPrice: bigint): Promise<CallReturnType>;

    abstract readContract<
        TFunctionData extends BetSwirlFunctionData<Abi, string, readonly any[]>,
        TReturnType = any
    >(functionData: TFunctionData, gasPrice?: undefined): Promise<TReturnType>;

    abstract readContracts<TFunctionDatas extends BetSwirlFunctionData<Abi, string, readonly any[]>[], TReturnTypes extends any[]>(
        functionDatas: [...TFunctionDatas],
    ): Promise<TReturnTypes>;

    abstract getTransactionReceipt(txHash: Hash): Promise<TransactionReceipt>;

    abstract watchContractEvent<TEventData extends BetSwirlEventData<Abi, string, {}>>(
        eventData: TEventData,
    ): () => void;

    abstract writeContract<
        TFunctionData extends BetSwirlFunctionData<Abi, string, readonly any[]>
    >(functionData: TFunctionData, value?: bigint, gasPrice?: bigint): Promise<Hash>;

    abstract waitTransaction(txHash: Hash, pollingInterval?: number): Promise<TransactionReceipt>;

}