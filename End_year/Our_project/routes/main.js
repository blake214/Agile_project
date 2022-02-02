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
    app.get("/", function (req, res) {
        // Here we getting the session id (will be undefind if not logged in)
        const userId = req.session.userId;
        console.log(userId);
        // Here we parsing the session id to the template page
        res.render("index.html", {userSessionId: userId});
    });
    app.get("/user", redirectLogin, function (req, res) {
        let dataset_1 = [req.session.userId];
        let sqlquery_1 = "SELECT * FROM users WHERE id = ?";
        // Here we getting the username relating to the id in the databse
        db.get(sqlquery_1, dataset_1, (err, result) => {
            if (err) return console.log("error");
            let username = result['username'];
            
            // Here we getting the users details
            let dataset_2 = [req.session.userId];
            let sqlquery_2 = "SELECT * FROM user_details WHERE id = ?";
            db.get(sqlquery_2, dataset_2, (err, result) => {
                if (err) return console.log("error");
                // If the user has no details we parse an empty object
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
                
                // Here we getting the users products
                let dataset_3 = [req.session.userId];
                let sqlquery_3 = "SELECT products.product_name, products.product_code FROM catalogues JOIN users ON catalogues.user_id = users.id JOIN products ON catalogues.product_id = products.id WHERE users.id == ?";
                db.all(sqlquery_3, dataset_3, (err, result) => {
                    if (err) return console.log("error");
                    let products = result;
                    res.render("user.html", {username: username, user_details: user_details_a, user_products: products})
                })
            })
        })
    });
    app.get("/catalogue", function (req, res) {
        // Here we getting the users details
        let dataset_2 = [req.session.userId];
        let sqlquery_2 = "SELECT * FROM user_details WHERE id = ?";
        db.get(sqlquery_2, dataset_2, (err, result) => {
            if (err) return console.log("error");
            // If the user has no details we parse an empty object
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

            // // Here we getting the users products
            let dataset_3 = [req.session.userId];
            let sqlquery_3 = "SELECT products.product_name, products.product_brand, products.product_description_short FROM catalogues JOIN users ON catalogues.user_id = users.id JOIN products ON catalogues.product_id = products.id WHERE users.id == ?";
            db.all(sqlquery_3, dataset_3, (err, result) => {
                if (err) return console.log("error");
                let products = result;
                res.render("catalogue.html", {user_details: user_details_a, user_products: products})
            })
        })
    });
    app.get("/product", function (req, res) {
        res.render("product.html")
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
            let sqlquery_1 = "SELECT EXISTS(SELECT * FROM users WHERE username = ? AND password = ?)";
            let sqlquery_2 = "SELECT * FROM users WHERE username = ?";
            
            // Here we querying if there is a match for the username and password
            db.get(sqlquery_1, dataset_1, (err, result) => {
                if (err) return console.log("error");
                // If there is a match
                if(Object.values(result)[0]){
                    // Here we query the matches id
                    db.get(sqlquery_2, dataset_2, (err, result) => {
                        if (err) return console.log("error");
                        // Here we creating our session id
                        req.session.userId = result['id'];
                        return res.redirect('/user');
                    })
                }else return res.redirect('/login');
            });
        }
    });
    app.post("/register", redirectUser, function (req, res) {
        const username = req.body.username
        const password = req.body.password
        if (username && password){
            // Should do promises in here but not too sure how, dont think a nested query is correct, this works though
            let dataset_1 = [username];
            let dataset_2 = [username, password];
            let dataset_3 = [username];
            let sqlquery_1 = "SELECT EXISTS(SELECT * FROM users WHERE username = ?)";
            let sqlquery_2 = "INSERT INTO users (username, password)VALUES(?,?)";
            let sqlquery_3 = "SELECT * FROM users WHERE username = ?";

            // Here we checking if there is a user with the same username already in the database
            db.get(sqlquery_1, dataset_1, (err, result) => {
                if (err) return console.log("error");
                // If there is NOT a match
                if(!Object.values(result)[0]){
                    // Here we adding the user to the database
                    db.run(sqlquery_2, dataset_2, (err, result) => {
                        if (err) return console.log("error");
                        console.log("user added")
                        // Here we querying the database for the new id, and assigning the session id
                        db.get(sqlquery_3, dataset_3, (err, result) => {
                            if (err) return console.log("error");
                            req.session.userId = result['id'];
                            return res.redirect('/user')
                        })
                    })
                }else return res.redirect('/register');
            });
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
            let sqlquery_1 = "UPDATE user_details SET "+ sqlQuery_concatenation +" WHERE id == ?";
            db.run(sqlquery_1, dataset_1 , (err, result) => {
                if (err) return console.log("error");
                console.log("details updated");
                return res.redirect('/user');
            })
        } else return res.redirect('/user');
    });
    ////////////////////// Post Requests
}