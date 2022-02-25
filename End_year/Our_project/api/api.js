const https = require('https')

const options = {
  hostname: 'live.icecat.biz',
  method: 'GET'
}

function apiRequest (brand, productCode) {
  options.path = `/api?UserName=openIcecat-live&Language=en&Brand=${brand}&ProductCode=${productCode}`
  https.get(options, res => {
    const chunks = []
    const headerDate = res.headers && res.headers.date ? res.headers.date : 'no response date'
    console.log('Status Code:', res.statusCode)
    console.log('Date in Response header:', headerDate)

    res.on('data', chunk => {
      chunks.push(chunk)
    })

    res.on('end', () => {
      console.log('Response: ')
      const data = JSON.parse(Buffer.concat(chunks).toString())

      console.log(data)
      // for(user of users) {
      //   console.log(`Got user with id: ${user.id}, name: ${user.name}`);
      // }
    })
  }).on('error', err => {
    console.log('Error: ', err.message)
  })
}

apiRequest('hp', '259J1EA#ABB')
