const https = require('https')

// store constant API variables here
const options = {
  hostname: 'live.icecat.biz',
  method: 'GET'
}

function constructProductDataObject (responseData) {
  return {}
}

function apiRequest (brand, productCode) {
  // populate URL query string with the respective brand and product code given from user
  options.path = `/api?UserName=openIcecat-live&Language=en&Brand=${brand}&ProductCode=${productCode}`
  let response
  // make the request with a callback
  https.get(options, res => {
    const data = [] // store response buffer chunks for later concatenation
    const headerDate = res.headers && res.headers.date ? res.headers.date : 'no response date'
    console.log('Status Code:', res.statusCode)
    console.log('Date in Response header:', headerDate)

    // handle response data
    res.on('data', chunk => {
      data.push(chunk)
    })

    res.on('end', () => {
      console.log('Response: ')
      response = JSON.parse(Buffer.concat(data).toString())

      // for debug purposes
      // console.log(response)
    })
  }).on('error', err => {
    console.log('Error: ', err.message)
  })
  return response
}

const response = apiRequest('hp', '259J1EA#ABB')
constructProductDataObject(response)
