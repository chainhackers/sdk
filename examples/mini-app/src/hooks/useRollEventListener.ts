// import { useEffect } from 'react'
// import { watchContractEvent, type WatchContractEventReturnType } from 'wagmi/actions'
// import { getPlaceBetFunctionData } from "@betswirl/sdk-core"
// type Props = {
//   betId: bigint
//   onRoll: (logs: any[]) => void
// }
//
// export function useRollEventListener({ betId, onRoll }: Props) {
//
//
//   useEffect(() => {
//     const unwatch = watchContractEvent({
//       address,
//       abi,
//       eventName: 'Roll',
//       chainId,
//       onLogs: onRoll,
//     })
//
//     return () => unwatch()
//   }, [address, abi, chainId, onRoll])
// }
