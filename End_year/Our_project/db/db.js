/** Below returns a promise to insert a product into the DB -> products table
 * If the product is already in, or was successfully inserted, returns a resolve
 * If the API function 'getProduct' fails it returns a reject
*/
function insertProductToDB (brand, productCode, db) {
  return new Promise ((resolve,reject)=>{
    const getFieldsSqlQuery = 'SELECT DISTINCT name FROM pragma_table_info(\'products\') AS productsTblInfo;'
    let productFields
    db.all(getFieldsSqlQuery, [], function (err, rows) {
      if (err) reject("Error : insertProductToDB") ;
      else productFields = rows.map(row => row.name);
      api.getProduct(brand, productCode).then((productObject) => {
        const productData = productFields.map(field => productObject[field])
        const insertProductSql = `INSERT INTO products (${productFields.join(', ')}) VALUES (${productFields.map(_ => '?').join(',')})`
        db.run(insertProductSql, productData, function (err) {
          if (err) resolve("Product already exists in products"); 
          else resolve("Added to products");
        })
      },() => {reject("Product not found on api")}
      )
    })
  })
}

/** Below returns a promise to insert a product into the DB -> products catalogues*/
function insertProductToCatalogue(db, dataset){
  let sqlquery = "INSERT INTO catalogues (user_id, product_code)VALUES(?,?)";
  // Here we loading the products to our db -> products table
  return new Promise ((resolve,reject)=>{
      db.run(sqlquery, dataset , (err, result) => {
          if (err) reject("Already added to catalogue");
          else resolve("Added to catalogue");
      })
  })
}

/** Below returns a promise to get the username for a userid*/
function getUserName(db, dataset){
  let sqlquery = "SELECT * FROM users WHERE id = ?";
  return new Promise ((resolve,reject)=>{
      db.get(sqlquery, dataset , (err, result) => {
        if (err) reject("Error : getUserName");
        else resolve(result['username']);
      })
  })
}

/** Below returns a promise to return a users details*/
function getUserDetails(db, dataset){
  let sqlquery = "SELECT * FROM user_details WHERE id = ?";
  return new Promise ((resolve,reject)=>{
      db.get(sqlquery, dataset , (err, result) => {
        if (err) reject("Error : getUserDetails");
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
        if (err) reject("Error : getUserProducts");
        else resolve(result);
      })
  })
}

/** Below returns a promise to return product details*/
function getProduct(db, dataset){
  let sqlquery = "SELECT * FROM products WHERE product_id = ?";
  return new Promise ((resolve,reject)=>{
      db.get(sqlquery, dataset , (err, result) => {
        if (err) reject("Error : getProduct");
        else resolve(result);
      })
  })
}

/** Below returns a promise to check credentials, resolves if there a match*/
function checkCredentials(db, dataset){
  let sqlquery = "SELECT EXISTS(SELECT * FROM users WHERE username = ? AND password = ?)";
  return new Promise ((resolve,reject)=>{
      db.get(sqlquery, dataset , (err, result) => {
        if (err) reject("Error : checkCredentials");
        // If there is a match
        if(Object.values(result)[0]){
          resolve("Success : match found");
        }
        else reject("Error : no match");
      })
  })
}

/** Below returns a promise to return a user id*/
function getUserId(db, dataset){
  let sqlquery = "SELECT * FROM users WHERE username = ?";
  return new Promise ((resolve,reject)=>{
      db.get(sqlquery, dataset , (err, result) => {
        if (err) reject("Error : getUserId");
        else resolve(result['id']);
      })
  })
}

/** Below returns a promise to check if a username exists already*/
function userExists(db, dataset){
  let sqlquery = "SELECT EXISTS(SELECT * FROM users WHERE username = ?)";
  return new Promise ((resolve,reject)=>{
      db.get(sqlquery, dataset , (err, result) => {
        if (err) reject("Error : userExists");
        // If there is a match
        if(!Object.values(result)[0]){
          resolve("Success : No match");
        } else {
          reject("Error : user already exists")
        }
      })
  })
}

/** Below returns a promise to create a user account*/
function createUser(db, dataset){
  let sqlquery = "INSERT INTO users (username, password)VALUES(?,?)";
  return new Promise ((resolve,reject)=>{
      db.run(sqlquery, dataset , (err, result) => {
        if (err) reject("Error : createUser");
        else resolve("Success : user added");
      })
  })
}

/** Below returns a promise to create a user account details*/
function createUserDetails(db, dataset){
  let sqlquery = "INSERT INTO user_details (id)VALUES(?)";
  return new Promise ((resolve,reject)=>{
      db.run(sqlquery, dataset , (err, result) => {
        if (err) reject("Error : createUserDetails");
        else resolve("Success : user added details");
      })
  })
}

/** Below returns a promise update the users details*/
function updateUserDetails(db, dataset, sqlQuery_concatenation){
  let sqlquery = "UPDATE user_details SET "+ sqlQuery_concatenation +" WHERE id == ?";
  return new Promise ((resolve,reject)=>{
      db.run(sqlquery, dataset , (err, result) => {
        if (err) reject("Error : updateUserDetails");
        else resolve("Success : details updated");
      })
  })
}

/** Below returns a promise to delete a product from user catalogue*/
function deleteProductCatalogue(db, dataset){
  let sqlquery = "DELETE FROM catalogues WHERE user_id = ? AND product_code = ?";
  return new Promise ((resolve,reject)=>{
      db.run(sqlquery, dataset , (err, result) => {
        if (err) reject("Error : product NOT deleted");
        else resolve("Success : product deleted");
      })
  })
}

module.exports = { insertProductToDB, 
  insertProductToCatalogue, 
  getUserName, 
  getUserDetails, 
  getUserProducts, 
  getProduct, 
  checkCredentials,
  getUserId,
  userExists, 
  createUser, 
  createUserDetails, 
  updateUserDetails, 
  deleteProductCatalogue}