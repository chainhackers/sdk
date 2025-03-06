# @betswirl/wagmi-provider

A provider allowing to use **@betswirl/sdk-core** through a Wagmi client.

## Installation

```bash
pnpm i @betswirl/wagmi-provider
```

## Usage
```typescript
import { createConfig } from "@wagmi/core";
import { initBetSwirlWagmiClient} from "@betswirl/wagmi-provider";

/* Init the client */

const wagmiConfig = createConfig(...)

  const betSwirlWagmiClient = initBetSwirlWagmiClient(wagmiConfig, {
    chainId: 137,
    affiliate: "0x...",
    gasPriceType: GAS_PRICE_TYPE.FAST,
    ...
  });

/* Use the client */

const casinoGames = await betSwirlWagmiClient.getCasinoGames(137, false);

betSwirlWagmiClient.playDice(77, ...)

...

```

## Example

- [NodeJs CLI](https://github.com/BetSwirl/sdk/tree/main/examples/node)