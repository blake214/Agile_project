module.exports = function (app) {
    ////////////////////// Middleware functions
    /** Here we redirect user back to login page
     * If the user has logged in and has a session id
     */
    const redirectLogin = (req,res,next) => {
        if(!req.session.userId){
            res.redirect('/login')
        } else next();
    }
    /** Here we redirect user back to user page
     * If the user has logged in and has a session id
     */
    const redirectUser = (req,res,next) => {
        if(req.session.userId){
            res.redirect('/user')
        } else next();
    }
    ////////////////////// Middleware functions

    ////////////////////// Get Requests
    app.get("/", redirectLogin, redirectUser, function (req, res) {
    });

    app.get("/user", redirectLogin, function (req, res) {
        let dataset_1 = [req.session.userId];

        // Here we getting the username relating to the id in the databse
        dbjs.getUserName(db, dataset_1).then((result)=>{
            var objToSend = {};
            objToSend.username = result;
            // Here we getting the users details
            dbjs.getUserDetails(db, dataset_1).then((result)=>{
                objToSend.user_details = result;
                // Here we getting the users products
                dbjs.getUserProducts(db, dataset_1).then((result)=>{
                    objToSend.user_products = result;
                    objToSend.userid = req.session.userId;
                    res.render("user.html", objToSend)
                },(result)=>{console.log(result)})
            },(result)=>{console.log(result)})
        },(result)=>{console.log(result)})
    });

    app.get("/catalogue", function (req, res) {
        // Here we getting the users details
        // let dataset_2 = [req.session.userId];
        let dataset_2 = [req.query.catalogue];

        dbjs.getUserDetails(db,dataset_2).then((result)=>{
            var objToSend = {};
            objToSend.user_details = result;
            dbjs.getUserProducts(db,dataset_2).then((result)=>{
                objToSend.user_products = result;
                res.render("catalogue.html", objToSend)
            },(result)=>{console.log(result)})
        },(result)=>{console.log(result)})
    });

    app.get("/product", function (req, res) {
        let dataset = [req.query.product_id];
        dbjs.getProduct(db,dataset).then((result)=>{
            res.render("product.html", {product_details: result})
        },(result) => {console.log(result)})        
    });
    // In pipeline we calling redirectUser (basically checks if user is loged in or not)
    app.get("/login", redirectUser, function (req, res) {
        res.render("login.html")
    });
    // In pipeline we calling redirectUser (basically checks if user is loged in or not)
    app.get("/register", redirectUser, function (req, res) {
        res.render("register.html")
    });
    ////////////////////// Get Requests

    ////////////////////// Post Requests
    app.post("/login", redirectUser, function (req, res) {
        // Here we getting the data from the submitted form
        const username = req.body.username
        const password = req.body.password
        // Here we checking that stuff has been submitted
        if (username && password){
            // Should do promises in here but not too sure how, dont think a nested query is correct, this works though
            let dataset_1 = [username, password];
            let dataset_2 = [username];
            
            // Here we querying if there is a match for the username and password
            dbjs.checkCredentials(db,dataset_1).then((result)=>{
                dbjs.getUserId(db, dataset_2).then((result)=>{
                    req.session.userId = result;
                    return res.redirect('/user');
                },(result) => {console.log(result)})
            },(result) => {
                console.log(result); 
                return res.redirect('/login')})
        }
    });

    app.post("/register", redirectUser, function (req, res) {
        const username = req.body.username
        const password = req.body.password

        if (username && password){
            // Should do promises in here but not too sure how, dont think a nested query is correct, this works though
            let dataset_1 = [username];
            let dataset_2 = [username, password];

            // Here we checking if there is a user with the same username already in the database
            dbjs.userExists(db,dataset_1).then((result)=>{
                // Here we adding the user to the database
                dbjs.createUser(db,dataset_2).then((result)=>{
                    // Here we getting the users id
                    dbjs.getUserId(db, dataset_1).then((result)=>{
                        req.session.userId = result;
                        // Here we creating a details row for the user
                        dbjs.createUserDetails(db,[result]).then((result)=>{
                            return res.redirect('/user');
                        },(result) => {console.log(result)})
                    },(result) => {console.log(result)})
                },(result) => {console.log(result)})
            },(result)=>{return res.redirect('/register')})
        }
    });

    app.post("/logout", redirectLogin, function (req, res) {
        // This is a function that terminates the session
        req.session.destroy(err=>{
            // If there is a problem terminating the session then they just need to retry
            if(err) return res.redirect('/user');
            res.clearCookie(session_name)
            // Redirects back to the login page
            res.redirect('/login')
        })
    });
    app.post("/user_details", redirectLogin, function (req, res) {
        let sqlQuery_concatenation = "";
        let somethingToCchanged = false;
        /**Below we checking if feilds have been changed
         * if they changed we concatenate the change into the query string
         * as well as note these has been a change
         */
        if (req.body.phone_number) {
            if (sqlQuery_concatenation != "") sqlQuery_concatenation += ", ";
            sqlQuery_concatenation += "phone_number = '" + req.body.phone_number + "'";
            somethingToCchanged = true;
        };
        if (req.body.address) {
            if (sqlQuery_concatenation != "") sqlQuery_concatenation += ", ";
            sqlQuery_concatenation += "address = '" + req.body.address + "'";
            somethingToCchanged = true;
        };
        if (req.body.company_name_short) {
            if (sqlQuery_concatenation != "") sqlQuery_concatenation += ", ";
            sqlQuery_concatenation += "company_name_short = '" + req.body.company_name_short + "'";
            somethingToCchanged = true;
        };
        if (req.body.company_name_long) {
            if (sqlQuery_concatenation != "") sqlQuery_concatenation += ", ";
            sqlQuery_concatenation += "company_name_long = '" + req.body.company_name_long + "'";
            somethingToCchanged = true;
        };
        if (req.body.color_1) {
            if (sqlQuery_concatenation != "") sqlQuery_concatenation += ", ";
            sqlQuery_concatenation += "color_1 = '" + req.body.color_1 + "'";
            somethingToCchanged = true;
        };
        if (req.body.color_2) {
            if (sqlQuery_concatenation != "") sqlQuery_concatenation += ", ";
            sqlQuery_concatenation += "color_2 = '" + req.body.color_2 + "'";
            somethingToCchanged = true;
        };
        if (req.body.logo_url) {
            if (sqlQuery_concatenation != "") sqlQuery_concatenation += ", ";
            sqlQuery_concatenation += "logo_url = '" + req.body.logo_url + "'";
            somethingToCchanged = true;
        };

        // If there has been a change we update the database
        if (somethingToCchanged) {
            let dataset_1 = [req.session.userId];
            dbjs.updateUserDetails(db, dataset_1, sqlQuery_concatenation).then((result)=>{
                return res.redirect('/user');
            },(result) => {console.log(result)})
        } else return res.redirect('/user');
    });

    app.post("/add_product", redirectLogin, function (req, res) {
        let dataset_1 = [req.session.userId, req.body.product_code];
        // Here we loading the products to our db -> products table
        dbjs.insertProductToDB(req.body.product_brand, req.body.product_code , db)
        .then((message)=>{
            console.log(message)
            // Here we adding the product to our db -> catalogue (so adding as a product for the clients catalogue)
            dbjs.insertProductToCatalogue(db, dataset_1)
            .then((message)=>{
                console.log(message)
                return res.render("response.html", {
                    information: { redirect: "/user", message: "Success: " + message, status: "Success"}
                })
            },(message)=>{
                console.log(message)
                return res.render("response.html", {
                    information: { redirect: "/user", message: "Error: " + message, status: "Error"}
                })
            })
        },(message)=>{
            console.log(message)
            return res.render("response.html", {
                information: { redirect: "/user", message: "Error: " + message, status: "Error"}
            })
        })
    });

    app.post("/delete_product", function (req, res) {
        let dataset_1 = [req.session.userId, req.body.subject]
        dbjs.deleteProductCatalogue(db,dataset_1).then((result)=>{
            return res.render("response.html", {
                information: { redirect: "/user", message: result, status: "Success"}
            })
        },(result) => {
            return res.render("response.html", {
                information: { redirect: "/user", message: result + err, status: "Error"}
            })
        })
    });
    ////////////////////// Post Requests
}


