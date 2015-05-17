var mysql = require('mysql');

var connection;

var INSERT_COMP = "INSERT INTO Comparison VALUES (?,?,?,?);";
var GET_COMP = "SELECT Result,Offset,Short FROM Comparison WHERE Films = ?;";
var CREATE_COMP = "CREATE TABLE Comparison (Films varchar(255), Result float, Offset int, PRIMARY KEY (Films), Short varchar(255));";

var CREATE_SUBS = "CREATE TABLE Subs (Film varchar(255), Data TEXT);";
var INSERT_SUBS = "INSERT INTO Subs VALUES (?,?);";
var GET_SUBS = "SELECT Data FROM Subs WHERE Film = ?;";

exports.open = function() {
  connection = mysql.createConnection({
        host: 'localhost',
        user: 'root',
        password: '',
        database: 'Vult'
    });
    connection.connect();
}

exports.close = function() {
    connection.end();
}

exports.insertResult = function(film1, film2, result, offset, shortFilm) {
    var films = film1 + ',' + film2;
    connection.query(INSERT_COMP, [films, result, offset, shortFilm]);
};

exports.insertSub = function(film, sub) {
    sub = JSON.stringify(sub);
    connection.query(INSERT_SUBS, [film, sub]);
};

exports.getResult = function(film1, film2, callback, second) {
    var films = film1 + ',' + film2;
    connection.query(GET_COMP, [films], function(err, rows, fields) {
        if (rows.length > 0) {
            callback(rows[0].Result, rows[0].Offset, rows[0].Short);
        } else if (!second) {
            exports.getResult(film2, film1, callback, true);
        } else {
            callback();
        }
    });
};

exports.getSub = function(film, callback) {
    connection.query(GET_SUBS, [film], function(err, rows, fields) {
        if (rows.length > 0) {
            var binary = JSON.parse(rows[0].Data);
            callback(binary);
        } else {
            callback();
        }
    });
};

exports.createTable = function() {
    connection.query(CREATE_COMP);
    connection.query(CREATE_SUBS);
};

exports.tablesExists = function() {
    
};
