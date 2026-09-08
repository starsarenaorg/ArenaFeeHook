# RobinhoodMixedFeeHook

**Chain**

Robinhood Chain (`4663`)

**Hook Address**

[`0xa4555952075BDFD473521f3d754d13442EE3e0Cc`](https://robinhoodchain.blockscout.com/address/0xa4555952075BDFD473521f3d754d13442EE3e0Cc)

**Hook Name**

`RobinhoodMixedFeeHook`

**Description**

`RobinhoodMixedFeeHook` is Stars Arena's V2 post-bond Uniswap v4 hook on
Robinhood Chain. It deposits dividend fees in each launch pool's configured
base/reward token. Creator, protocol, and optional referral fees are charged in
the swap's unspecified currency, preserving the V1 fee-side behavior for those
components.

The production helper currently configures a `0.25%` protocol fee and `0%`
referral allocation. Pool-specific dividend and creator rates are initialized
when a V2 pool is created. The helper caps dividends at `5%`, creator fees at
`1%`, protocol fees at `1%`, and their combined total at `7%`. The hook also
enforces an independent hard ceiling of `9.9%`.

**Hook Permissions**

- `beforeInitialize`
- `beforeSwap`
- `beforeSwapReturnDelta`
- `afterSwap`
- `afterSwapReturnDelta`

The hook address encodes permission mask `0x20cc` and uses return deltas for
both fee paths.

**CREATE2 Deployer / Hook Factory**

[`0xd5bF02bfc316A5f4Ef000140E8067bAc98Bb24dC`](https://robinhoodchain.blockscout.com/address/0xd5bF02bfc316A5f4Ef000140E8067bAc98Bb24dC)

**Dividend Fee Helper**

[`0xB28DD2fC871BA2960a4c84b81a13Facca87051bB`](https://robinhoodchain.blockscout.com/address/0xB28DD2fC871BA2960a4c84b81a13Facca87051bB)

**Uniswap v4 PoolManager**

[`0x8366a39CC670B4001A1121B8F6A443A643e40951`](https://robinhoodchain.blockscout.com/address/0x8366a39CC670B4001A1121B8F6A443A643e40951)

**Production readiness**

The deployment and on-chain readback are complete. No production V2 pool
deployer is authorized yet, so there is not yet a representative production V2
pool. Existing V1 pools continue using the archived V1 hook at
`0x99d4C5Cf21d8F00b627AFe2Bf1eE2840f886e044`.

**Source Code**

https://github.com/starsarenaorg/ArenaFeeHook

**Verification**

On-chain runtime and constructor/configuration readback passed. Explorer source
verification is pending and should not be described as an independent audit.

**Upgradeability and Administrative Configuration**

The hook bytecode is non-upgradeable and is not a proxy. The hook owner can
replace the dividend fee helper and manage authorized pool deployers. The fee
helper is also non-upgradeable; its owner can manage protocol/referral settings,
fee setters, creator administration, and pool dividend-controller addresses
within the contract's bounds.

**Audit URL**

No independent audit has been completed.
