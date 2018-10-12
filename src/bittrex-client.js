const axios = require('axios')
const crypto = require('crypto')
const https = require('https')
const querystring = require('querystring')

class BittrexClient {

  /**
   * @constructor
   * @param {String} [options.apiKey=null]
   * @param {String} [options.apiSecret=null]
   * @param {Boolean} [options.keepAlive=true]
   */
  constructor({ apiKey = null, apiSecret = null, keepAlive = true } = {}) {
    this._apiKey = apiKey
    this._apiSecret = apiSecret
    this._nonce = Date.now()
    this._client = axios.create({
      baseURL: 'https://bittrex.com/api/v1.1',
      httpsAgent: new https.Agent({ keepAlive })
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
    let results = await this.request('get', '/public/getmarkets')
    return this.parseDates(results, ['Created'])
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
    let results = await this.request('get', '/public/getmarketsummaries')
    return this.parseDates(results, ['TimeStamp', 'Created'])
  }

  /**
   * @method marketSummary
   * @param {String} market
   * @return {Promise}
   */
  async marketSummary(market) {
    if (!market) throw new Error('market is required')
    let params = { market }
    let results = await this.request('get', '/public/getmarketsummary', { params })
    return this.parseDates(results, ['TimeStamp', 'Created'])
  }

  /**
   * @method marketHistory
   * @param {String} market
   * @return {Promise}
   */
  async marketHistory(market) {
    if (!market) throw new Error('market is required')
    let params = { market }
    let results = await this.request('get', '/public/getmarkethistory', { params })
    return this.parseDates(results, ['TimeStamp'])
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
   * @method buyLimit
   * @param {String} market
   * @param {String|Number} options.quantity
   * @param {String|Number} options.price
   * @return {Promise}
   */
  async buyLimit(market, { quantity, rate } = {}) {
    if (!market) throw new Error('market is required')
    if (!quantity) throw new Error('options.quantity is required')
    if (!rate) throw new Error('options.rate is required')
    let params = {
      market,
      quantity: parseFloat(quantity).toFixed(8),
      rate : parseFloat(rate).toFixed(8)
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
  async sellLimit(market, { quantity, rate } = {}) {
    if (!market) throw new Error('market is required')
    if (!quantity) throw new Error('options.quantity is required')
    if (!rate) throw new Error('options.rate is required')
    let params = {
      market,
      quantity: parseFloat(quantity).toFixed(8),
      rate : parseFloat(rate).toFixed(8)
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
    let results = await this.request('get', '/market/getopenorders', { params })
    return this.parseDates(results, ['Opened'])
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
   * @method balance
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
    return this.request('get', '/account/withdraw', { params })
  }

  /**
   * @method orderHistory
   * @param {String} market
   * @return {Promise}
   */
  async orderHistory(market) {
    if (!market) throw new Error('market is required')
    let params = { market }
    let results = await this.request('get', '/account/getorderhistory', { params })
    return this.parseDates(results, ['TimeStamp', 'Closed'])
  }

  /**
   * @method withdrawalHistory
   * @param {String} [currency]
   * @return {Promise}
   */
  async withdrawalHistory(currency) {
    let params = { currency }
    let results = await this.request('get', '/account/getwithdrawalhistory', { params })
    return this.parseDates(results, ['LastUpdated'])
  }

  /**
   * @method depositHistory
   * @param {String} [currency]
   * @return {Promise}
   */
  async depositHistory(currency) {
    let params = { currency }
    let results = await this.request('get', '/account/getdeposithistory', { params })
    return this.parseDates(results, ['LastUpdated'])
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
  async request(method, url, { headers = {}, params = {} } = {}) {
    params = this.sanitizeParams(params)

    if (this._apiKey) {
      params.nonce = ++this._nonce
      params.apikey = this._apiKey
      headers.apisign = this.requestSignature(url, params)
    }

    let { data } = await this._client.request({ method, url, headers, params })

    if (!data.success) {
      throw new Error(data.message)
    }

    return data.result
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

  /**
   * @private
   * @method sanitizeParams
   * @param {Object} params
   * @return {Object}
   */
  sanitizeParams(params = {}) {
    let obj = {}
    for (let key of Object.keys(params)) {
      if (params[key] === undefined) continue
      obj[key] = params[key]
    }
    return obj
  }

  /**
   * @private
   * @method parseDates
   * @param {Array<Object>} results
   * @param {Array<String>} keys
   * @return {Array<Object>}
   */
  parseDates(results, keys) {
    for (let result of results) {
      for (let key of keys) {
        result[key] = new Date(`${result[key]}Z`)
      }
    }
    return results
  }
}

module.exports = BittrexClient
