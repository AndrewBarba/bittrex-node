const should = require('should')
const Bittrex = require('../src')
const client = new Bittrex({
  apiKey: process.env.API_KEY,
  apiSecret: process.env.API_SECRET
})

describe('bittrex-node', () => {

  it('should get ticker', async () => {
    let { Bid, Ask, Last } = await client.ticker('BTC-XLM')
    should.exist(Bid)
    should.exist(Ask)
    should.exist(Last)
    Bid.should.be.above(0)
    Ask.should.be.above(0)
    Last.should.be.above(0)
  })

  it('should list orders', async () => {
    let orders = await client.orderHistory('BTC-XLM')
    should.exist(orders)
  })
})
