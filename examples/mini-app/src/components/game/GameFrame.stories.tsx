import { COINTOSS_FACE, DiceNumber } from "@betswirl/sdk-core"
import { TokenImage } from "@coinbase/onchainkit/token"
import type { Meta, StoryObj } from "@storybook/react"
import { useState } from "react"
import { parseUnits } from "viem"
import gameBg from "../../assets/game/game-background.png"
import { ETH_TOKEN } from "../../lib/tokens"
import { GameFrame } from "./GameFrame"
import { CoinTossGameControls } from "./CoinTossGameControls"
import { DiceGameControls } from "./DiceGameControls"
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
type Story = StoryObj<typeof meta>

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

function InteractiveCoinTossControls({
  initialSelectedSide = COINTOSS_FACE.HEADS,
  multiplier = "1.94",
  isDisabled = false,
}: {
  initialSelectedSide?: COINTOSS_FACE
  multiplier?: string
  isDisabled?: boolean
}) {
  const [selectedSide, setSelectedSide] = useState(initialSelectedSide)

  const handleCoinClick = () => {
    if (isDisabled) return
    setSelectedSide(
      selectedSide === COINTOSS_FACE.HEADS
        ? COINTOSS_FACE.TAILS
        : COINTOSS_FACE.HEADS,
    )
  }

  return (
    <CoinTossGameControls
      selectedSide={selectedSide}
      onCoinClick={handleCoinClick}
      multiplier={multiplier}
      isDisabled={isDisabled}
    />
  )
}

function InteractiveDiceControls({
  initialSelectedNumber = 50,
  multiplier = 1.94,
  isDisabled = false,
}: {
  initialSelectedNumber?: number
  multiplier?: number
  isDisabled?: boolean
}) {
  const [selectedNumber, setSelectedNumber] = useState(initialSelectedNumber)

  const handleNumberChange = (value: number) => {
    if (isDisabled) return
    setSelectedNumber(value)
  }

  return (
    <DiceGameControls
      selectedNumber={selectedNumber}
      onNumberChange={handleNumberChange}
      multiplier={multiplier}
      isDisabled={isDisabled}
    />
  )
}

export const CoinTossWalletNotConnected: Story = {
  args: {} as any,
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
          <InteractiveCoinTossControls isDisabled={true} />
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

export const CoinTossWalletConnected: Story = {
  args: {} as any,
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
          <InteractiveCoinTossControls />
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

export const CoinTossPlacingBet: Story = {
  args: {} as any,
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
          <InteractiveCoinTossControls isDisabled={true} />
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

export const CoinTossWin: Story = {
  args: {} as any,
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
          <InteractiveCoinTossControls isDisabled={true} />
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

export const CoinTossLoss: Story = {
  args: {} as any,
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
          <InteractiveCoinTossControls isDisabled={true} />
        </GameFrame.GameControls>
        <GameFrame.ResultWindow
          gameResult={{
            isWin: false,
            payout: 0n,
            currency: "ETH",
            rolled: COINTOSS_FACE.TAILS,
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

export const DiceWalletNotConnected: Story = {
  args: {} as any,
  render: () => (
    <GameFrame themeSettings={{ backgroundImage: gameBg }}>
      <GameFrame.Header title="Dice" connectWalletButton={<></>} />
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
          <InteractiveDiceControls isDisabled={true} />
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

export const DiceWalletConnected: Story = {
  args: {} as any,
  render: () => (
    <GameFrame themeSettings={{ backgroundImage: gameBg }}>
      <GameFrame.Header title="Dice" connectWalletButton={<></>} />
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
          <InteractiveDiceControls />
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

export const DicePlacingBet: Story = {
  args: {} as any,
  render: () => (
    <GameFrame themeSettings={{ backgroundImage: gameBg }}>
      <GameFrame.Header title="Dice" connectWalletButton={<></>} />
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
          <InteractiveDiceControls isDisabled={true} />
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

export const DiceWin: Story = {
  args: {} as any,
  render: () => (
    <GameFrame themeSettings={{ backgroundImage: gameBg }}>
      <GameFrame.Header title="Dice" connectWalletButton={<></>} />
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
          <InteractiveDiceControls isDisabled={true} />
        </GameFrame.GameControls>
        <GameFrame.ResultWindow
          gameResult={{
            isWin: true,
            payout: (parseUnits("0.1234567", 18) * 194n) / 100n,
            currency: "ETH",
            rolled: 42 as DiceNumber,
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

export const DiceLoss: Story = {
  args: {} as any,
  render: () => (
    <GameFrame themeSettings={{ backgroundImage: gameBg }}>
      <GameFrame.Header title="Dice" connectWalletButton={<></>} />
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
          <InteractiveDiceControls isDisabled={true} />
        </GameFrame.GameControls>
        <GameFrame.ResultWindow
          gameResult={{
            isWin: false,
            payout: 0n,
            currency: "ETH",
            rolled: 75 as DiceNumber,
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
