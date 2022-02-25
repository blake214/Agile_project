const https = require('https')

// store constant API variables here
const options = {
  hostname: 'live.icecat.biz',
  method: 'GET'
}

function constructProductDataObject (responseData, productCode) {
  const product = {
    product_code: productCode,
    product_name: responseData.data.GeneralInfo.Title,
    product_description_short: responseData.data.GeneralInfo.Description.MiddleDesc,
    product_description_long: responseData.data.GeneralInfo.Description.LongDesc,
    product_img_urls: responseData.data.Gallery.map((element, index) => ({ ['img_' + index]: element.Pic })),
    product_category: responseData.data.GeneralInfo.Category.Name.Value,
    product_brand: responseData.data.GeneralInfo.Brand,
    product_specs: {}
  }
  for (const group of responseData.data.FeaturesGroups) {
    for (const feature of group.Features) {
      product.product_specs[feature.Feature.Name.Value] = feature.Value
    }
  }
  // for debugging purposes
  // console.log(product)
  return product
}

function apiRequest (brand, productCode) {
  // populate URL query string with the respective brand and product code given from user
  options.path = `/api?UserName=openIcecat-live&Language=en&Brand=${brand}&ProductCode=${productCode}`
  // make the request with a callback
  https.get(options, res => {
    const data = [] // store response buffer chunks for later concatenation

    // handle response data
    res.on('data', chunk => {
      data.push(chunk)
    })

    res.on('end', () => {
      const response = JSON.parse(Buffer.concat(data).toString())

      // for debugging purposes
      // const headerDate = res.headers && res.headers.date ? res.headers.date : 'no response date'
      // console.log('Status Code:', res.statusCode)
      // console.log('Date in Response header:', headerDate)
      // console.log('Response: ')
      // console.log(response)

      // get the relevant data from the API response to return a product object (to be inserted into the DB later)
      return constructProductDataObject(response, productCode)
    })
  }).on('error', err => {
    console.log('Error: ', err.message)
  })
}

apiRequest('hp', '259J1EA#ABB')
