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

/** Below returns a promise to insert a product into the DB -> products table
 * If the product is already in, or was successfully inserted, returns a resolve
 * If the API function 'getProduct' fails it returns a reject
*/
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
        })
      },() => {reject("Product not found on api")}
      )
    })
  })
}

/** Below returns a promise to insert a product into the DB -> products catalogues*/
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

/** Below returns a promise to get the username for a userid*/
function getUserName(db, dataset){
  let sqlquery = "SELECT * FROM users WHERE id = ?";
  return new Promise ((resolve,reject)=>{
      db.get(sqlquery, dataset , (err, result) => {
        if (err) reject("error");
        else resolve(result['username']);
      })
  })
}

/** Below returns a promise to return a users details*/
function getUserDetails(db, dataset){
  let sqlquery = "SELECT * FROM user_details WHERE id = ?";
  return new Promise ((resolve,reject)=>{
      db.get(sqlquery, dataset , (err, result) => {
        if (err) reject("error");
        let user_details_a = {
          company_name_short: null,
          company_name_long: null,
          phone_number: null,
          address: null,
          color_1: null,
          color_2: null,
          test: null,
          logo_url: null
        }
      // else we parse the details
      if(result) user_details_a = result;
      resolve(user_details_a);
    })
  })
}
/** Below returns a promise to return a users details*/
function getUserProducts(db, dataset){
  let sqlquery = "SELECT products.product_id, products.product_name, products.product_code FROM catalogues JOIN users ON catalogues.user_id = users.id JOIN products ON catalogues.product_code = products.product_code WHERE users.id == ?";
  return new Promise ((resolve,reject)=>{
      db.all(sqlquery, dataset , (err, result) => {
        if (err) reject("error");
        else resolve(result);
      })
  })
}

module.exports = { insertProductToDB, insertProductToCatalogue, getUserName, getUserDetails, getUserProducts }