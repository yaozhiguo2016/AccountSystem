/**
 * Created by yaozh on 2017/4/26.
 */
let URL = require('url');

class OAuthHelper{

    /**
     * 随机字符串
     * @param size
     * @param chars
     * @returns {string}
     */
    static randomString(size, chars){
        size = size || 6;
        let codeString = chars || 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
        let maxNum = codeString.length + 1;
        let newPass = '';
        while (size > 0){

            newPass += codeString.charAt(Math.floor(Math.random() * maxNum));
            size--;
        }
        return newPass;
    }
    /**
     * 生成授权码,用来获取access_token
     */
    static generateAuthorizationCode (userId, appId, redirectUrl, callback){

        let code = this.randomString(20);
        //把userid，appid，redirectUrl存到数据库
        //......
        callback(null, code);
    }

    /**
     * 通过授权码验证userId，generateAuthorizationCode是前置操作
     * @param authcode
     * @param appId
     * @param appSecret
     * @param redirectUri
     * @param callback
     */
    static verifyAuthorizationCode(authcode, appId, appSecret, redirectUri, callback){
        //从数据库中根据code，查找对应的数据，验证appId, appSecret, redirectUri是否正确
        //......
        let userId = '0001';
        callback(null, userId);
    }

    /**
     * 在获取access_token之后，授权码authorizationCode应删除，这个跟generateAuthorizationCode是逆操作
     */
    static deleteAuthorizationCode(authcode, callback){
        //从数据库删除code对应的记录
        //......
        callback(null, authcode);
    }
    /**
     * 在url增加一些参数，并返回新的url
     * @param url
     * @param params
     */
    static addQueryParamToUrl(url, params){
        let info = URL.parse(url, true);
        for (let i in params){
            info.query[i] = params[i];
        }
        delete info.search;
        return URL.format(info);
    }

    /**
     * 生成唯一的access_token,每个access_token均对应一个app_id和userId,
     * 之后的每个api提交，都会先验证app_id和access_token是否一致，再取出userId
     * @param userId
     * @param appId
     * @param expires 设定token的有效期，单位是秒
     * @param callback
     */
    static generateAccessToken(userId, appId, expires, callback){
        let token = this.randomString(20) + '.' + (this.getTimeStamp() + expires);
        //将token，userId，appId存到数据库
        //......
        callback(null, token);
    }

    /**
     * 通过token获取对应的数据库信息
     * @param token
     * @param callback
     */
    static getAccessTokenInfo(token, callback){
        //从数据库中获取token信息
        //oauthDao.getTokenInfo(token, (err, info)=>{
        //    if (err)return null;
        //    callback(info)
        //}
        callback({token:token, client_id:'app001', userId:'0001'});
    }

    /**
     * 获取当前时间戳,单位是秒
     * @returns {Number}
     */
    static getTimeStamp(){
        return parseInt(Date.now() / 1000, 10);
    }
}

module.exports = OAuthHelper;