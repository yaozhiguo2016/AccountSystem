/**
 * Created by yaozh on 2017/4/26.
 * 把当前账户系统作为其他应用的第三方登录平台，所以本中间件的使用对象是非本平台应用
 * oauth2.0要求传输协议必须使用HTTPS。
 */
let express = require('express');
let router = express.Router();
let apiError = require('./apiError');
let Helper = require('./OAuthHelper');

module.exports = router;

router.use((req, res, next)=>{
    console.log('MIDDLEWARE USED!!!');
    next();
});

let check = {};
//检查用户是否登录
check.checkUserLogin = (req, res, next)=>{
    //先检查用户在网站是否登录，如果没登录则跳转至登录界面，否则保存用户账号:好比在通过qq登录时，先检查qq是否已登录的流程
    //......
    req.user = '0001';
    next();
};

//验证接入本平台的第三方对应的app信息,通过appid去验证是否已登记并且对应的redirect_uri是否正确
check.checkAppInfo = (client_id, redirect_uri, callback)=>{
    if (client_id != 'app001'){
        callback({status:'fail'});
    } else if (client_id == 'app001' && redirect_uri != 'http://localhost:3000'){
        callback(null, false);
    } else {
        callback(null, {app:client_id, uri:redirect_uri});
    }
};

//验证参数是否正确：参数是否存在，参数是否匹配
check.checkAuthorizeParam = (req, res, next)=>{
    let client_id = req.query.client_id || req.body.client_id;
    let redirect_uri = req.query.redirect_uri || req.body.redirect_uri;
    if (!client_id){
        return next(apiError('MISSING_PARAMETER', '缺少参数client_id'));
    }
    if (!redirect_uri){
        return next(apiError('MISSING_PARAMETER', '缺少参数redirect_uri'));
    }
    check.checkAppInfo(client_id, redirect_uri, (err, result)=>{
        if (err){
            return next(apiError('CLIENT_ID_NOT_EXIST', 'app不存在'));
        }
        if (!result){
            return next(apiError('REDIRECT_URI_NOT_MATCHED', redirect_uri));
        }
        req.appInfo = result;
        next();
    });
};

/**
 * 发起授权请求，需要传递的参数有client_id, response_type, redirect_uri
 * 如果成功会弹出确认授权的提示界面
 */
router.get('/authorize', check.checkUserLogin, check.checkAuthorizeParam, (req, res, next)=>{
    res.render('authorize', {user:req.user, app:req.appInfo.app});
});

/**
 * 确认授权，成功会返回授权码
 */
router.post('/authorize', check.checkUserLogin, check.checkAuthorizeParam, (req, res, next)=>{
    console.log(req.user, req.query, req.body);
    Helper.generateAuthorizationCode(req.user, req.body.client_id, req.body.redirect_uri, (err, code)=>{
        if (err)return next(err);
        //res.redirect(200, Helper.addQueryParamToUrl(req.body.redirect_uri), {code:code});
        res.send({redirectUrl:Helper.addQueryParamToUrl(req.body.redirect_uri), code:200, authcode:code});
    });
});

/**
 * 通过授权码获得access_token码，用于后面的验证,需要的参数：client_id, client_secret,redirect_uri, authcode[authorization code]
 */
router.post('/access_token', (req, res, next)=>{
    let client_id = req.body.client_id;
    let client_secret = req.body.client_secret;
    let redirect_uri = req.body.redirect_uri;
    let authcode = req.body.authcode;

    if (!client_id)return next(apiError('MISSING_PARAMETER', '缺少参数client_id'));
    if (!client_secret)return next(apiError('MISSING_PARAMETER', '缺少参数client_secret'));
    if (!redirect_uri)return next(apiError('MISSING_PARAMETER', '缺少参数redirect_uri'));
    if (!authcode)return next(apiError('MISSING_PARAMETER', '缺少参数authcode'));

    Helper.verifyAuthorizationCode(authcode, client_id, client_secret, redirect_uri, (err, userId)=>{
        if (err)return next(err);
        Helper.generateAccessToken(userId, client_id, 3600 * 24, (err, token)=>{
            if (err)return next(err);
            Helper.deleteAuthorizationCode(authcode, (err, authcode)=>{
                if (err)console.log(err);
            });
            res.apiSuccess({accessToken:token, expire:3600 * 24});//有效期1天
        });
    });
});

router.get('/get_token_info', verifyAccessToken, (req, res, next)=>{

});

router.get('/revoke_oauth', verifyAccessToken, (req, res, next)=>{

});

/**
 * 所有的auth API除了 ‘authorize’ 和 ‘access_token’之外 ，都要经过access_token验证,这里是一个验证中间件:
 * 请求中包含的access_token和source[客户端信息]用于和服务器核对验证
 */
function verifyAccessToken(req, res, next){
    let accessToken = req.query.access_token || req.body.access_token;
    let source = req.query.source || req.body.source;
    if (!accessToken)return next(apiError('MISSING_PARAMETER', '缺少参数accessToken'));
    if (!source)return next(apiError('MISSING_PARAMETER', '缺少参数source'));

    //验证access_token是否过期
    if (Helper.getTimeStamp() > Number(accessToken.split('.').pop())){
        return next(apiError('ACCESS_TOKEN_EXPIRED', 'access_token expired'));
    }

    Helper.getAccessTokenInfo(accessToken, (tokenInfo)=>{
        if (!tokenInfo)return next({err:'no token info found'});
        if (source.client_id != tokenInfo.client_id)return next(apiError('INVALID_PARAMETER', '参数source不正确'));
        req.accessTokenInfo = tokenInfo;
        next();
    });
}

router.use((err, req, res, next)=>{
    if (typeof res.apiError === 'function'){
        res.apiError(err);
    }
});