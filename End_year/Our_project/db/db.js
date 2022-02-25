const api = require('./../api/api')
const sqlite3 = require('sqlite3').verbose()

const db = new sqlite3.Database('./easy-catalogue.db')

function insertProductToDB (brand, productCode) {
  api.getProduct(brand, productCode).then((productObject) => {
    console.log(productObject)
  })
}

insertProductToDB('hp', '259J1EA#ABB')

db.close()
