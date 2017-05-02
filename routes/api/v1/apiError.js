/**
 * Created by yaozh on 2017/4/26.
 */

function createAPIError(code, msg){
    let error = new Error(msg);
    error.error_code = code;
    error.error_message = msg;
    return error;
}

module.exports = createAPIError;

