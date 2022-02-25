const https = require('https')

// store constant API variables here
const options = {
  hostname: 'live.icecat.biz',
  method: 'GET'
}

function apiRequest (brand, productCode) {
  // populate URL query string with the respective brand and product code given from user
  options.path = `/api?UserName=openIcecat-live&Language=en&Brand=${brand}&ProductCode=${productCode}`
  // make the request with a callback
  https.get(options, res => {
    const chunks = [] // store response buffer chunks for later concatenation
    const headerDate = res.headers && res.headers.date ? res.headers.date : 'no response date'
    console.log('Status Code:', res.statusCode)
    console.log('Date in Response header:', headerDate)

    // handle response data
    res.on('data', chunk => {
      chunks.push(chunk)
    })

    res.on('end', () => {
      console.log('Response: ')
      const data = JSON.parse(Buffer.concat(chunks).toString())

      console.log(data)
    })
  }).on('error', err => {
    console.log('Error: ', err.message)
  })
}

apiRequest('hp', '259J1EA#ABB')
