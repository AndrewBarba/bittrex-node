const axios = require('axios')
const crypto = require('crypto')
const https = require('https')
const querystring = require('querystring')

class BittrexApi {

  /**
   * @constructor
   * @param {String} options.apiKey
   * @param {String} options.apiSecret
   */
  constructor({ apiKey, apiSecret } = {}) {
    this._apiKey = apiKey || null
    this._apiSecret = apiSecret || null
    this._nonce = Date.now()
    this._client = axios.create({
      baseURL: 'https://bittrex.com/api/v1.1',
      httpsAgent: new https.Agent({ keepAlive: true })
    })
  }

  /*-------------------------------------------------------------------------*
   * Public
   *-------------------------------------------------------------------------*/

  /**
   * @method markets
   * @return {Promise}
   */
  async markets() {
    return this.request('get', '/public/getmarkets')
  }

  /**
   * @method currencies
   * @return {Promise}
   */
  async currencies() {
    return this.request('get', '/public/getcurrencies')
  }

  /**
   * @method ticker
   * @param {String} market
   * @return {Promise}
   */
  async ticker(market) {
    if (!market) throw new Error('market is required')
    let params = { market }
    return this.request('get', '/public/getticker', { params })
  }

  /**
   * @method marketSummaries
   * @return {Promise}
   */
  async marketSummaries() {
    return this.request('get', '/public/getmarketsummaries')
  }

  /**
   * @method marketSummary
   * @param {String} market
   * @return {Promise}
   */
  async marketSummary(market) {
    if (!market) throw new Error('market is required')
    let params = { market }
    return this.request('get', '/public/getmarketsummary', { params })
  }

  /**
   * @method marketHistory
   * @param {String} market
   * @return {Promise}
   */
  async marketHistory(market) {
    if (!market) throw new Error('market is required')
    let params = { market }
    return this.request('get', '/public/getmarkethistory', { params })
  }

  /**
   * @method orderBook
   * @param {String} market
   * @param {String} type
   * @return {Promise}
   */
  async orderBook(market, { type = 'both' } = {}) {
    if (!market) throw new Error('market is required')
    if (!type) throw new Error('options.type is required')
    let params = { market, type }
    return this.request('get', '/public/getorderbook', { params })
  }

  /*-------------------------------------------------------------------------*
   * Market
   *-------------------------------------------------------------------------*/

  /**
   * @method buy
   * @param {String} market
   * @param {String|Number} options.quantity
   * @param {String|Number} options.price
   * @return {Promise}
   */
  async buyLimit(market, { quantity, price } = {}) {
    if (!market) throw new Error('market is required')
    if (!quantity) throw new Error('options.quantity is required')
    if (!price) throw new Error('options.price is required')
    let params = {
      market,
      quantity: parseFloat(quantity).toFixed(8),
      price : parseFloat(price).toFixed(8)
    }
    return this.request('get', '/market/buylimit', { params })
  }

  /**
   * @method sellLimit
   * @param {String} market
   * @param {String|Number} options.quantity
   * @param {String|Number} options.price
   * @return {Promise}
   */
  async sellLimit(market, { quantity, price } = {}) {
    if (!market) throw new Error('market is required')
    if (!quantity) throw new Error('options.quantity is required')
    if (!price) throw new Error('options.price is required')
    let params = {
      market,
      quantity: parseFloat(quantity).toFixed(8),
      price : parseFloat(price).toFixed(8)
    }
    return this.request('get', '/market/selllimit', { params })
  }

  /**
   * @method cancelOrder
   * @param {String} uuid
   * @return {Promise}
   */
  async cancelOrder(uuid) {
    if (!uuid) throw new Error('uuid is required')
    let params = { uuid }
    return this.request('get', '/market/cancel', { params })
  }

  /**
   * @method openOrders
   * @param {String} market
   * @return {Promise}
   */
  async openOrders(market) {
    if (!market) throw new Error('market is required')
    let params = { market }
    return this.request('get', '/public/getopenorders', { params })
  }

  /*-------------------------------------------------------------------------*
   * Account
   *-------------------------------------------------------------------------*/

  /**
   * @method balances
   * @return {Promise}
   */
  async balances() {
    return this.request('get', '/account/getbalances')
  }

  /**
   * @method balances
   * @param {String} currency
   * @return {Promise}
   */
  async balance(currency) {
    if (!currency) throw new Error('currency is required')
    let params = { currency }
    return this.request('get', '/account/getbalance', { params })
  }

  /**
   * @method depositAddress
   * @param {String} currency
   * @return {Promise}
   */
  async depositAddress(currency) {
    if (!currency) throw new Error('currency is required')
    let params = { currency }
    return this.request('get', '/account/getdepositaddress', { params })
  }

  /**
   * @method withdraw
   * @param {String} currency
   * @param {String|Number} options.quantity
   * @param {String} options.address
   * @param {String} [options.paymentid]
   * @return {Promise}
   */
  async withdraw(currency, { quantity, address, paymentid } = {}) {
    if (!currency) throw new Error('currency is required')
    if (!quantity) throw new Error('options.quantity is required')
    if (!address) throw new Error('options.address is required')
    let params = { currency, quantity, address, paymentid }
    return this.request('get', '/account/getdepositaddress', { params })
  }

  /**
   * @method orderHistory
   * @param {String} market
   * @return {Promise}
   */
  async orderHistory(market) {
    if (!market) throw new Error('market is required')
    let params = { market }
    let orders = await this.request('get', '/account/getorderhistory', { params })
    for (let order of orders) {
      order.TimeStamp = new Date(`${order.TimeStamp}Z`)
      order.Closed = new Date(`${order.Closed}Z`)
    }
    return orders
  }

  /**
   * @method withdrawalHistory
   * @param {String} [currency]
   * @return {Promise}
   */
  async withdrawalHistory(currency) {
    let params = { currency }
    return this.request('get', '/account/getwithdrawalhistory', { params })
  }

  /**
   * @method depositHistory
   * @param {String} [currency]
   * @return {Promise}
   */
  async depositHistory(currency) {
    let params = { currency }
    return this.request('get', '/account/getdeposithistory', { params })
  }

  /*-------------------------------------------------------------------------*
   * Private
   *-------------------------------------------------------------------------*/

  /**
   * @private
   * @method request
   * @param {String} method
   * @param {String} url
   * @param {Object} [options.data]
   * @param {Object} [options.params]
   */
  async request(method, url, { headers = {}, params = {}, data = null } = {}) {
    if (this._apiKey) {
      params.nonce = ++this._nonce
      params.apikey = this._apiKey
      headers.apisign = this.requestSignature(url, params)
    }

    let res = await this._client.request({
      method,
      url,
      headers,
      data,
      params
    })

    if (res.data && res.data.success) {
      return res.data.result
    }

    throw new Error(res.data.message)
  }

  /**
   * @private
   * @method requestSignature
   * @param {String} url
   * @return {String}
   */
  requestSignature(path, params) {
    let query = querystring.stringify(params)
    let url = `${this._client.defaults.baseURL}${path}?${query}`
    let hmac = crypto.createHmac('sha512', this._apiSecret)
    return hmac.update(url).digest('hex')
  }
}

module.exports = BittrexApi
