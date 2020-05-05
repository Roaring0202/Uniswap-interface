import { Trade, Aggregation, ChainId, Pair, Token, TokenAmount, Price } from '../src'
import JSBI from 'jsbi'

describe.only('Aggregation', () => {
  const token0 = new Token(ChainId.MAINNET, '0x0000000000000000000000000000000000000001', 18, 't0')
  const token1 = new Token(ChainId.MAINNET, '0x0000000000000000000000000000000000000002', 18, 't1')
  const token2 = new Token(ChainId.MAINNET, '0x0000000000000000000000000000000000000003', 18, 't2')
  const token3 = new Token(ChainId.MAINNET, '0x0000000000000000000000000000000000000004', 18, 't3')

  const pair_0_1 = new Pair(new TokenAmount(token0, JSBI.BigInt(1000)), new TokenAmount(token1, JSBI.BigInt(1000)))
  const pair_0_2 = new Pair(new TokenAmount(token0, JSBI.BigInt(1000)), new TokenAmount(token2, JSBI.BigInt(1100)))
  const pair_0_3 = new Pair(new TokenAmount(token0, JSBI.BigInt(1000)), new TokenAmount(token3, JSBI.BigInt(900)))
  const pair_1_2 = new Pair(new TokenAmount(token1, JSBI.BigInt(1200)), new TokenAmount(token2, JSBI.BigInt(1000)))
  const pair_1_3 = new Pair(new TokenAmount(token1, JSBI.BigInt(1200)), new TokenAmount(token3, JSBI.BigInt(1300)))
  const pair_2_3 = new Pair(new TokenAmount(token2, JSBI.BigInt(900)), new TokenAmount(token3, JSBI.BigInt(1300)))
  const all_pairs = [pair_0_1, pair_0_2, pair_0_3, pair_1_2, pair_1_3, pair_2_3]

  it('throws on empty trades', () => {
    expect(() => new Aggregation([])).toThrow('TRADES_LENGTH')
  })

  it('throws if input tokens do not match', () => {
    const trades_0_1 = Trade.bestTradeExactIn(all_pairs, new TokenAmount(token0, JSBI.BigInt(100)), token1, {
      maxNumResults: 1
    })
    const trades_2_1 = Trade.bestTradeExactIn(all_pairs, new TokenAmount(token2, JSBI.BigInt(100)), token1, {
      maxNumResults: 1
    })
    expect(() => new Aggregation([...trades_0_1, ...trades_2_1])).toThrow('TRADES_INPUT_TOKEN')
  })

  it('throws if output tokens do not match', () => {
    const trades_0_1 = Trade.bestTradeExactIn(all_pairs, new TokenAmount(token0, JSBI.BigInt(100)), token1, {
      maxNumResults: 1
    })
    const trades_0_2 = Trade.bestTradeExactIn(all_pairs, new TokenAmount(token0, JSBI.BigInt(100)), token2, {
      maxNumResults: 1
    })
    expect(() => new Aggregation([...trades_0_1, ...trades_0_2])).toThrow('TRADES_OUTPUT_TOKEN')
  })

  it('throws if trade type do not match', () => {
    const trades_0_1_exact_in = Trade.bestTradeExactIn(all_pairs, new TokenAmount(token0, JSBI.BigInt(100)), token1, {
      maxNumResults: 1
    })
    const trades_0_1_exact_out = Trade.bestTradeExactOut(all_pairs, token0, new TokenAmount(token1, JSBI.BigInt(100)), {
      maxNumResults: 1
    })
    expect(() => new Aggregation([...trades_0_1_exact_in, ...trades_0_1_exact_out])).toThrow('TRADES_TRADE_TYPE')
  })

  it('has input amount from combined inputs', () => {
    const trades_0_1 = Trade.bestTradeExactIn(all_pairs, new TokenAmount(token0, JSBI.BigInt(100)), token1, {
      maxNumResults: 2
    })
    expect(new Aggregation(trades_0_1).inputAmount).toEqual(trades_0_1[0].inputAmount.add(trades_0_1[1].inputAmount))
  })

  it('has output amount from combined outputs', () => {
    const trades_0_1 = Trade.bestTradeExactIn(all_pairs, new TokenAmount(token0, JSBI.BigInt(100)), token1, {
      maxNumResults: 2
    })
    expect(new Aggregation(trades_0_1).outputAmount).toEqual(trades_0_1[0].outputAmount.add(trades_0_1[1].outputAmount))
  })

  it('has the correct price', () => {
    const trades_0_1 = Trade.bestTradeExactIn(all_pairs, new TokenAmount(token0, JSBI.BigInt(100)), token1, {
      maxNumResults: 2
    })
    expect(new Aggregation(trades_0_1).executionPrice).toEqual(
      new Price(token0, token1, JSBI.BigInt(200), JSBI.BigInt(214))
    )
  })
})
