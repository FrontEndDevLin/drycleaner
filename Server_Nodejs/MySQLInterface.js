/**
 * Created by X on 2019/3/18
 */

const MySQL = require("mysql");

function MySQLInterface() {
    let confParser = require("./ConfigParser");
    let dbConfig = confParser.Parse("database");
    // console.log(dbConfig);
    let pool = MySQL.createPool({
        host: dbConfig["host"],
        user: dbConfig["user"],
        password: dbConfig["password"],
        port: dbConfig["port"],
        database: dbConfig["name"],
        connectionLimit: 25
    });

    this.GetPool = function () {
        return pool;
    }

    this.Query = function (sql, paramArr, callback) {
        pool.query(sql, paramArr, function (err, result) {
            if (callback) {
                return callback(err, result);
            }
        })
    }

    // 废弃
    this.GetOne = function (sql, paramArr, callback) {
        pool.query(sql, paramArr, function (err, result) {
            return callback(err, result[0]);
        })
    }

    this.GetAll = function (sql, paramArr, callback) {
        pool.query(sql, paramArr, function (err, result) {
            return callback(err, result);
        })
    }

    this.InsertOne = function (sql, paramArr, callback) {

    }
}

module.exports = new MySQLInterface();