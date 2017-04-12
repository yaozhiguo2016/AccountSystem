/**
 * Created by yaozh on 2017/4/10.
 */
let express = require('express');
let userDao = require('../lib/db/mysql/dao/userDao');
let router = express.Router();

/**
 * 查询当前用户的状态，包括是否登录，是否匿名等
 */
router.get('/state', (req, res, next)=>{
    if (req.session.user){
        userDao.getUserByName(req.session.user, (err, user)=>{
            if (user){
                console.log(JSON.stringify(user));
                if (user.email && user.password){
                    res.send({code:200, msg:'login', user:user});
                }else {
                    res.send({code:201, msg:'anonymous', user:user});
                }

            }else {
                console.log(err);
                res.send({code:400, msg:'unknown error'});
            }
        });
    }else{
        res.send({code:500, msg:'offline'});
    }
});

/**
 * 根据用户名查询账户信息（页面访问）
 */
router.get('/info', (req, res, next)=>{
    let msg = req.query;//req.body;
    console.log('query-info param object:', msg);
    userDao.getUserByName(msg.name, (err, user)=>{
        if (user){
            console.log(JSON.stringify(user));
            res.render('user', {code:200,user:user});
        }else {
            console.log(err);
            res.render('user', {code:404, user:{name:'null',email:'null',createTime:'0'}});
        }
    });
});

/**
 * 根据用户名查询账户信息
 */
router.get('/name', (req, res, next)=>{
    let msg = req.query;//req.body;
    console.log('query-name param object:', msg);
    if (!msg.name || msg.name.length == 0){
        res.send({code:400});
        return;
    }
    userDao.getUserByName(msg.name, (err, user)=>{
        console.log(err);
        if (user){
            res.send({code:200,user:user});
        }else {
            res.send({code:404});
        }
    });
});

/**
 * 根据邮件查询账户信息
 */
router.get('/email', (req, res, next)=>{
    let msg = req.query;//req.body;
    console.log('query-email param object:', msg);
    if (!msg.email || msg.email.length == 0){
        res.send({code:400});
        return;
    }
    userDao.getUserByEmail(msg.email, (err, user)=>{
        console.log(err);
        if (user){
            res.send({code:200,user:user});
        }else {
            res.send({code:404});
        }
    });
});

module.exports = router;