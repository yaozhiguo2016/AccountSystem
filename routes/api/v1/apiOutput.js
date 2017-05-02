/**
 * Created by yaozh on 2017/4/26.
 * 给API请求增加两个方法：success和error，以供后续操作调用
 */
module.exports = function (req, res, next) {

    res.apiSuccess = function(data){
        res.json({
            status:'OK',
            result:data
        });
    };

    res.apiError = function(err){
        res.json({
            status:'Error',
            error_code:err.error_code || 'UNKNOWN',
            error_message:err.error_message || err.toString()
        });
    };

    next();
};