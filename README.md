# Stars Arena V2 Uniswap v4 Mixed Fee Hook

This repository contains the exact Solidity source units and pinned build
configuration for the Stars Arena V2 post-bond fee hook deployed on Robinhood
Chain. The previous V1 hook package is preserved under
[`ArenaV1Hook/`](./ArenaV1Hook/README.md).

The V2 hook is a direct, non-proxy deployment. It keeps dividends denominated
in each launch's configured base/reward token while charging creator, protocol,
and referral fees in the swap's unspecified currency. For exact-input swaps,
the unspecified currency is the output token. For exact-output swaps, it is
the input token.

> This source disclosure is not an audit report and should not be interpreted
> as one.

## Production deployment

| Item | Value |
| --- | --- |
| Network | Robinhood Chain |
| Chain ID | `4663` |
| Hook | `0xa4555952075BDFD473521f3d754d13442EE3e0Cc` |
| Hook factory | `0xd5bF02bfc316A5f4Ef000140E8067bAc98Bb24dC` |
| Dividend fee helper | `0xB28DD2fC871BA2960a4c84b81a13Facca87051bB` |
| Owner | `0x4D8E431f3d93B57E3CDd3FA9cc4e6D248678933B` |
| Referral registry | `0xE526e9f9860EeAD6f59BAA0913B7c624Ea0d29c4` |
| Protocol recipient | `0x5Ab2d4181aaE405Cf12DA8E6a0b7596c252F7679` |
| Uniswap v4 PoolManager | `0x8366a39CC670B4001A1121B8F6A443A643e40951` |

The hook deployment transaction is
[`0xa873ef6a713bae3cb433dcc90d9ab0a2c7ded73e5a45447267ed9f3e1bcdc348`](https://robinhoodchain.blockscout.com/tx/0xa873ef6a713bae3cb433dcc90d9ab0a2c7ded73e5a45447267ed9f3e1bcdc348).
The fee-helper deployment transaction is
[`0xa54878e53d51eec1ee3cfcc2cbb4f9de3e3a245a8c6ee90a83e9348315589c4e`](https://robinhoodchain.blockscout.com/tx/0xa54878e53d51eec1ee3cfcc2cbb4f9de3e3a245a8c6ee90a83e9348315589c4e).

On-chain runtime and configuration readback passed at block `57,088,277`.
Explorer source verification is still pending. The complete deployment record
is in
[`contractsV2/deployments/robinhood.v2.production.hook.json`](./contractsV2/deployments/robinhood.v2.production.hook.json).

No production V2 pool deployer is authorized yet, so the hook is deployed but
is not attached to an active production V2 launch pool. Existing V1 pools keep
their original hook permanently through their Uniswap v4 `PoolKey`.

## Fee behavior

The mixed hook has two coordinated fee paths:

1. `DividendFeeTaken` charges the configured dividend percentage in the
   launch's base/reward token and deposits it into that token's dividend
   controller.
2. `UnspecifiedFeesTaken` charges creator, protocol, and referral fees in the
   swap's unspecified currency, matching the V1 execution model for those fee
   components.

When the base/reward token is itself the unspecified currency, all applicable
fees are settled together after the swap. Otherwise, the dividend is settled
before the swap and the remaining fees are settled after it.

The production fee helper currently has:

| Setting | Value |
| --- | --- |
| Protocol fee | `2,500 ppm` (`0.25%`) |
| Referral allocation | `0 ppm` (`0%`) |
| Maximum dividend fee | `50,000 ppm` (`5%`) |
| Maximum creator fee | `10,000 ppm` (`1%`) |
| Maximum protocol fee | `10,000 ppm` (`1%`) |
| Helper maximum total fee | `70,000 ppm` (`7%`) |
| Hook hard cap | `99,000 ppm` (`9.9%`) |

Referral fees are carved out of the protocol fee rather than added on top.

## Hook permissions

The hook address encodes permission mask `0x20cc`:

| Permission | Enabled | Purpose |
| --- | --- | --- |
| `beforeInitialize` | Yes | Restricts pool initialization to an authorized deployer |
| `beforeSwap` | Yes | Collects base-token dividends when the base token is specified |
| `beforeSwapReturnDelta` | Yes | Returns the before-swap dividend delta |
| `afterSwap` | Yes | Collects unspecified-currency fees |
| `afterSwapReturnDelta` | Yes | Returns the after-swap fee delta |
| All other hook permissions | No | Not implemented |

Because the hook uses return-delta permissions, the hook address itself must be
reviewed for Uniswap Labs routing.

## Administration

The hook and fee helper are non-upgradeable contracts with configurable
administrative state:

- The hook owner can replace `dividendFeeHelper`.
- The hook owner can authorize or revoke pool deployers.
- The helper owner can update protocol and referral settings within bounds.
- Authorized fee setters initialize pool fee configurations.
- Creators can reduce, but never increase, their own creator fee and can change
  its recipient.
- Authorized administration can update creator data and the dividend
  controller for an initialized pool.

## Reproducible build

Requirements:

- Node.js 22
- pnpm 9

Compile from the repository root:

```bash
pnpm install --frozen-lockfile
pnpm compile
```

The pinned production compiler configuration is:

| Build setting | Value |
| --- | --- |
| Solidity | `0.8.30+commit.73712a01` |
| Optimizer | Enabled |
| Optimizer runs | `200` |
| EVM version | `cancun` |
| IR pipeline | Enabled (`viaIR: true`) |
| OpenZeppelin Contracts | `5.0.0` |
| Uniswap v4 Core | `1.0.2` |
| Uniswap v4 Periphery | `1.0.3` |

`package.json` and `pnpm-lock.yaml` remain unchanged from the dependency-pinned
hook repository. Source paths mirror the production compiler input so source
unit names and metadata remain reproducible.

## Source layout

```text
contractsV2/contracts/robinhood/
|-- RobinhoodMixedFeeHook.sol
|-- RobinhoodMixedFeeHookFactory.sol
|-- RobinhoodDividendFeeHelper.sol
`-- interfaces/
    |-- IRobinhoodDividendController.sol
    `-- IRobinhoodDividendFeeHelper.sol

contracts/contracts/robinhood/libraries/
`-- RobinhoodCurrencySettler.sol

ArenaV1Hook/
`-- archived V1 source-disclosure package
```
