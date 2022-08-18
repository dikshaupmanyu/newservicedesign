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
var bcrypt = require('bcrypt');
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

	 	// var serviceIddd = req.query.id;
	 	var serviceIddd = req.query.id;
	 	// var logindetails = req.query.logindetail;
	 	// console.log(serviceIddd);
	 	// console.log(JSON.stringify(logindetails));
	 	// var fdata = JSON.stringify(logindetails);
	 	// const obj = logindetails;
	 	// console.log(obj);
	 	var logintoken = req.query.accessToken;
	 	var loginemail = req.query.email;
	 	var loginname = req.query.userName;
	 	var loginid = req.query.id;

    var message = "hiii";

    var message ;
    if(req.query.message){
      message = req.query.message;
    }else{
      message = "";
    }

	    res.render('servicesdetail.ejs' , {serviceIdDetail : serviceIddd , message : message, tokens : logintoken , email : loginemail , name : loginname , id : loginid});
		     
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

    var serviceIddd = req.query.service;
    // var logindetails = req.query.logindetail;
    // // console.log(serviceIddd);
    // // console.log(JSON.stringify(logindetails));
    // // var fdata = JSON.stringify(logindetails);
    // const obj = JSON.parse(logindetails);
    // // console.log(obj);
    // var logintoken = obj.accessToken;
    var loginemail = req.query.email;
    var loginname = req.query.name;
    var loginid = req.query.id;
      
      res.render('servicesdetailstepSignUp.ejs' , {serviceIdDetail : serviceIddd , email : loginemail , name : loginname , id : loginid });
         
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
            url: 'https://apistest.tradetipsapp.com/api/stripePayment/createServiceSubscriptionPayment',
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

      	res.render("failure.ejs" , {data : error.raw.message , service : req.body.serviceIds,name : req.body.userName, email : req.body.emailData,id:req.body.userId,tokens:req.body.tokendata});
     };

});

app.post('/SignUp',async function(req,res){
   console.log(req.body);
   // res.sendStatus(200)

 const hashpassword =  await bcrypt.hash(req.body.password, 10);
 console.log("HASH PASSWORD: " +   hashpassword);


 // const matchpassword =  await bcrypt.compare(req.body.password, hashpassword);
 // console.log("MATCH PASSWORD: " +   matchpassword);

   try{
      console.log('try')
     

      if(req.body.password == req.body.confirmpassword){

        console.log("true");

         const Signup = {
         userName: req.body.userName,
         email: req.body.email,
         password: hashpassword,
        }

         var option = { method: 'POST',
                  url: 'https://apistest.tradetipsapp.com/api/appUser/newSignupPayment',
                  headers: { 'postman-token': 'a1f3bad2-8aab-6d21-7162-d82350e953af',
                              'cache-control': 'no-cache'},
            //  authorization: 'Bearer '+req.body.tokendata },     
                  formData: Signup
            }
      
         request(option, function (error, response, body){
           if(response){

              console.log(body);

              const obj = JSON.parse(body);

             console.log(obj.title);

              console.log(obj.status);

              if(obj.status == "false"){
                
                return res.redirect('/servicesdetail?id='+req.body.serviceIds+'&message='+obj.title);

              }else{

                return res.redirect('/servicesdetailstepSignUp?service='+req.body.serviceIds+'&name='+req.body.userName+'&email='+req.body.email+'&id='+req.body.id);

              }


           }
        })

      }else{

        console.log("false");

        var text = "password and confirmpassword not match.";

        return res.redirect('/servicesdetail?id='+req.body.serviceIds+'&message='+text);
      }

     
   }catch(error) {
      console.log(error)
   }
    

})

//   app.post('/servicesdetailstepSignUp', function(req, res){

//    //   console.log(req.body);

//         var options = { method: 'POST',
//             url: 'https://apistest.tradetipsapp.com/api/appUser/newSignupPayment',
//             headers: 
//              { 'postman-token': 'a1f3bad2-8aab-6d21-7162-d82350e953af',
//                'cache-control': 'no-cache'},
//                // authorization: 'Bearer '+req.body.tokendata },     
//                formData: {
//                    userName: req.body.userName,
//                   email: req.body.email,
//                   password: req.body.password,
//                   confirmPassword: req.body.confirmpassword,
//          } };
//          console.log("helo")
//          console.log(options)
//           request(options, function (error, response, body) {
//             //  if ( email == '' || password == '' || conformPassword == '') {
//             //     alert("Please enter all details")
//             //     console.log("Please enter all details")
//             //    }else{
//                 if(response){
   
                  
//                    console.log("ok")
//                //  res.redirect("/servicesdetail", {name : req.body.userName, email : req.body.email , password: req.body.password ,  confirmPassword: req.body.confirmpassword,});
                   
   
//                // }
//              }

          	
//              // if (error) throw new Error(error);

//             // {
//             //   res.render('incomplete.ejs');
//             // }
//             // throw new Error(error);

//             // console.log(response);
//             // console.log(error);
//             // console.log(body);
//             // res.render('complete.ejs');
//           });
         
         
// });





const securePasswords = async (password) =>{
 const hashpassword =  await bcrypt.hash(password, 10);
 console.log("HASH PASSWORD: " +   hashpassword);


 const matchpassword =  await bcrypt.compare('yash1111', hashpassword);
 console.log("MATCH PASSWORD: " +   matchpassword);
}

securePasswords('yash1111')