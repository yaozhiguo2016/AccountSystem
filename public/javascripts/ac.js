/**
 * Created by yaozh on 2017/4/13.
 */
var AC = AC || {};

AC.host = 'http://localhost:3000';

/**
 * 登录状态跳转：已登录，跳入信息界面，未登录则跳入登录界面
 */
AC.loginDirect = function(){
    var loginText = document.getElementById('loginA').innerHTML;
    if (loginText == 'login'){
        window.location.assign(AC.host + '/login');
    }else{
        window.location.assign(AC.host + '/user/info?name=' + loginText);
    }
};

/**
 * 请求登录
 * @returns {boolean}
 */
AC.requestLogin = function(){
    var email = $('#emailInput').val();
    var psd = $('#psdInput').val();
    if (!psd || psd.length === 0)return false;
    var md5 = $.md5(psd);
    $.ajax({
        //contentType:'application/json;charset=UTF-8',
        type: 'POST',
        url: AC.host + "/login/entry",
        data:{email:$('#emailInput').val(), password:md5},
        success: function(data){
            console.log(data);
            if (data.code === 200) {
                window.location.assign(AC.host);
            } else if(data.code != 200 && data.msg){
                alert(data.msg);
            } else{
                alert('login failed！');
            }
        },
        error:function(e){
            console.log(e);
        },
        dataType:'json',
        xhrFields: {withCredentials: true},
    });
};

/**
 * 请求注册
 * @returns {boolean}
 */
AC.requestRegister = function(){
    //是否同意条款
    var isCheck = $('#agreeCheckbox').val();
    if (!isCheck)return false;
    //密码是否一致
    var pv1 = $('#psdInput1').val();
    var pv2 = $('#psdInput2').val();
    if (!pv1 || pv1.length === 0)return false;
    if (pv1 != pv2)return false;
    if (!AC.namestate || !AC.emailstate)return false;
    var md5 = $.md5(pv1);
    $.ajax({
        //contentType:'application/json;charset=UTF-8',
        type: 'POST',
        url: AC.host + "/register/create-user",
        data:{name:$('#nameInput').val(), email:$('#emailInput').val(), password:md5},
        success: function(data){
            console.log(data);

            if (data.code === 501) {
                alert('Username already exists！');
            } else if (data.code === 200) {
                window.location.assign(AC.host);
            } else {
                alert('Register fail！');
            }
        },
        error:function(e){
            console.log(e);
        },
        dataType:'json',
        xhrFields: {withCredentials: true},
    });
};

AC.namestate = false;
AC.emailstate = false;

/**
 * 验证用户名的唯一性
 */
AC.checkUser = function(){
    console.log('userName check blur!');
    $.ajax({
        contentType:'application/json;charset=UTF-8',
        type: 'GET',
        url: AC.host + "/user/name",
        //data: $('#dataForm').serialize(),
        data:{name:$('#nameInput').val()},
        success: function(data){
            console.log(data);
            if (data['code'] == 404){
                $('#usernameLabCheck').html('名字可用');
                AC.namestate = true;
            }else{
                $('#usernameLabCheck').html('名字不可用');
                AC.namestate = false;
            }
        },
        error:function(xhr, e, eo){
            console.log(e);
        },
        complete:function(e){
            console.log(e);
        },
        dataType:'json',
        processData:true
    });

    /*$.get(host + "register/query-name?name="+$('#nameInput').val(), (data, status)=>{
     console.log(data, status);
     });*/
};

/**
 * 验证邮件的唯一性
 */
AC.checkEmail = function(){
    console.log('email check blur!');
    $.ajax({
        contentType:'application/json;charset=UTF-8',
        type: 'GET',
        url: AC.host + "/user/email",
        //data: $('#dataForm').serialize(),
        data:{email:$('#emailInput').val()},
        success: function(data){
            console.log(data);
            if (data['code'] == 404){
                $('#emailLabCheck').html('邮箱可用');
                AC.emailstate = true;
            }else{
                $('#emailLabCheck').html('邮箱不可用');
                AC.emailstate = false;
            }
        },
        error:function(xhr, e, eo){
            console.log(e);
        },
        complete:function(e){
            console.log(e);
        },
        dataType:'json',
        processData:true
    });
};

/**
 * 登出
 */
AC.logout = function(){
    $.ajax({
        contentType:'application/json;charset=UTF-8',
        type: 'GET',
        url: AC.host + "/login/out",
        //data: $('#dataForm').serialize(),
        //data:{name:loginText},
        success: function(data){
            console.log(data);
            if (data.code == 200){
                window.location.assign(AC.host);
            }
        },
        error:function(xhr, e, eo){
            console.log(e);
        },
        complete:function(e){
            console.log(e);
        },
        dataType:'json',
        processData:true
    });
};

AC.resetUser = function(){
    var p1 = $('#reg_passw').val();
    var p2 = $('#reg_repassw').val();
    if (p1 != p2)return alert('密码不匹配！');
    if (p1.length < 1 || p2.length < 1)return alert('密码非法');
    var md5 = $.md5(p1);
    var md52 = $.md5(p2);
    $.ajax({
        //contentType:'application/json;charset=UTF-8',
        type: 'POST',
        url: AC.host + "/forget/update_profile",
        data:{reg_nickname:$('#reg_nickname').val(), reg_email:$('#reg_email').val(), reg_passw:md5,reg_repassw:md52},
        success: function(data){
            console.log(data);

            if (data.code === 442) {
                alert(data.msg);
            } else if (data.code === 200) {
                window.location.assign(AC.host);
            } else {
                alert('update fail！');
            }
        },
        error:function(e){
            console.log(e);
        },
        dataType:'json',
        xhrFields: {withCredentials: true},
    });
};