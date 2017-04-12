/**
 * Created by yaozh on 2017/4/11.
 * 用户留言处理
 */

'use strict';

let express = require('express');
let messageDao = require('../lib/db/mysql/dao/messageDao');
let router = express.Router();
let nodemailer = require('nodemailer');
let mailConfig = require('../config/mailbox.json');

router.post('/send-message', (req, res, next)=>{

    let msg = req.body;
    console.log(msg);
    // create reusable transporter object using the default SMTP transport
    let transporter = nodemailer.createTransport({
        service: mailConfig.sender.service,
        auth: {
            user: mailConfig.sender.account,
            pass: mailConfig.sender.password
        }
    });

    // setup email data with unicode symbols
    let mailOptions = {
        from: '"Stanley" <forsterjacobi2007@163.com>', // sender address
        to: mailConfig.receiver.account, // list of receivers
        subject: 'A mail from a guest', // Subject line
        text: msg.message2, // plain text body
        html: '<b>' + msg.message2 + '</b>' // html body
    };

    // send mail with defined transport object
    transporter.sendMail(mailOptions, (error, info) => {
        if (error) {
            return console.log(error);
        }
        messageDao.createMessage(info.messageId, msg.name2, msg.email2, msg.message2, (err, mail)=>{
            if (mail){
                console.log('A new mail record created:', JSON.stringify(mail));
            }
        });
        console.log('Message %s sent: %s', info.messageId, info.response);
        res.send({code:200});
    });
});

module.exports = router;
