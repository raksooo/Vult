var mysql = require('mysql');

var connection = mysql.createPool({
	host: 'localhost',
	user: 'root',
	password: '',
	database: 'Vult'
});

var INSERT = "INSERT INTO Comparison VALUES (?,?,?);";
var GET = "	SELECT Result,Offset FROM Comparison WHERE Films = ?;";
var CREATE = "	CREATE TABLE Comparison (Films varchar(255), Result float, Offset int, PRIMARY KEY (Films));";

function insertResult(film1, film2, result, offset) {
	var films = "film1,film2";
	connection.query(INSERT, [films, result, offset]);
}

function getResult(film1, film2, callback) {
	var films = "film1,film2";
	connection.query(GET, [films], function(err, rows, fields) {
		if (rows.length > 0) {
			callback(rows[0].result, rows[0].offset);
		} else {
			callback();
		}
	});
}

function createTable() {
	connection.query(CREATE);
}