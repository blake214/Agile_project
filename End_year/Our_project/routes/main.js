module.exports = function (app) {
    app.get("/", function (req, res) {
        res.render("index.html")
    });
    app.get("/user", function (req, res) {
        res.render("user.html")
    });
    app.get("/catalogue", function (req, res) {
        res.render("catalogue.html")
    });
    app.get("/product", function (req, res) {
        res.render("product.html")
    });
}