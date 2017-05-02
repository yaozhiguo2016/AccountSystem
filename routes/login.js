/**
 * Created by yaozh on 2017/4/8.
 */
let express = require('express');
let userDao = require('../lib/db/mysql/dao/userDao');
let Token = require('../lib/utils/token');
let secret = require('../config/session.json').secret;
let router = express.Router();

/**
 * 登录页面
 */
router.get('/', (req, res, next)=>{
    if (req.session.user){
        res.send({code:200, msg:'already login'});
        //res.redirect('../index');
    }else{
        res.render('login');
    }
});

/**
 * 登录处理
 */
router.post('/entry', (req, res, next)=>{
    let msg = req.body;
    console.log('entry param object:', msg);
    if (!msg.email || !msg.password) {
        res.send({code: 500});
        return;
    }
    if (req.session.user){
        //res.render('index', req.session.user);
        res.send({code:200,msg:'session login.'});
        return;
    }
    userDao.getUserByEmail(msg.email, (err, user)=>{
        console.log(err);
        if (user){
            if (user.state === 0){
                res.send({code:402, msg:'account has not been activated'});
                return;
            }
            if (user.password == msg.password){
                req.session.user = user.name;
                res.send({
                    code: 200,
                    msg:'login success.',
                    token: Token.create(user.id, Date.now(), secret),
                    uid: user.id,
                    name:user.name
                });
            }else{
                res.send({code:401,msg:'username and password are not matched.'});
            }
        }else {
            res.send({code:404,msg:'no entity found.'});
        }
    });
});

/**
 * 登出当前账号
 */
router.get('/out', (req, res, next)=>{
    delete req.session.user;
    res.send({code:200});
});

module.exports = router;