import { COINTOSS_FACE } from "@betswirl/sdk-core"
import { TokenImage } from "@coinbase/onchainkit/token"
import type { Meta } from "@storybook/react"
import { parseUnits } from "viem"
import gameBg from "../../assets/game/game-background.png"
import { ETH_TOKEN } from "../../lib/tokens"
import { GameFrame } from "./GameFrame"
import { type HistoryEntry } from "./HistorySheetPanel"

declare global {
  interface BigInt {
    toJSON(): string
  }
}

BigInt.prototype.toJSON = function () {
  return this.toString()
}

const meta = {
  title: "Game/GameFrame",
  component: GameFrame,
  parameters: {
    layout: "centered",
    backgrounds: {
      default: "light",
      values: [
        { name: "light", value: "#FFFFFF" },
        { name: "dark", value: "oklch(0.15 0 0)" },
      ],
    },
  },
  tags: ["autodocs"],
} satisfies Meta<typeof GameFrame>

export default meta

const mockHistoryData: HistoryEntry[] = [
  {
    id: "1",
    status: "Won bet",
    multiplier: 1.94,
    payoutAmount: "1.94675",
    payoutCurrencyIcon: <TokenImage token={ETH_TOKEN} size={18} />,
    timestamp: "~24h ago",
  },
  {
    id: "2",
    status: "Won bet",
    multiplier: 1.2,
    payoutAmount: 0.2,
    payoutCurrencyIcon: <TokenImage token={ETH_TOKEN} size={18} />,
    timestamp: "~2h ago",
  },
  {
    id: "3",
    status: "Busted",
    multiplier: 1.94,
    payoutAmount: 1.94,
    payoutCurrencyIcon: <TokenImage token={ETH_TOKEN} size={18} />,
    timestamp: "~2h ago",
  },
]

export const WalletNotConnected = {
  render: () => (
    <GameFrame themeSettings={{ backgroundImage: gameBg }}>
      <GameFrame.Header title="CoinToss" connectWalletButton={<></>} />
      <GameFrame.GameArea>
        <GameFrame.InfoButton
          winChance={50}
          rngFee={0.0001}
          targetPayout={(
            (parseUnits("0.1234567", 18) * 194n) /
            100n
          ).toString()}
          gasPrice={34.2123}
          tokenDecimals={18}
          nativeCurrencySymbol="ETH"
        />
        <GameFrame.HistoryButton
          historyData={mockHistoryData}
          onHistoryOpen={() => console.log("History opened")}
        />
        <GameFrame.GameControls>
          <div className="absolute top-1/5 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-[26px] font-extrabold leading-[34px] text-white">
            1.94 x
          </div>
        </GameFrame.GameControls>
      </GameFrame.GameArea>
      <GameFrame.BettingSection
        balance={1123456n * 10n ** 12n}
        isConnected={false}
        tokenDecimals={18}
        betStatus={null}
        betAmount={parseUnits("0.1234567", 18)}
        onBetAmountChange={(amount) => console.log("Bet amount:", amount)}
        onPlayBtnClick={() => console.log("Play clicked")}
        areChainsSynced={true}
      />
    </GameFrame>
  ),
}

export const WalletConnected = {
  render: () => (
    <GameFrame themeSettings={{ backgroundImage: gameBg }}>
      <GameFrame.Header title="CoinToss" connectWalletButton={<></>} />
      <GameFrame.GameArea>
        <GameFrame.InfoButton
          winChance={50}
          rngFee={0.0001}
          targetPayout={(
            (parseUnits("0.1234567", 18) * 194n) /
            100n
          ).toString()}
          gasPrice={34.2123}
          tokenDecimals={18}
          nativeCurrencySymbol="ETH"
        />
        <GameFrame.HistoryButton
          historyData={mockHistoryData}
          onHistoryOpen={() => console.log("History opened")}
        />
        <GameFrame.GameControls>
          <div className="absolute top-1/5 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-[26px] font-extrabold leading-[34px] text-white">
            1.94 x
          </div>
        </GameFrame.GameControls>
      </GameFrame.GameArea>
      <GameFrame.BettingSection
        balance={1123456n * 10n ** 12n}
        isConnected={true}
        tokenDecimals={18}
        betStatus={null}
        betAmount={parseUnits("0.1234567", 18)}
        onBetAmountChange={(amount) => console.log("Bet amount:", amount)}
        onPlayBtnClick={() => console.log("Play clicked")}
        areChainsSynced={true}
      />
    </GameFrame>
  ),
}

export const PlacingBet = {
  render: () => (
    <GameFrame themeSettings={{ backgroundImage: gameBg }}>
      <GameFrame.Header title="CoinToss" connectWalletButton={<></>} />
      <GameFrame.GameArea>
        <GameFrame.InfoButton
          winChance={50}
          rngFee={0.0001}
          targetPayout={(
            (parseUnits("0.1234567", 18) * 194n) /
            100n
          ).toString()}
          gasPrice={34.2123}
          tokenDecimals={18}
          nativeCurrencySymbol="ETH"
        />
        <GameFrame.HistoryButton
          historyData={mockHistoryData}
          onHistoryOpen={() => console.log("History opened")}
        />
        <GameFrame.GameControls>
          <div className="absolute top-1/5 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-[26px] font-extrabold leading-[34px] text-white">
            1.94 x
          </div>
        </GameFrame.GameControls>
      </GameFrame.GameArea>
      <GameFrame.BettingSection
        balance={1123456n * 10n ** 12n}
        isConnected={true}
        tokenDecimals={18}
        betStatus="pending"
        betAmount={parseUnits("0.1234567", 18)}
        onBetAmountChange={(amount) => console.log("Bet amount:", amount)}
        onPlayBtnClick={() => console.log("Play clicked")}
        areChainsSynced={true}
      />
    </GameFrame>
  ),
}

export const Win = {
  render: () => (
    <GameFrame themeSettings={{ backgroundImage: gameBg }}>
      <GameFrame.Header title="CoinToss" connectWalletButton={<></>} />
      <GameFrame.GameArea>
        <GameFrame.InfoButton
          winChance={50}
          rngFee={0.0001}
          targetPayout={(
            (parseUnits("0.1234567", 18) * 194n) /
            100n
          ).toString()}
          gasPrice={34.2123}
          tokenDecimals={18}
          nativeCurrencySymbol="ETH"
        />
        <GameFrame.HistoryButton
          historyData={mockHistoryData}
          onHistoryOpen={() => console.log("History opened")}
        />
        <GameFrame.GameControls>
          <div className="absolute top-1/5 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-[26px] font-extrabold leading-[34px] text-white">
            1.94 x
          </div>
        </GameFrame.GameControls>
        <GameFrame.ResultWindow
          gameResult={{
            isWin: true,
            payout: (parseUnits("0.1234567", 18) * 194n) / 100n,
            currency: "ETH",
            rolled: COINTOSS_FACE.HEADS,
          }}
          betAmount={parseUnits("0.1234567", 18)}
          currency="ETH"
        />
      </GameFrame.GameArea>
      <GameFrame.BettingSection
        balance={1123456n * 10n ** 12n}
        isConnected={true}
        tokenDecimals={18}
        betStatus="success"
        betAmount={parseUnits("0.1234567", 18)}
        onBetAmountChange={(amount) => console.log("Bet amount:", amount)}
        onPlayBtnClick={() => console.log("Play clicked")}
        areChainsSynced={true}
      />
    </GameFrame>
  ),
}
