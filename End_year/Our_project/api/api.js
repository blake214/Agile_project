const https = require('https')

/**
 * Constructs a Product object that can be later inserted into the DB, from the raw response JSON
 * @param   {Object}  responseData The raw response data object as returned in apiRequest Promise
 * @param   {String } productCode  The product code passed to apiRequest, so as to embed it within the Product object
 * @returns {Object}               Product object with respective keys pertaining to `project` table fields in the DB
 */
function constructProductDataObject (responseData, productCode) {
  const product = {
    product_code: productCode,
    product_name: responseData.data.GeneralInfo.Title,
    product_description_short: responseData.data.GeneralInfo.Description.MiddleDesc,
    product_description_long: responseData.data.GeneralInfo.Description.LongDesc,
    product_img_urls: JSON.stringify(responseData.data.Gallery.map((element, index) => ({ ['img_' + index]: element.Pic }))),
    product_category: responseData.data.GeneralInfo.Category.Name.Value,
    product_brand: responseData.data.GeneralInfo.Brand,
    product_specs: {} // populated in the following for loop for readability's sake
  }
  for (const group of responseData.data.FeaturesGroups) {
    for (const feature of group.Features) {
      product.product_specs[feature.Feature.Name.Value] = feature.Value
    }
  }
  product.product_specs = JSON.stringify(product.product_specs)
  // for debugging purposes
  // console.log(product)
  return product
}

/**
 * Makes the API request to Icecat API, to obtain the respective product pertaining to the given brand and code
 * @param   {String} brand       Icecat Product brand (e.g. 'hp')
 * @param   {String} productCode Icecat Product code (e.g. '259J1EA#ABB')
 * @returns {Promise<unknown>}   Promise of API Response (if no errors occured)
 */
function apiRequest (brand, productCode) {
  return new Promise((resolve, reject) => {
    // store API variables here
    const options = {
      hostname: 'live.icecat.biz',
      method: 'GET', // populate URL query string with the respective brand and product code given from user
      path: `/api?UserName=openIcecat-live&Language=en&Brand=${brand}&ProductCode=${productCode}`
    }
    const req = https.request(options, (res) => {
      if (res.statusCode < 200 || res.statusCode >= 300) {
        return reject(new Error('statusCode=' + res.statusCode))
      }
      let body = [] // store response buffer chunks for later concatenation

      // handle response data
      res.on('data', chunk => {
        body.push(chunk)
      })
      res.on('end', () => {
        try {
          body = JSON.parse(Buffer.concat(body).toString())
          // for debugging purposes
          // const headerDate = res.headers && res.headers.date ? res.headers.date : 'no response date'
          // console.log('Status Code:', res.statusCode)
          // console.log('Date in Response header:', headerDate)
          // console.log('Response: ')
          // console.log(response)
        } catch (e) {
          reject(e)
        }
        resolve(body)
      })
    })
    req.on('error', (e) => {
      reject(e.message)
    })
    // send the request
    req.end()
  })
}

/**
 * Utility function to chain the process of making an Icecat API request and constructing a Product object from it
 * @param   {String} brand       refer to `apiRequest` docstring
 * @param   {String} productCode refer to `apiRequest` function docstring
 * @returns {Promise<Object>}    refer to `constructProductDataObject` function docstring
 */
function getProduct (brand, productCode) {
  return apiRequest(brand, productCode).then((data) => {
    return constructProductDataObject(data, productCode)
  })
}

// Export the utility function getProduct for usage in outside modules (e.g. use it in the context of DB functions)
module.exports = { getProduct }
