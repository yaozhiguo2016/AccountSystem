/**
 * Created by yaozh on 2017/4/8.
 */
let genericPool = require('generic-pool');
let mysqlConfig = require('../../../config/mysql.json');
let mysql = require('mysql');

let env = process.env.NODE_ENV || 'development';
if(mysqlConfig[env]) {
    mysqlConfig = mysqlConfig[env];
}

let createMysqlPool = function(){
    return new genericPool.Pool({
        name: 'mysql',
        create: function(callback) {
            var client = mysql.createConnection({
                host: mysqlConfig.host,
                user: mysqlConfig.user,
                password: mysqlConfig.password,
                database: mysqlConfig.database
            });
            callback(null, client);
        },
        destroy  : function(client) {
            client.end();
        },
        max: 10,
        min: 2,
        idleTimeoutMillis: 30000,
        log: false
    });
};

exports.createMysqlPool = createMysqlPool;