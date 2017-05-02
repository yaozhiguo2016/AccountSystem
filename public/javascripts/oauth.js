/**
 * Created by yaozh on 2017/4/26.
 */
var Auth = Auth || {};

Auth.host = 'http://localhost:3000';
Auth.user = '0001';
Auth.appId = 'app001';
Auth.redirectUrl = 'http://localhost:3000';
Auth.secret = 'abc';
Auth.authorizationCode = '';
Auth.access_token = '';

Auth.authorizePost = function(){
    $.ajax({
        //contentType:'application/json;charset=UTF-8',
        type: 'POST',
        url: Auth.host + "/oauth2/v1/authorize",
        data:{client_id:Auth.appId, redirect_uri:Auth.redirectUrl},
        //data:getSearchObj(),
        success: function(data){
            console.log(data);

            if (data.code === 501) {
                alert('Username already exists！');
            } else if (data.code === 200) {
                Auth.authorizationCode = data.authcode;
                window.location.assign(data.redirectUrl);
            } else {
                alert('authorize fail！');
            }
        },
        error:function(e){
            console.log(e);
        },
        dataType:'json',
        xhrFields: {withCredentials: true},
    });
};

function getSearchObj(){
    var  qs = location.search.length>0 ? location.search.substr(1):'',
        args = {},
        items = qs.length>0 ? qs.split('&'):[],
        item = null,name = null,value = null,i = 0,len = items.length;

    for(i = 0;i < len; i++){
        item = items[i].split('=');
        name = decodeURIComponent(item[0]);
        value = decodeURIComponent(item[1]);

        if(name.length){
            args[name] = value;
        }
    }

    return args;
}