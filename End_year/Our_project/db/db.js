const api = require('./../api/api')
const sqlite3 = require('sqlite3').verbose()

function insertProductToDB (brand, productCode) {
  const db = new sqlite3.Database('./easy-catalogue.db')
  api.getProduct(brand, productCode).then((productObject) => {
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
    const sql = `INSERT INTO products (${productFields.join(', ')}) VALUES (${productFields.map(_ => '?').join(',')})`
    db.run(sql, data, function (err) {
      if (err) {
        console.log(err.message)
      } else {
        console.log(`Rows affected: ${this.changes}`)
      }
      db.close()
    })
  })
}

insertProductToDB('hp', '259J1EA#ABB')
