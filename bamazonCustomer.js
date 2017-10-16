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

//storing product names locally to be used in the purchase system and calling menu for the first time.
connection.query("SELECT product_name FROM products", function(err, resp){
	if (err) throw err;
	forsale = resp.map(function(e){
		return e.product_name;
	});
	buy();
});

// function to bid on a given item.
function buy () {
	inquirer.prompt([
		{
			name: "product_name",
			message: "What product would you like to buy?",
			type: "list",
			choices: forsale
		}
	]).then(function(response){
		purchase(response.product_name);
	});
}

function purchase (product_name) { 
	var product = product_name;
	inquirer.prompt([
		{
			name: "purchase",
			message: "How many would you like to buy?",
		}
	]).then(function(response){
		var quantity = response.purchase;
		connection.query(`SELECT * FROM products WHERE product_name = '${product}'`, function(err, resp){
			var inStockQuanity = resp.map(function(e){
				return e.stock_quantity;
			});
			var productPrice = resp.map(function(e){
				return e.price;
			});
			if (err) throw err;
			if (inStockQuanity[0] - quantity > 0){
				connection.query(`UPDATE products SET stock_quantity = stock_quantity - ${quantity} WHERE product_name = '${product}'`, function(error, res){
					if (error) throw error;
					console.log(`You have purchased ${quantity} units of ${product}. The new quantity is ${inStockQuanity[0] - quantity}. You will be charged \$${quantity * productPrice}.`);
				});
				connection.end();
			} else {
				console.log("INSUFFICIENT QUANTITY!");
				connection.end();
			}
		});
	});
}