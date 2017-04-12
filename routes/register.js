/**
 * Created by yaozh on 2017/4/8.
 */
let express = require('express');
let userDao = require('../lib/db/mysql/dao/userDao');
let Token = require('../lib/utils/token');
let secret = require('../config/session.json').secret;
let mailConfig = require('../config/mailbox.json');
let router = express.Router();
/**
 * 访问注册页面
 */
router.get('/', (req, res, next)=>{
    res.render('register');
});

/**
 * 创建用户(新用户注册)
 */
router.post('/create-user', (req, res, next)=>{
    let msg = req.body;
    console.log('register param object:', msg);
    if (!msg.name || !msg.password) {
        res.send({code: 500});
        return;
    }
    userDao.createUser(msg.name, msg.password, msg.email, (err, user)=>{
        if (err || !user) {
            console.error(err);
            if (err && err.code === 1062) {
                res.send({code: 501});
            } else {
                res.send({code: 500});
            }
            return;
        }
        //not active
        if (user.state === 0){
            sendActiveMail(user, (result)=>{
                if(result.code == 200){
                    res.send({code:result.code, msg:'active mail send success.'});
                }else{
                    res.send({code:result.code, msg:'active mail send failed.'});
                }
            });
        }else{
            req.session.user = user.name;
            console.log('A new user was created! --' + JSON.stringify(user));
            res.send({code: 200, token: Token.create(user.id, Date.now(), secret), uid: user.id, name:user.name});
        }
    });
});

/**
 * send a mail to who registers a membership to active the corresponding account
 * @param user
 * @param callback
 */
function sendActiveMail(user, callback){

    let nodemailer = require('nodemailer');

    // create reusable transporter object using the default SMTP transport
    let transporter = nodemailer.createTransport({
        service: mailConfig.sender.service,
        auth: {
            user: mailConfig.sender.account,
            pass: mailConfig.sender.password
        }
    });

    // setup email data with unicode symbols
    let linkText = require('../config/domain.json').host + '/register/active?code=' + user.validateCode +
        '&id='+ user.id +
        '&createTime=' + user.createTime +
        '&email=' + user.email;
    let mailOptions = {
        from: '"Stanley" <forsterjacobi2007@163.com>', // sender address
        to: user.email, // list of receivers
        subject: 'active mail', // Subject line
        text: 'active your account', // plain text body
        html: '<b><div>Please click the link to activate your account:</div></br><a href="' +
            linkText + '">'+linkText+'</a></b>' // html body
    };

    // send mail with defined transport object
    transporter.sendMail(mailOptions, (error, info) => {
        if (error) {
            console.log(error);
            callback({code:402});
            return;
        }
        console.log('Message %s sent: %s', info.messageId, info.response);
        callback({code:200});
    });
}

/**
 * 通过点击激活邮件中的链接，激活对应的账户
 */
router.get('/active', (req, res, next)=>{
    let msg = req.query;
    userDao.getUserByEmail(msg.email, (err, user)=>{
        console.log(err, user);
        if (user){
            if (user.state === 1){
                res.send({code:304, msg:'account is already activated.'});
                return;
            }
            let time = Date.now();
            if (time - user.createTime > 48 * 3600 * 1000){//expired
                res.send({code:408, msg:'active code expired'});
                return;
            }
            console.log(msg);
            if (user.validateCode == msg.code && user.id == msg.id){
                userDao.activeUser(user.id, (result)=>{
                    if (result){
                        res.send({code:200, msg:'congratulations! you have activate your account successfully!'});
                    }
                });
            }
        }else{
            res.send({code:404, msg:'user not found.'});
        }
    });
});

/**
 * 匿名注册(游客登录)
 */
router.post('/anonymous', (req, res, next)=>{
    userDao.createAnonymous('anonymous', 0, (err ,user)=>{
        if (err || !user) {
            console.error(err);
            if (err && err.code === 1062) {
                res.send({code: 501});
            } else {
                res.send({code: 500});
            }
            return;
        }
        if (user){
            req.session.user = user.name;
            console.log('A anonymous user was created! --' + JSON.stringify(user));
            res.send({code: 200, token: Token.create(user.id, Date.now(), secret), uid: user.id, name:user.name});
        }
    });
});

/**
 * 绑定匿名账户：把匿名的账户信息填充齐全
 */
router.post('/bind-anonymous', (req, res, next)=>{
    let msg = req.body;
    console.log('bind param object:', msg);
    if (!msg.name || !msg.password) {
        res.send({code: 500});
        return;
    }
    userDao.bindAnonymous(msg.id, msg.name, msg.password, msg.email, (err, user)=>{
        if (err || !user) {
            console.error(err);
            if (err && err.code === 1062) {
                res.send({code: 501});
            } else {
                res.send({code: 500});
            }
            return;
        }
        //not active
        if (user.state === 0){
            sendActiveMail(user, (result)=>{
                if(result.code == 200){
                    res.send({code:result.code, msg:'active mail send success.'});
                }else{
                    res.send({code:result.code, msg:'active mail send failed.'});
                }
            });
        }else{
            req.session.user = user.name;
            console.log('user was bind! --' + JSON.stringify(user));
            res.send({code: 200, token: Token.create(user.id, Date.now(), secret), uid: user.id, name:user.name});
        }
    });
});

module.exports = router;