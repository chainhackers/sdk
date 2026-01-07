# BetSwirl Bankroll & Revenue Analysis

**Generated:** 2026-01-07
**Bank Contract:** `0x8FB3110015FBCAA469ee45B64dcd2BdF544B9CFA` (same on all chains)

---

## Executive Summary

This analysis answers key questions about BetSwirl's bankroll requirements, utilization, and revenue structure.

| Question | Finding |
|----------|---------|
| How big must bankrolls be? | Dynamic based on balance risk (2-10%), not fixed |
| Are they utilized? | Low utilization - TVL peaked at $1.15M, now ~$10K |
| Can it run with less? | Yes, bankrolls scale with bet demand |
| Revenue from sports vs casino | Casino: 2.4-4% house edge, Sports: 60% of Azuro profits |

---

## 1. Max Bet Calculation Formula

The smart contract calculates max bet dynamically:

```
Max Payout = Bankroll Balance × Balance Risk%
Max Bet = Max Payout / (Multiplier - 1)
```

Where:
- **Balance Risk**: Configurable per token (in basis points, 10000 = 100%)
- **Multiplier**: Game payout multiplier (also in BP, 20000 = 2x)

### Balance Risk Settings by Token (Base Chain)

| Token | Balance Risk (BP) | Risk % | Use Case |
|-------|-------------------|--------|----------|
| ETH | 200 | 2% | Conservative native token |
| USDC | 200 | 2% | Conservative stablecoin |
| DEGEN | 1000 | 10% | Higher risk for meme token |
| BETS | varies | varies | Protocol token |

### Max Bet Examples

For a **$100,000 bankroll** with **2% balance risk**:

| Game | Multiplier | Max Payout | Max Bet |
|------|------------|------------|---------|
| Coin Toss | 2x | $2,000 | $2,000 |
| Dice (6) | 6x | $2,000 | $400 |
| Dice (10) | 10x | $2,000 | $222 |
| Roulette Single | 36x | $2,000 | $57 |

For a **$10,000 bankroll** with **2% balance risk**:

| Game | Multiplier | Max Payout | Max Bet |
|------|------------|------------|---------|
| Coin Toss | 2x | $200 | $200 |
| Dice (6) | 6x | $200 | $40 |
| Dice (10) | 10x | $200 | $22 |
| Roulette Single | 36x | $200 | $5.71 |

---

## 2. Current Bankroll Status

### TVL Historical Data (from DefiLlama)

| Period | Staking TVL | Notes |
|--------|-------------|-------|
| **Peak (Jul 2023)** | ~$1.15M | All-time high |
| **Jul 2024 spike** | ~$641K | Brief recovery |
| **Current (2026)** | ~$10K | Significantly declined |

**Note:** The TVL metric from DefiLlama tracks BETS staking, not the casino bankroll directly. The actual casino bankrolls are held per-token in the Bank contract.

### Checking Live Bankroll Balances

Query these explorer links for real-time Bank contract balances:

