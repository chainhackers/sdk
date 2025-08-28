# BetSwirl SDK Documentation Structure

## Level 1: "Is this for me?" (Landing/Overview)

### 1.1 What is BetSwirl?
- Decentralized casino on blockchain
- Ready-to-use smart contracts for casino games
- SDK for integration into any application
- Blockchain transparency
- Chainlink VRF for fair randomness

### 1.2 Who is it for?

**dApp Developers**
- Add gaming functionality to your app
- Ready React components
- Full UI customization

**Website Owners (Affiliates)**
- Earn ~30% of house edge
- No need to hold bankroll
- Turnkey solution

**Mini-app Creators**
- Telegram bots with games
- Farcaster frames
- Mobile PWA

**Liquidity Providers**
- ~20% of casino profits
- Portfolio diversification
- Transparent statistics

### 1.3 Available games?
- CoinToss - Heads or tails
- Dice - Dice with adjustable multiplier
- Roulette - European roulette
- Keno - Number selection lottery
- Wheel - Wheel of fortune (coming soon)
- Plinko - Falling ball (coming soon)

### 1.4 Supported networks?
- Base - Low fees, fast transactions
- Polygon - Popular L2 network
- Avalanche - High throughput
- Testnets - Base Sepolia, Polygon Amoy, Avalanche Fuji

### 1.5 Protocol economics
- House Edge: 2.5-4% (configurable)
- Profit distribution:
  - ~30% to affiliates
  - ~20% to bankroll providers
  - ~50% to protocol and development
- VRF fees: Small fee for Chainlink randomness

## Level 2: "Want to try!" (Quick Start)

### 2.1 Install in 1 minute
```bash
npm install @betswirl/sdk-core @betswirl/sdk-wagmi
```

### 2.2 First bet in 5 minutes
- Connect wallet
- Simple CoinToss example
- Check result

### 2.3 Where to get test tokens?
- Faucet for each network
- Balance requirements
- Test contracts

## Level 3: "How to do it?" (Guides)

### 3.1 Basic operations
- How to connect wallet
- How to place a CoinToss bet
- How to place a Dice bet
- How to place a Roulette bet
- How to claim winnings
- How to check bet history

### 3.2 Token management
- How to use native tokens (ETH/MATIC/AVAX)
- How to use ERC20 tokens
- How to manage token approvals
- How to calculate max bet amount

### 3.3 Advanced features
- How to get and use freebets
- How to switch between networks
- How to handle errors
- How to track bet status

### 3.4 For affiliates
- How to set up affiliate address
- How to track commissions
- How to withdraw earnings
- How to attract players

### 3.5 Integrations
- React app from scratch
- Adding to existing project
- Telegram mini-app
- Farcaster frame

## Level 4: "Need details" (Reference)

### 4.1 API Reference
- Complete function list (when needed)
- Types and interfaces
- Contract events

### 4.2 Architecture
- Provider pattern
- Function data pattern
- Subgraph integration

### 4.3 Smart contracts
- Contract addresses
- ABI and interfaces
- Security and audits

### 4.4 Troubleshooting
- Common errors
- Gas issues
- VRF timeouts
- Network problems

## Starting priorities

**Phase 1 (Most important):**
1. Overview - what it is and who needs it
2. Quick Start - installation and first bet
3. Guide: How to place a CoinToss bet
4. Guide: How to connect wallet

**Phase 2 (Expansion):**
5. Guides for other games
6. Token management
7. For affiliates

**Phase 3 (Advanced):**
8. Complete integration examples
9. API Reference
10. Architecture and contracts