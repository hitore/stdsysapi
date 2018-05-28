var MongoClient = require('mongodb').MongoClient;
var dbName = 'stdsys';
var url = `mongodb://localhost:27017/${dbName}`;

var db = {};

db.find = function(colName, filter = {}, fn) {
	MongoClient.connect(url, function(err, db) {
		if (err) {
			console.log(err);
		}
		const dbase = db.db(dbName);

		dbase.collection(colName).find(filter).toArray(function(err, res) {
			if (err) {
				console.log(err);
			}
			if (fn) {
				db.close();
				return fn(res);
			}
			db.close();
		});
	});
}

db.insert = function(colName, filter = {}, fn) {
	MongoClient.connect(url, function(err, db) {
		if (err) {
			console.log(err);
		}
		const dbase = db.db(dbName);

		dbase.collection(colName).insertOne(filter, function(err, res) {
			if (err) {
				console.log(err);
			}
			if (fn) {
				db.close();
				return fn(res);
			}
			db.close();
		});
	});
}

db.update = function(colName, filter = {}, data, fn) {
	MongoClient.connect(url, function(err, db) {
		if (err) {
			console.log(err);
		}
		const dbase = db.db(dbName);

		dbase.collection(colName).updateOne(filter, { $set: data}, function(err, res) {
			if (err) {
				console.log(err);
			}
			if (fn) {
				db.close();
				return fn(res);
			}
			db.close();
		});
	});
}

db.updateMore = function(colName, filter = {}, data, fn) {
	MongoClient.connect(url, function(err, db) {
		if (err) {
			console.log(err);
		}
		const dbase = db.db(dbName);

		dbase.collection(colName).updateMany(filter, data, function(err, res) {
			if (err) {
				console.log(err);
			}
			if (fn) {
				db.close();
				return fn(res);
			}
			db.close();
		});
	});
}

db.delete = function(colName, filter = {}, fn) {
	MongoClient.connect(url, function(err, db) {
		if (err) {
			console.log(err);
		}
		const dbase = db.db(dbName);

		dbase.collection(colName).deleteOne(filter, function(err, res) {
			if (err) {
				console.log(err);
			}
			if (fn) {
				db.close();
				return fn(res);
			}
			db.close();
		});
	});
}

module.exports = db;