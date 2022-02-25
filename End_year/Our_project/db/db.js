const api = require('./../api/api')
const sqlite3 = require('sqlite3').verbose()
const DBPath = './easy-catalogue.db'

function insertProductToDB (brand, productCode) {
  const db = new sqlite3.Database(DBPath)
  const getFieldsSqlQuery = 'SELECT DISTINCT name FROM pragma_table_info(\'products\') AS productsTblInfo;'
  let productFields
  db.all(getFieldsSqlQuery, [], function (err, rows) {
    if (err) {
      throw err
    } else {
      productFields = rows.map(row => row.name)
    }
    api.getProduct(brand, productCode).then((productObject) => {
      const productData = productFields.map(field => productObject[field])
      const insertProductSql = `INSERT INTO products (${productFields.join(', ')}) VALUES (${productFields.map(_ => '?').join(',')})`
      db.run(insertProductSql, productData, function (err) {
        if (err) {
          console.log(err.message)
        } else {
          console.log(`insertProductToDB :: Rows affected: ${this.changes}`)
        }
        db.close()
      })
    })
  })
}

insertProductToDB('hp', '259J1EA#ABB')
