var MongoClient = require('mongodb').MongoClient;
var express = require('express');
var bodyParser = require('body-parser');
var app = express();

app.set('views','./views');
app.set('view engine','pug');

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

app.get('/', function (req, res) {  
    res.render('index');
})

//Get all recipes route
app.get("/recipes", function(req,res){
	//Create an object with a name array
	var namesObject = { names : []};
	//Connect
	MongoClient.connect("mongodb://localhost:27017/recipeDB", function(err,db){
		if(err){
			res.sendStatus(500);
			db.close();
		}else{
			//Find all recipes
			var cursor = db.collection("recipes").find();
			cursor.each(function(err,docs){
				if(docs !== null){
					//Add them to the list
					namesObject.names.push(docs.name);						
				}
				else{
					//Send all the names as an object
					console.log(namesObject);
					res.send(namesObject);
					db.close();					
				}

			});
		}

	});
});

//Request a single recipe route
app.get("/recipe/:attr", function(req,res){
	//Connect
	MongoClient.connect("mongodb://localhost:27017/recipeDB", function(err,db){
		if(err){
			res.sendStatus(500);
			db.close();
		}else{
			//Query for the specific name
			var cursor = db.collection("recipes").find({name: req.params.attr});
			cursor.each(function(err,docs){
				if(docs !== null){
					console.log(docs);
					//JSON the query
					var jsonObject = JSON.stringify(docs);
					res.send(jsonObject);				
				}
				else{

					db.close();					
				}

			});
		}
	});	
});

//Update/Add recipe route
app.post("/recipe", function(req,res){

	console.log(req.body.name);

	//Connect
	MongoClient.connect("mongodb://localhost:27017/recipeDB", function(err,db){
		if(err){
			res.sendStatus(500);
			db.close();
		}else{
			

			var collection = db.collection("recipes");
			var found = false;
			var cursor = db.collection("recipes").find({name: req.body.name});
			cursor.each(function(err,docs){
				if(docs !== null){
					//If the database already contains the recipe, erase the existing instance
					if(docs.name === req.body.name){
						found = true;
						console.log("found");
						db.collection("recipes").remove({name: req.body.name});
					}
				}
				else{

					if(req.body.name !== ""){
						//Add the new recipe/updated current one
						collection.insertOne(req.body, function(err,result){
							if(err){
								console.log("insert failed: ",err);
								res.sendStatus(500);
							}else{
								console.log("Inserted.")
								res.sendStatus(200);

							}
							db.close();
						});								
					}
					else{
						res.sendStatus(400);
						console.log("Empty name field.");
					}
					
						
				}

			});

		}
	});
});

app.use(express.static("./public"));

app.listen(2406,function(){console.log("Server is listening for PUG requests on 2406");});