# RobinhoodArenaFeeHook

**Chain**

Robinhood Chain (`4663`)

**Hook Address**

[`0x99d4C5Cf21d8F00b627AFe2Bf1eE2840f886e044`](https://robinhoodchain.blockscout.com/address/0x99d4C5Cf21d8F00b627AFe2Bf1eE2840f886e044?tab=contract)

**Hook Name**

`RobinhoodArenaFeeHook`

**Description**

`RobinhoodArenaFeeHook` is Stars Arena's post-bond Uniswap v4 fee hook on
Robinhood Chain. It charges a configured fee after each swap and distributes it
to the protocol, creator, and optional referral recipients. It also restricts
pool initialization to approved deployers but does not restrict later liquidity
operations.

Standard graduated launch pools currently charge a `0.25%` protocol fee plus a
`0.25%` creator fee, for a total `0.50%` hook fee. Referral allocation is
currently `0%` and, if enabled, is carved out of the protocol share rather than
added on top. The representative ETH/ARENA pool currently has only the `0.25%`
protocol hook fee. Hook fees are separate from the pool's `0.25%` Uniswap LP
fee.

**Hook Permissions**

- `beforeInitialize`
- `afterSwap`
- `afterSwapReturnDelta`

The hook address encodes permission mask `0x2044`. It uses a return-delta flag
for post-swap fee accounting and therefore requires manual review for Uniswap
Labs routing.

**CREATE2 Deployer / Hook Factory**

[`0x4e8005ce21b857200B4E581F247E76765249143A`](https://robinhoodchain.blockscout.com/address/0x4e8005ce21b857200B4E581F247E76765249143A?tab=contract)

**Fee Helper**

[`0xab56cD18f3200Fb82BFE79bEFc2D8FE19528E950`](https://robinhoodchain.blockscout.com/address/0xab56cD18f3200Fb82BFE79bEFc2D8FE19528E950?tab=contract)

**Authorized Pool Deployer**

[`0x20E399396F031a26374aAD956AA8D7Fb241d6852`](https://robinhoodchain.blockscout.com/address/0x20E399396F031a26374aAD956AA8D7Fb241d6852?tab=contract)

**Representative Pool ID**

`0x8569088057ce32491e853c0a15d1e994f5577d2e6e32eec12b8b5e1fe8dabb8f`

This is the native ETH/ARENA Uniswap v4 pool on Robinhood Chain.

**Source Code**

https://github.com/starsarenaorg/ArenaFeeHook

**Verification**

The hook, hook factory, fee helper, authorized pool deployer, and referral
registry are fully source-verified on Robinhood Chain Blockscout. The production
hook is a direct, non-proxy deployment. A reproducible local build matches the
deployed runtime bytecode after applying its constructor-set `PoolManager`
immutable.

**Upgradeability and Administrative Configuration**

The hook bytecode is non-upgradeable and the deployment is not a proxy. The
hook owner can change the fee-helper address and the authorized pool deployers.
The fee-helper owner can change fee rates and recipients subject to the helper's
current onchain bounds.

**Audit URL**

No independent audit has been completed. Source verification and reproducible
bytecode matching should not be interpreted as an audit.
