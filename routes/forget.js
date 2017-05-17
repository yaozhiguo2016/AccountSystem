/**
 * Created by yaozh on 2017/5/16.
 */
let express = require('express');
let userDao = require('../lib/db/mysql/dao/userDao');
let router = express.Router();
let mailConfig = require('../config/mailbox.json');

module.exports = router;

/**
 * 忘记密码页面
 */
router.get('/', (req, res, next)=>{
    res.render('forget', { error: '邮箱' });
});

/**
 * 重设密码页面
 */
router.get('/newpass', (req, res, next)=>{
    let param = req.query;
    res.render('./newpass', { error: '邮箱',user:{email:param.email, nickname:param.name} });
});

/**
 * 发送客户邮箱，服务器生成连接邮件发送到本邮箱
 */
router.post('/sendmail', (req, res, next)=>{

    console.log(req.body);
    userDao.getUserByEmail(req.body.email, (err, user)=>{
        if (err){
            console.log(err);
            res.send(err);
        }else{
            sendResetMail(user, (result)=>{
                if(result.code == 200){
                    res.send('OK, a mail had been sent to you, please click the link in the ' +
                        'mail content to reset your information.');
                    //res.send({code:result.code, msg:'reset mail send success.'});
                }else{
                    res.send({code:result.code, msg:'reset mail send failed.'});
                }
            });
        }
    });
});

function sendResetMail(user, callback){
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

    let linkText = require('../config/domain.json').host + '/forget/newpass?email=' + user.email + '&name=' + user.name;
    let mailOptions = {
        from: '"Stanley" <forsterjacobi2007@163.com>', // sender address
        to: user.email, // list of receivers
        subject: 'reset mail', // Subject line
        text: 'reset your account', // plain text body
        html: '<b><div>Please click the link to reset your account:</div></br><a href="' +
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
 * 更新账户资料
 */
router.post('/update_profile', (req, res, next)=>{
    console.log(req.body);
    let reg_email = req.body.reg_email;
    let reg_name = req.body.reg_nickname;
    let reg_pass = req.body.reg_passw;
    let reg_repass = req.body.reg_repassw;
    if (reg_pass.length < 32 || reg_repass.length < 32){
        res.send({code:442,msg:'password\'s length required.'});
    }else if(reg_pass != reg_repass){
        res.send({code:442,msg:'2 passwords are not matched.'});
    }else{
        userDao.resetUserByEmail(reg_email, reg_name, reg_repass, (err, user)=>{
            if (err){
                console.log(err);
                res.send({code:500, msg:'update failed.'});
            }else{
                res.send({code:200, msg:'OK'});
            }
        });
    }
});