| Chain | Explorer Link |
|-------|---------------|
| **Base** | [BaseScan](https://basescan.org/address/0x8FB3110015FBCAA469ee45B64dcd2BdF544B9CFA#tokentxns) |
| **Arbitrum** | [Arbiscan](https://arbiscan.io/address/0x8FB3110015FBCAA469ee45B64dcd2BdF544B9CFA#tokentxns) |
| **Polygon** | [PolygonScan](https://polygonscan.com/address/0x8FB3110015FBCAA469ee45B64dcd2BdF544B9CFA#tokentxns) |
| **BNB Chain** | [BscScan](https://bscscan.com/address/0x8FB3110015FBCAA469ee45B64dcd2BdF544B9CFA#tokentxns) |
| **Avalanche** | [Snowtrace](https://snowtrace.io/address/0x8FB3110015FBCAA469ee45B64dcd2BdF544B9CFA#tokentxns) |

---

## 3. Bankroll Utilization Analysis

### The Core Question: "Can it run with less?"

**Yes.** The BetSwirl model is **demand-driven**, not capacity-driven:

1. **Max bet scales linearly with bankroll**
   - $100K bankroll → $2,000 max payout (2% risk)
   - $10K bankroll → $200 max payout

2. **Utilization depends on bet demand, not bankroll size**
   - A $1M bankroll with $1K average daily bets = 0.1% utilization
   - A $50K bankroll with same bets = 2% utilization

3. **Smaller bankroll = smaller max bet = same risk profile**

### Minimum Bankroll Calculation

To determine minimum required bankroll:

```
Required Bankroll = (Desired Max Bet × (Multiplier - 1)) / Balance Risk%
```

**Example:** To support $100 max bet on Coin Toss (2x) with 2% risk:
```
Required Bankroll = ($100 × 1) / 0.02 = $5,000
```

### Utilization Metrics to Monitor

| Metric | Formula | Target |
|--------|---------|--------|
| Bet Volume / Bankroll | Daily wagered / Total bankroll | <50% for safety |
| Max Bet Fill Rate | Actual bets at max / Total bets | Low = oversized bankroll |
| Revenue / Bankroll | Daily revenue / Total bankroll | Efficiency metric |

---

## 4. Revenue Breakdown: Casino vs Sports Betting

### Casino Revenue (PvH Games)

| Metric | Value |
|--------|-------|
| **House Edge** | 2.4% - 4% of payout |
| **PvP Games Edge** | 3.5% - 7% |

**House Edge Distribution:**

| Recipient | Share | Description |
|-----------|-------|-------------|
| **Bank (Bankroll)** | 40% | Replenishes bankroll |
| **Affiliates** | 30% | Frontend operators |
| **Dividends** | ~20% | BETS stakers |
| **Treasury + Team** | ~10% | Protocol operations |

### Sports Betting Revenue (Azuro Integration)

| Metric | Value |
|--------|-------|
| **Revenue Model** | BetSwirl is an Azuro frontend affiliate |
| **Revenue Share** | **60% of Azuro protocol profits** |
| **Liquidity** | Provided by Azuro pools (not BetSwirl bankroll) |
| **Risk** | Zero - Azuro handles all risk |

**Key Insight:** Sports betting is pure affiliate revenue with no bankroll requirement.

### Revenue Comparison

| Source | Bankroll Required | Risk | Revenue Model |
|--------|-------------------|------|---------------|
| **Casino** | Yes | Variance risk | 2.4-4% house edge |
| **Sports** | No | Zero | 60% Azuro profit share |

### Historical Revenue (DefiLlama)

| Metric | Value |
|--------|-------|
| **Cumulative Fees (All-Time)** | $1.61M |
| **Cumulative Revenue** | $908K |
| **Cumulative Staker Revenue** | $470K |
| **Recent 30-day Fees** | ~$12K |
| **Recent 30-day Revenue** | ~$6K |

---

## 5. Optimization Recommendations

### For Running Casino with Smaller Bankroll

1. **Start with stable tokens (USDC, ETH)**
   - Lower volatility = more predictable risk

2. **Set conservative balance risk (2%)**
   - Standard 200 BP is appropriate

3. **Match bankroll to average bet demand**
   - If average bet is $10, a $5K bankroll supports $100 max bet (coin toss)

4. **Scale up based on utilization**
   - Only add to bankroll when max bet limits are consistently hit

### Revenue Maximization Strategy

| Strategy | Rationale |
|----------|-----------|
| **Prioritize sports betting** | Zero capital, 60% revenue share |
| **Run lean casino bankroll** | Match to actual demand |
| **Multiple tokens** | Capture different user bases |
| **Aggressive affiliate marketing** | 30% of all bets through your frontend |

---

## 6. Quick Reference

### Smart Contract Functions

```solidity
// Get max bet for a token at specific multiplier
getMaxBetAmount(address token, uint256 multiplier) returns (uint256)

// Get full bet requirements
getBetRequirements(address token, uint256 multiplier)
  returns (bool isAllowed, uint256 maxBetAmount, uint256 maxBetCount)

// Get all token configurations
getTokens() returns (TokenMetadata[])
```

### Key Addresses (All Chains)

| Contract | Address |
|----------|---------|
| Bank | `0x8FB3110015FBCAA469ee45B64dcd2BdF544B9CFA` |
| CoinToss | `0xC3Dff2489F8241729B824e23eD01F986fcDf8ec3` |
| Dice | `0xAa4D2931a9fE14c3dec8AC3f12923Cbb535C0e5f` |
| Roulette | `0x6678e3B4AB2a8C8Cdd068F132C21293CcBda33cb` |

### Live Dashboards

| Platform | URL |
|----------|-----|
| Dune iGaming | https://dune.com/betswirl/analytics |
| Dune Sports | https://dune.com/betswirl/sports |
| DefiLlama | https://defillama.com/protocol/betswirl |
| BetSwirl App | https://app.betswirl.com/protocol/analytics/affiliate |

---

## Sources

- [BetSwirl SDK Documentation](https://github.com/BetSwirl/sdk)
- [BetSwirl Smart Contracts](https://github.com/BetSwirl/Smart-Contracts/blob/main/docs/Bank.md)
- [DefiLlama BetSwirl](https://defillama.com/protocol/betswirl)
- [DefiLlama Fees](https://defillama.com/fees/betswirl)
- [Dune Analytics - BetSwirl](https://dune.com/betswirl/analytics)
- [BetSwirl Docs - Affiliates](https://docs.betswirl.com/protocol-hub/partners/affiliates)
- [BetSwirl Docs - Sports Betting](https://www.betswirl.com/docs/sports-betting)
