var inquirer = require("inquirer");
var mysql = require("mysql");

var forsale = [];

var connection = mysql.createConnection ({
	host: "localhost",
	port: 3306,
	user: "root",
	password: "",
	database: "bamazon"
});

connection.connect(function(err) {
  if (err) throw err;
  console.log("connected as id " + connection.threadId);
});

DBSync();

//storing product details locally to be used in the inventory system and creating menu functionality.
function DBSync () {
	//storing product names locally for displaying in menus
	connection.query("SELECT product_name FROM products", function(err, resp){
		if (err) throw err;
		forsaleNames = resp.map(function(e){
			return e.product_name;
		});
	});
	connection.query("SELECT * FROM products", function(err, resp){
		if (err) throw err;
		forsale = resp.map(function(e){
			return e;
		});
		menu();
	});
}

// initial function to choose user path
function menu () {
	inquirer.prompt([
		{
			name: "action",
			type: "list",
			message: "What would you like to do?",
			choices: ["View Product List", "Check Low Inventory Levels", "Add a Product", "Increase Quantity", "Quit"]
		}
	]).then(function(response){
		if (response.action == "Add a Product"){
			post();
		} else if (response.action == "Check Low Inventory Levels"){
			check();
		} else if (response.action == "View Product List"){
			view();
		} else if (response.action == "Increase Quantity"){
			increase();
		} else {
			quit();
		}
	});
}

// function to gather informaiton to post a new product and push to DB
function post () {
	inquirer.prompt([
		{
			name: "product_name",
			message: "What is the name of the new product?"
		},
		{
			name: "department_name",
			message: "What department is this prodcut in?"
		},
		{
			name: "price",
			message: "How much does it cost?"
		},
		{
			name: "stock_quantity",
			message: "How many units are there?"
		}
	]).then(function(response){
		connection.query(`INSERT INTO products (product_name, department_name, price, stock_quantity) value ('${response.product_name}', '${response.department_name}', ${response.price}, ${response.stock_quantity})`, function(err, resp){
			if (err) throw err;
			console.log(`${response.product_name} at price ${response.price} and quanity ${response.stock_quantity} has been added to the database.`)
			DBSync();
		});
	});

}

// function to bid on a given item.
function view () {
	for (i = 0; i < forsaleNames.length; i++){
		console.log(forsaleNames[i]);
	}
	DBSync();
}

function check () {
	console.log("The following products have a quanity of less than 5 in stock:");
	for (i = 0; i < forsale.length; i++){
		if (forsale[i].stock_quantity < 5){
			console.log("Product: " + forsale[i].product_name + " has a quantity of " + forsale[i].stock_quantity);
		}
	}
	DBSync();
}

function increase () {
	inquirer.prompt([
		{
			name: "product_name",
			message: "What product would you like to increase the quantity of?",
			type: "list",
			choices: forsaleNames
		},
		{
			name:"stock_quantity",
			message:"How many more units should be added?"
		}
	]).then(function(response){
		var product = response.product_name;
		var quantity = response.stock_quantity;
		connection.query(`UPDATE products SET stock_quantity = stock_quantity + ${quantity} WHERE product_name = '${product}'`, function(error, res){
			if (error) throw error;
			console.log(`You have increased the quanity of ${product} by ${quantity}.`);
		});
		DBSync();
	});
}

function quit () {
	connection.end();
}