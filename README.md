# bittrex-node

[![wercker status](https://app.wercker.com/status/feb7e7d87d5a4a29ea9c04b4a1350a44/s/master "wercker status")](https://app.wercker.com/project/byKey/feb7e7d87d5a4a29ea9c04b4a1350a44)

A full-featured Bittrex API client for Node.js

- [x] Supports all documented v1.1 endpoints
- [x] 100% unit-test coverage
- [x] Heavily documented
- [x] Promise based with async/await

If you're using the Bittrex REST API, I can assure you this is the only library worth using. Here's why:

- It doesn't make you parse the Bittrex response and look for errors
- It properly parses all timestamps to JavaScript Date objects
- It uses proper JavaScript and Node conventions
- It throws proper errors when parameters are missing
- It uses a single https client with Keep-Alive enabled
- It's faster than every other node Bittrex library

## Initialize Client

```javascript
const { BittrexClient } = require('bittrex-node')

let client = new BittrexClient({
  apiKey: '12345',
  apiSecret: 'abcde'
})
```

## Public Methods

```javascript
await client.markets()
await client.currencies()
await client.ticket('BTC-ETH')
await client.marketSummaries()
await client.marketSummary('BTC-ETH')
await client.marketHistory('BTC-ETH')
await client.orderBook('BTC-ETH', { type: 'both' })
```

## Market Methods

```javascript
await client.buyLimit('BTC-ETH', { quantity: 2.1, price: 0.1 })
await client.sellLimit('BTC-ETH', { quantity: 2.1, price: 0.1 })
await client.cancelOrder('1234-5678')
await client.openOrders('BTC-ETH')
```

## Account Methods

```javascript
await client.balances()
await client.balance('BTC')
await client.depositAddress('BTC')
await client.withdraw('BTC', { quantity: 1.2, address: 'abcde' })
await client.orderHistory('BTC-ETH')
await client.withdrawalHistory('BTC')
await client.depositHistory('BTC')
```
