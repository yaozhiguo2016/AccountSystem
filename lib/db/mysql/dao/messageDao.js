/**
 * Created by yaozh on 2017/4/11.
 * 用户留言的数据模型
 */
const mysql = require('../mysql-client');
const messageDao = module.exports;

messageDao.createMessage = function(id, name, email, message, callback){
    const sql = 'insert into message (mail_id, guest_name, guest_mail, mail_content, createTime) values(?,?,?,?,?)';
    const loginTime = Date.now();
    const args = [id, name, email, message, loginTime];
    mysql.insert(sql, args, function(err,res){
        if(err !== null){
            callback({code: err.number, msg: err.message}, null);
        } else {
            const insertId = res.insertId;

            const mail = {
                id: id,
                name: name,
                email:email,
                content: message,
                createTime:loginTime
            };
            callback(null, mail);
        }
    });
};

messageDao.getMessages = function(callback){
    const sql = 'select * from  message';
    const args = [];
    mysql.query(sql,args,function(err, res){
        if(err !== null){
            callback(err.message, null);
        } else {
            if (!!res) {
                //var rs = res[0];
                //var user = {id: rs.id, name: rs.name, password: rs.password, email: rs.email, createTime:rs.createTime};
                callback(null, res);
            } else {
                callback(' message not exist ', null);
            }
        }
    });
};