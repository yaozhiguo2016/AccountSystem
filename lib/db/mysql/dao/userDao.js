const mysql = require('../mysql-client');
const uuid = require('../../../utils/UUID');
const crypt = require('../../../utils/crypt');
const userDao = module.exports;

userDao.activeUser = function(userId, cb){
    const sql = 'update user set state = 1 where id = ?';
    const args = [userId];
    mysql.update(sql,args,function(err, res){
        console.log(err,res);
        if(err !== null){
            cb(err.message, null);
        } else {
            cb(res);
        }
    });
};

/**
 * Get userInfo by username
 * @param {String} username
 * @param {function} cb
 */
userDao.getUserByName = function (username, cb){
    const sql = 'select * from  user where name = ?';
    const args = [username];
    mysql.query(sql,args,function(err, res){
        if(err !== null){
            cb(err.message, null);
        } else {
            if (!!res && res.length === 1) {
                const rs = res[0];
                const user = {
                    id: rs.id,
                    name: rs.name,
                    password: rs.password,
                    email: rs.email,
                    createTime:rs.createTime,
                    state:rs.state,
                    validateCode:rs.validateCode
                };
                cb(null, user);
            } else {
                cb(' user not exist ', null);
            }
        }
    });
};

userDao.getUserByEmail = function (email, cb){
    const sql = 'select * from  user where email = ?';
    const args = [email];
    mysql.query(sql,args,function(err, res){
        if(err !== null){
            cb(err.message, null);
        } else {
            if (!!res && res.length === 1) {
                const rs = res[0];
                const user = {
                    id: rs.id,
                    name: rs.name,
                    password: rs.password,
                    email: rs.email,
                    createTime:rs.createTime,
                    state:rs.state,
                    validateCode:rs.validateCode
                };
                cb(null, user);
            } else {
                cb(' user not exist ', null);
            }
        }
    });
};

/**
 * Create a new user
 * @param (String) username
 * @param {String} password
 * @param {function} cb Call back function.
 */
userDao.createUser = function (username, password, email, cb){
    const sql = 'insert into user (`id`, ' +
        'name, ' +
        'password, ' +
        'email, ' +
        'loginCount, ' +
        'createTime, ' +
        'state, ' +  //active state,0 means not active,1 means active
        'validateCode) values(?,?,?,?,?,?,?,?)'; //validate code to check by email
    const loginTime = Date.now();
    const uid = uuid();
    const validateCode = crypt.randomString(24);
    const args = [uid, username, password, email, 1, loginTime, 0, validateCode];
    mysql.insert(sql, args, function(err,res){
        if(err !== null){
            cb({code: err.number, msg: err.message}, null);
        } else {
            const insertId = res.insertId;

            const user = {
                id: uid,
                name: username,
                password: password,
                email:email,
                loginCount: 1,
                createTime:loginTime,
                state:0,
                validateCode:validateCode
            };
            cb(null, user);
        }
    });
};

userDao.createAnonymous = function(name, state, callback){
    const sql = 'insert into user (id, name, state) values (?,?,?)';
    const args = [uuid(), name, state];
    mysql.insert(sql, args, function(err, res){
        if(err !== null){
            callback({code: err.number, msg: err.message}, null);
        } else {
            const insertId = res.insertId;

            const user = {
                id: uid,
                name: name,
                state:state
            };
            callback(null, user);
        }
    });
};

/**
 *
 * @param userObj {id, name, password, email, loginCount, createTime, validateCode}
 * @param callback
 */
userDao.bindAnonymous = function (id, username, password, email, callback) {

    const loginTime = Date.now();
    const validateCode = crypt.randomString(24);
    const sql = 'update user set name=?,password=?,email=?,loginCount=?,createTime=?,validateCode=? where id=?';
    const args = [username, password, email, 1, loginTime, validateCode ,id];

    mysql.update(sql, args, function(err, res){
        if(err !== null){
            callback({code: err.number, msg: err.message}, null);
        } else {
            const insertId = res.insertId;

            const user = {
                id: id,
                name: username,
                password: password,
                email: email,
                loginCount: 1,
                createTime: loginTime,
                state:0,
                validateCode:validateCode
            };
            callback(null, user);
        }
    });
};

userDao.resetUserByEmail = function(email, name, password, callback){
    const sql = 'update user set name=?,password=? where email=?';
    const args = [name, password, email];

    mysql.update(sql, args, function(err, res){
        if(err !== null){
            callback({code: err.number, msg: err.message}, null);
        } else {
            const insertId = res.insertId;

            const user = {
                name: name,
                password: password,
                email: email
            };
            callback(null, user);
        }
    });
};



