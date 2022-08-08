var compression = require('compression');
var express  = require('express');
var app      = express();
var fs      = require('fs');
var port     = process.env.PORT || 8080;
var path = require('path');
var cors = require('cors');
var request = require('request');
var http = require('http');
var https = require('https');
var expressJwt = require('express-jwt');
var jwt = require('jsonwebtoken');
var bodyParser = require('body-parser');
var privateKey  = fs.readFileSync('sslcert/server.key', 'utf8');
var certificate = fs.readFileSync('sslcert/server.crt', 'utf8');
var credentials = {key: privateKey, cert: certificate};
/////////////////////////////////////////
var httpServer = http.createServer(app);
// var httpsServer = https.createServer(credentials, app);

httpServer.listen(port);
// httpsServer.listen(port);
console.log('The magic happens on port ' + port);

 
	app.use(compression());
	app.use(cors());
	app.use(express.bodyParser()); // get information from html forms


	app.set('view engine', 'ejs'); // set up ejs for templating
	app.use(express.static(path.join(__dirname, 'public')));


	 app.get('/servicesdetail', function(req, res) {

	 	var serviceIddd = req.query.id;
	    
	    res.render('servicesdetail.ejs' , {serviceIdDetail : serviceIddd });
		     
	 });

	 app.get('/success', function(req, res) {

	 	var serviceIddd = req.query.id;
	    
	    res.render('success.ejs' , {serviceIdDetail : serviceIddd });
		     
	 });

	 app.get('/failure', function(req, res) {

	 	var serviceIddd = req.query.id;
	    
	    res.render('failure.ejs' , {serviceIdDetail : serviceIddd });
		     
	 });

	 app.get('/servicesdetailstepOne', function(req, res) {

	 	var serviceIddd = req.query.id;
	 	var logindetails = req.query.logindetail;
	 	// console.log(serviceIddd);
	 	// console.log(JSON.stringify(logindetails));
	 	// var fdata = JSON.stringify(logindetails);
	 	const obj = JSON.parse(logindetails);
	 	// console.log(obj);
	 	var logintoken = obj.accessToken;
	 	var loginemail = obj.email;
	 	var loginname = obj.userName;
	 	var loginid = obj.id;
	    
	    res.render('servicesdetailstepOne.ejs' , {serviceIdDetail : serviceIddd , tokens : logintoken , email : loginemail , name : loginname , id : loginid });
		     
	 });

 app.get('/servicesdetailstepSignUp', function(req, res) {

    var serviceIddd = req.query.id;
    var logindetails = req.query.logindetail;
    // console.log(serviceIddd);
    // console.log(JSON.stringify(logindetails));
    // var fdata = JSON.stringify(logindetails);
    const obj = JSON.parse(logindetails);
    // console.log(obj);
    var logintoken = obj.accessToken;
    var loginemail = obj.email;
    var loginname = obj.userName;
    var loginid = obj.id;
      
      res.render('servicesdetailstepSignUp.ejs' , {serviceIdDetail : serviceIddd , tokens : logintoken , email : loginemail , name : loginname , id : loginid });
         
   });




  app.post('/payment', async function(req, res){
 
    // Moreover you can take more details from user
    // like Address, Name, etc from form

     console.log(req.body);

      var couponId = req.body.text1;

     let months = req.body.monthYear;
          months = months.split("/")[0];
       // console.log(months);
      let dates = req.body.monthYear;
          dates = dates.split("/")[1];
      // console.log(dates);
        const stripe = require('stripe')('pk_live_7b9zLcAaGBVeu14tr9Jueznl00HCPZZOU1');

        try {

        const paymentMethod = await stripe.paymentMethods.create({
        type: 'card',
        card: {
          number: req.body.cardNumber,
          exp_month: months,
          exp_year: dates,
          cvc: req.body.cvv,
        },
        billing_details: {
          email: req.body.emailData,
          name: req.body.cardName
        }
      });

         // console.log("hiiiii data " + JSON.stringify(paymentMethod));

        var options = { method: 'POST',
            url: 'https://apis.tradetipsapp.com/api/stripePayment/createServiceSubscriptionPayment',
            headers: 
             { 'postman-token': 'a1f3bad2-8aab-6d21-7162-d82350e953af',
               'cache-control': 'no-cache'},
               // authorization: 'Bearer '+req.body.tokendata },     
               formData: { userName: req.body.userName,
               paymentId: paymentMethod.id,
               serviceSubscriptionPlanId: req.body.serviceIds,
     		  couponId : req.body.text1 } };

          request(options, function (error, response, body) {

             // console.log("body data  " + JSON.stringify(response)); 
             // console.log("error data " + error);
          	if(response){

          		

          		res.render("success.ejs" , {userName : req.body.userName, userEmail : req.body.emailData , service : req.body.serviceIds , mentorName : req.body.mentorName});
          	}
             // if (error) throw new Error(error);

            // {
            //   res.render('incomplete.ejs');
            // }
            // throw new Error(error);

            // console.log(response);
            // console.log(error);
            // console.log(body);
            // res.render('complete.ejs');
          });


      } catch(error) {

      	console.log(error.raw.message);

      	res.render("failure.ejs" , {data : error.raw.message , service : req.body.serviceIds});
     };

});
