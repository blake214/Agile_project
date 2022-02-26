// const api = require('./../api/api')
// const sqlite3 = require('sqlite3').verbose()
// const DBPath = './easy-catalogue.db'

// function insertProductToDB (brand, productCode) {
//   const db = new sqlite3.Database(DBPath)
//   const getFieldsSqlQuery = 'SELECT DISTINCT name FROM pragma_table_info(\'products\') AS productsTblInfo;'
//   let productFields
//   db.all(getFieldsSqlQuery, [], function (err, rows) {
//     if (err) {
//       throw err
//     } else {
//       productFields = rows.map(row => row.name)
//     }
//     api.getProduct(brand, productCode).then((productObject) => {
//       const productData = productFields.map(field => productObject[field])
//       const insertProductSql = `INSERT INTO products (${productFields.join(', ')}) VALUES (${productFields.map(_ => '?').join(',')})`
//       db.run(insertProductSql, productData, function (err) {
//         if (err) {
//           console.log(err.message)
//         } else {
//           console.log(`insertProductToDB :: Rows affected: ${this.changes}`)
//         }
//         db.close()
//       })
//     })
//   })
// }

// insertProductToDB('hp', '259J1EA#ABB')

function insertProductToDB (brand, productCode, db) {
  return new Promise ((resolve,reject)=>{
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
            // Here we send a resolve depending if the error was that the product already added
            resolve("Product already exists in products");
          } else {
            resolve("Added to products");
          }
          // db.close()
        })
      },() => {reject("Product not found on api")}
      )
    })
  })
}

function insertProductToCatalogue(db, dataset, sqlquery){
  // Here we loading the products to our db -> products table
  return new Promise ((resolve,reject)=>{
      db.run(sqlquery, dataset , (err, result) => {
          if (err) {
              // need to resolve when product already added, and handle other errors differently
              resolve("Already added to catalogue")
          } else {
              resolve("Added to catalogue");
          }
      })
  })
}

module.exports = { insertProductToDB, insertProductToCatalogue }