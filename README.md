# Stars Arena Uniswap v4 Fee Hook

This repository contains the exact Solidity sources and pinned build
configuration for the Stars Arena post-bond fee hook deployed on Robinhood
Chain. It is intended for source review, reproducible compilation, and the
Uniswap Labs v4 hook routing allowlist submission.

The production hook is a direct, non-proxy deployment. It uses the Uniswap v4
`afterSwapReturnDelta` permission to collect a fee in the swap's unspecified
currency after a swap. That is the output currency for an exact-input swap and
the input currency for an exact-output swap. It does not require custom
`hookData`.

> This source disclosure is not an audit report and should not be interpreted
> as one.

## Production deployment

Network details and contract state in this section were checked against
Robinhood Chain at block `21,368,136` on July 28, 2026.

| Item | Value |
| --- | --- |
| Network | Robinhood Chain |
| Chain ID | `4663` |
| Public RPC | `https://rpc.mainnet.chain.robinhood.com` |
| Explorer | [Robinhood Chain Blockscout](https://robinhoodchain.blockscout.com/) |
| Hook | [`0x99d4C5Cf21d8F00b627AFe2Bf1eE2840f886e044`](https://robinhoodchain.blockscout.com/address/0x99d4C5Cf21d8F00b627AFe2Bf1eE2840f886e044?tab=contract) |
| Hook factory | [`0x4e8005ce21b857200B4E581F247E76765249143A`](https://robinhoodchain.blockscout.com/address/0x4e8005ce21b857200B4E581F247E76765249143A?tab=contract) |
| Fee helper | [`0xab56cD18f3200Fb82BFE79bEFc2D8FE19528E950`](https://robinhoodchain.blockscout.com/address/0xab56cD18f3200Fb82BFE79bEFc2D8FE19528E950?tab=contract) |
| Authorized pool deployer | [`0x20E399396F031a26374aAD956AA8D7Fb241d6852`](https://robinhoodchain.blockscout.com/address/0x20E399396F031a26374aAD956AA8D7Fb241d6852?tab=contract) |
| Referral registry | [`0xE526e9f9860EeAD6f59BAA0913B7c624Ea0d29c4`](https://robinhoodchain.blockscout.com/address/0xE526e9f9860EeAD6f59BAA0913B7c624Ea0d29c4?tab=contract) |
| Uniswap v4 PoolManager | [`0x8366a39CC670B4001A1121B8F6A443A643e40951`](https://robinhoodchain.blockscout.com/address/0x8366a39CC670B4001A1121B8F6A443A643e40951) |
| Uniswap v4 PositionManager | [`0x58daec3116aae6D93017bAAea7749052E8a04fA7`](https://robinhoodchain.blockscout.com/address/0x58daec3116aae6D93017bAAea7749052E8a04fA7) |
| Uniswap Universal Router | [`0x8876789976dEcBfCbBbe364623C63652db8C0904`](https://robinhoodchain.blockscout.com/address/0x8876789976dEcBfCbBbe364623C63652db8C0904) |

The hook, hook factory, fee helper, and authorized pool deployer are fully
source-verified on Blockscout. None of those four deployments is a proxy.

### Hook deployment parameters

The production hook was deployed through the factory using CREATE2:

| Parameter | Value |
| --- | --- |
| CREATE2 salt | `0x00000000000000000000000000000000000000000000000000000000000001f8` |
| Initial/current owner | `0x4D8E431f3d93B57E3CDd3FA9cc4e6D248678933B` |
| Fee helper | `0xab56cD18f3200Fb82BFE79bEFc2D8FE19528E950` |
| PoolManager | `0x8366a39CC670B4001A1121B8F6A443A643e40951` |
| Deployment transaction | [`0x6ca5e884c0c2d00bf11751f41a37ba9dfc80a8208c2adbde0bd9d6450f33a678`](https://robinhoodchain.blockscout.com/tx/0x6ca5e884c0c2d00bf11751f41a37ba9dfc80a8208c2adbde0bd9d6450f33a678) |

At the state-check block, the hook and fee helper had no pending owner.

## Uniswap v4 hook permissions

The address encodes low-14-bit permission mask `0x2044`:

| Permission | Enabled | Purpose |
| --- | --- | --- |
| `beforeInitialize` | Yes | Restricts pool initialization to an authorized deployer |
| `afterSwap` | Yes | Calculates and distributes the configured post-bond fee |
| `afterSwapReturnDelta` | Yes | Returns the unspecified-currency fee delta to PoolManager |
| All other hook permissions | No | Not implemented |

Because the hook uses a delta flag, it must be submitted to the
[Uniswap Labs v4 hook routing allowlist](https://developers.uniswap.org/hook-allowlist).
The hook address—not the factory address—is the address to submit.

### Representative review pool

The live native ETH/ARENA pool can be supplied as the representative pool for
Robinhood Chain:

| Pool field | Value |
| --- | --- |
| Pool ID | `0x8569088057ce32491e853c0a15d1e994f5577d2e6e32eec12b8b5e1fe8dabb8f` |
| Currency 0 | Native ETH (`0x0000000000000000000000000000000000000000`) |
| Currency 1 (ARENA) | [`0x50832d74a7160E2f7d361F5E678E107D228B9Aa6`](https://robinhoodchain.blockscout.com/address/0x50832d74a7160E2f7d361F5E678E107D228B9Aa6) |
| LP fee | `2,500 ppm` (`0.25%`) |
| Tick spacing | `60` |
| Hook | `0x99d4C5Cf21d8F00b627AFe2Bf1eE2840f886e044` |

## How the hook works

1. `beforeInitialize` requires the sender supplied by PoolManager to be
   approved in the hook's `isDeployer` mapping.
2. After every swap, the hook asks `RobinhoodArenaFeeHelper` for the total fee
   configured for that pool.
3. `RobinhoodBaseHookFee` calculates the fee against the swap's unspecified
   currency amount and returns it to PoolManager as a delta. This is the output
   side for exact-input swaps and the input side for exact-output swaps.
4. `RobinhoodArenaFeeHook` settles that delta and distributes it to the
   recipient list returned by the fee helper.
5. Integer-division dust is assigned to the final recipient so the
   distributed amount equals the projected hook fee.

The hook does not custody accumulated fees between normal swaps: fee proceeds
are distributed during the swap settlement.

## Fee structure

All rates below use parts per million:

`10,000 ppm = 1%` and `2,500 ppm = 0.25%`.

The hook fee for a pool is:

```text
total hook fee ppm = global protocol fee ppm + pool-specific fee ppm
hook fee amount = unspecified-currency amount × total hook fee ppm / 1,000,000
```

The live global fee-helper configuration at the state-check block was:

| Setting | Live value |
| --- | --- |
| Protocol fee | `2,500 ppm` (`0.25%`) |
| Referral allocation | `0 ppm` (`0%`) |
| Protocol recipient | `0x5Ab2d4181aaE405Cf12DA8E6a0b7596c252F7679` |
| Fee-helper owner | `0x4D8E431f3d93B57E3CDd3FA9cc4e6D248678933B` |

Referral fees, when enabled, are carved out of the protocol fee rather than
added on top of it.

### Standard graduated launch pools

Production launch managers configure a `2,500 ppm` (`0.25%`) pool-specific
creator fee. The resulting standard hook fee is:

| Component | Rate |
| --- | --- |
| Protocol | `2,500 ppm` (`0.25%`) |
| Creator | `2,500 ppm` (`0.25%`) |
| Referral | `0 ppm` (`0%`) |
| **Total hook fee** | **`5,000 ppm` (`0.50%`)** |

The standard Uniswap pool configuration also has a separate `2,500 ppm`
(`0.25%`) LP fee. The LP fee and hook fee are distinct execution components;
their percentages should not be treated as a single arithmetic deduction for
all quoting purposes.

### Native ETH/ARENA review pool

The representative ETH/ARENA pool has no pool-specific creator fee. Its live
pool-specific fee is `0 ppm`, so its total hook fee is the `2,500 ppm`
(`0.25%`) protocol fee. Its Uniswap LP fee is separately `2,500 ppm`
(`0.25%`).

### Fee bounds

The helper enforces:

- Maximum global protocol fee: `10,000 ppm` (`1%`)
- Maximum combined pool-specific fees: `10,000 ppm` (`1%`)
- Maximum pool-specific recipient count: `5`

These are configuration ceilings, not the current production rates.

### Pre-bond fees are separate

Bonding-curve trades occur before a pool graduates to Uniswap v4 and do not use
this hook. The production launcher configuration uses a `1.00%` protocol fee,
`0.25%` creator fee, and `0%` referral fee for that separate phase.

## Administrative controls

The deployed hook bytecode is not upgradeable and the hook is not a proxy.
It is nevertheless configurable:

- The hook owner can replace `arenaFeeHelper`.
- The hook owner can authorize or revoke pool deployers.
- The fee-helper owner can update the global protocol/referral settings.
- The fee-helper owner can update per-pool recipients and fee rates within
  the documented bounds.
- Authorized fee setters can initialize a pool's fee array once.

This distinction is important: non-upgradeable bytecode does not mean that fee
configuration is immutable.

## Reproducible build

Requirements:

- Node.js 22
- pnpm 9

Install and compile:

```bash
pnpm install --frozen-lockfile
pnpm compile
```

The pinned deployment compiler configuration is:

| Build setting | Value |
| --- | --- |
| Solidity | `0.8.30+commit.73712a01` |
| Optimizer | Enabled |
| Optimizer runs | `200` |
| EVM version | `cancun` |
| IR pipeline | Disabled (`viaIR: false`) |
| OpenZeppelin Contracts | `5.0.0` |
| Uniswap v4 Core | `1.0.2` |
| Uniswap v4 Periphery | `1.0.3` |

The top-level hook source in this repository is identical to the source
published for the verified production deployment.

A clean compile of this repository was compared with live runtime bytecode.
The hook matches after accounting for its constructor-set PoolManager
immutables; the factory and fee helper match byte-for-byte.

## Source layout

```text
contracts/
└── robinhood/
    ├── RobinhoodArenaFeeHook.sol
    ├── RobinhoodArenaFeeHookFactory.sol
    ├── RobinhoodArenaFeeHelper.sol
    ├── interfaces/
    │   └── IArenaFeeHelperMinimal.sol
    └── libraries/
        ├── RobinhoodBaseHookFee.sol
        └── RobinhoodCurrencySettler.sol
```
