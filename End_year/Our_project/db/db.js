const api = require('./../api/api')
const sqlite3 = require('sqlite3').verbose()

const db = new sqlite3.Database('./easy-catalogue.db')

function insertProductToDB (brand, productCode) {
  api.getProduct(brand, productCode).then((productObject) => {
    console.log(productObject)
    const productFields = [
      'product_code',
      'product_name',
      'product_description_short',
      'product_description_long',
      'product_img_urls',
      'product_category',
      'product_brand',
      'product_specs'
    ]
    const data = productFields.map(field => productObject[field])
    db.run(`INSERT INTO products (${productFields.join(', ')}) VALUES (${productFields.map(_ => '?').join(',')})`, data, function (err) {

    })
  })
}

insertProductToDB('hp', '259J1EA#ABB')

db.close()
