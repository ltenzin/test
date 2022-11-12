// Name : Lobsang Tenzin
// ID   : 103895215
// Email: ltenzin2@myseneca.ca
// Course: WEB322 NII

const exp = require("express") 
const app = exp();
const path = require("path");
const bodyParser = require("body-parser");
const handlebars = require("express-handlebars");
const mongoose = require("mongoose");

const registration = mongoose.createConnection("mongodb+srv://ltenzin2:aqLRhxR7kKDT8hOs@senecaweb.uiar6qq.mongodb.net/?retryWrites=true&w=majority");
const blog = mongoose.createConnection("mongodb+srv://ltenzin2:aqLRhxR7kKDT8hOs@senecaweb.uiar6qq.mongodb.net/?retryWrites=true&w=majority");
const article = mongoose.createConnection("mongodb+srv://ltenzin2:aqLRhxR7kKDT8hOs@senecaweb.uiar6qq.mongodb.net/?retryWrites=true&w=majority");

const registration_schema = new mongoose.Schema({
    "firstname": String,
    "lastname": String,
    "username": { "type": String, "unique": true },
    "password": String,
    "address": String,
    "dob": String,
    "phoneD": String,
    "course": String,
    "email": { "type": String, "unique": true }
});

const blog_schema = new mongoose.Schema({
    "blog_name": String
});

const article_schema = new mongoose.Schema({
    "article_name": String
});

const user_info = registration.model("registration", registration_schema);
const blog_content = blog.model("blog", blog_schema);
const article_content = article.model("article", article_schema);


app.engine(".hbs", handlebars.engine({extname: '.hbs'}));
app.set('view engine', '.hbs');
app.use(bodyParser.urlencoded({extended: true}));

app.get("/", function(req, res) {
    res.sendFile(path.join(__dirname, "/blog.html"));
});

app.get("/article", function(req, res) {
    res.sendFile(path.join(__dirname, "/read_more.html"));

});

app.get("/registration", function(req, res) {
    res.render("registration", {layout: false});
});

function dateOfBirth(birth) 
{
    const dofb = /^\d{2}-\d{2}-\d{4}$/;
    return dofb.test(birth); 
}

function phoneNum(num) 
{
    const phone = /^\d{3}-\d{3}-\d{4}$/;
    return phone.test(num); 
}


app.post("/registration", function(req, res){
    var registrationData = {
        firstname: req.body.firstname,
        lastname: req.body.lastname,
        username: req.body.username,
        password: req.body.password,
        address: req.body.address,
        dob: req.body.dob,
        phoneD: req.body.phoneD,
        course: req.body.course,
        email: req.body.email
    }

    if(registrationData.username == "" || registrationData.password == "" || registrationData.dob == "" || registrationData.phoneD == "")
    {
        var regiError = "The field with * should be entered!!!";
        res.render("registration", { regiError: regiError, data: registrationData, layout: false });
        return;
    }
    else if(dateOfBirth(registrationData.dob) != true)
    {
        var dobError = "Follow the format dd-mm-yyyy, include -";
        res.render("registration", { dobError: dobError, data: registrationData, layout: false });
    }
    else if(phoneNum(registrationData.phoneD) != true)
    {
        var phoneError = "Follow the format 123-456-7890, include -";
        res.render("registration", { phoneError: phoneError, data: registrationData, layout: false });
    }
    else if(registrationData.password.length < 6 || registrationData.password.length > 12)
    {
        var pssError = "The password length should be between 6 to 12 characters"
        res.render("registration", { pssError: pssError, data: registrationData, layout: false});
    }
    else
    {
        res.render("dashboard", {layout: false});
    }

    let accoutInfo = new user_info({
        firstname: registrationData.firstname,
        lastname: registrationData.lastname,
        username: registrationData.username,
        password: registrationData.password,
        address: registrationData.address,
        dob: registrationData.dob,
        phoneD: registrationData.phoneD,
        course: registrationData.course,
        email: registrationData.email
    }).save((e, data) =>{
        if(e)
        {
            console.log(e);
        }
        else
        {
            console.log(data);
        }
    });
});

app.get('/login', function(req, res){
    res.render("login", {layout: false});
});

function specialChar(str)
{
    const speStr = /[`!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?~]/;
    return speStr.test(str);
}

app.post("/login", function(req, res){

    var loginData = {
        usr: req.body.username,
        pss: req.body.password
    }

    if(loginData.usr == "" || loginData.pss == "" )
    {
        var loginError = "The username and the password should be entered!!!";
        res.render("login", { loginError: loginError, data: loginData, layout: false });
    }
    else if(specialChar(loginData.usr) == true) //if there's special character return true
    {
        var specialError = "Special character is not allowed";
        res.render("login", { specialError: specialError, data: loginData, layout: false});
    }
    else
    {
        user_info.findOne({ username: loginData.usr, password:loginData.pss }, ["firstname", "lastname", "username"]).exec().then((data) =>{
            if(data) 
            {
             res.render("login_dashboard", {firstname:data.firstname, lastname:data.lastname, username:data.username, layout: false});
            }
            else
            {
             var userError = "Sorry, you entered the wrong username and/or password";
             res.render("login", {userError: userError, data: loginData, layout: false});
            }
         });
        //res.render("dashboard", {layout: false});
    }



})


app.use(function(req,res){
    res.status(404).send("Page not found");
})

var port = process.env.PORT || 8080;
app.listen(port);
