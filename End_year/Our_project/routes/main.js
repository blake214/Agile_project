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
        // Here we parsing the session id to the template page
        res.render("index.html", {userSessionId: userId});
    });
    app.get("/user", redirectLogin, function (req, res) {
        // Here we getting the username thats with the session id
        const user = users.find(user => user.id === req.session.userId)
        // Here we parsing the username to the template
        res.render("user.html", {username: user.username})
    });
    app.get("/catalogue", function (req, res) {
        res.render("catalogue.html")
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
            /**Here we searching our array of credentials
             * So if there is a username and password match, user gets populated
             * else will be undefined
             */
            const user = users.find(
                user => user.username === username && user.password === password
            )
            // If user is populated we create our session id and redirect to the user page
            if (user){
                req.session.userId = user.id
                return res.redirect('/user');
            }
        }
        // else back to login page
        return res.redirect('/login')
    });
    app.post("/register", redirectUser, function (req, res) {
        const username = req.body.username
        const password = req.body.password
        if (username && password){
            // Here we checking if there is a username that already exists as what user put in
            const exists = users.some(user => user.username === username)
            if (!exists){
                // Here we creating an object to push to our credentials array
                const user = {
                    id:users.length+1,
                    username,
                    password
                }
                users.push(user)
                // Here we create our session id and redirect user to the user page
                req.session.userId = user.id
                return res.redirect('/user')
            } 
        }
        // else back to register page
        return res.redirect('/register')
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
    ////////////////////// Post Requests
}