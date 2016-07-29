// Copyright IBM Corp. 2014,2015. All Rights Reserved.
// Node module: loopback-example-user-management
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT
//
//
// 127.0.0.1：3000有简单的web页面
var AV = require('leancloud-storage');
var config = require('../../server/config.json');
var path = require('path');

var APP_ID = 'DINSYC4JEYthPaAmI0aXOiRW-gzGzoHsz';
var APP_KEY = 'DSVRLT2YNoAOgzdwYzFhAcLD';
AV.init({
  appId: APP_ID,
  appKey: APP_KEY
});


module.exports = function(user) {
  //一个用户直接创建一个用户
  user.createUserWithUserData = function(data, callback) {
    user.create(data, function(err, inst) {
      if (err) {
        callback(err);
      }
      callback(err, inst);
    });
  };
  // ,root: true 参数直接返回结构体
  user.remoteMethod(
    'createUserWithUserData', {
      accepts: {
        arg: 'user',
        type: 'user',
        http: {
          source: 'body'
        }
      },
      returns: {
        arg: 'user',
        type: 'string',
        root: true
      },
      http: {
        'verb': 'post',
        'path': '/createAuserWithUserData'
      },
    }
  );

  // 很明显kuser数据通过remoteMethod回调传过来的  verify方法是user实例方法
  user.afterRemote(
    'createUserWithUserData',
    function(ctx, kuser, next) {
      console.log('> kuser.afterRemote triggered');
      console.log(kuser.email);
      var options = {
        type: 'email',
        to: kuser.email,
        from: '13165508732@163.com',
        subject: 'Thanks for registering.',
        template: path.resolve(__dirname, '../../server/views/verify.ejs'),
        redirect: '/verified',
        user: kuser
      };
      kuser.verify(options,
        function(err, response) {
          if (err) return next(err);
          console.log('> verification email sent:', response);
          next();
        }
      );
    }
  );



  // 请求发送验证码到用户，请求数据为手机号。{"phoneNum":"13165508732"}
  user.requestSmsCode = function(request, callback) {
    AV.Cloud.requestSmsCode({
      mobilePhoneNumber: request.phoneNum,
      name: '维擎科技有限公司',
      op: '新的验证码',
      ttl: 10
    }).then(function() {
      //发送成功
      callback(null, 'sendOk');

    }, function(err) {
      //发送失败
      callback(err);
    });

  };
  user.remoteMethod(
    'requestSmsCode', {
      accepts: {
        arg: 'phoneNum',
        type: 'phoneNum',
        http: {
          source: 'body'
        }
      },
      returns: {
        arg: 'result',
        type: 'string',
        root: true
      },
      http: {
        'verb': 'post',
        'path': '/requestSmsCode'
      }
    }
  );

  /**
   * 验证用户的验证码正确，需要验证码和手机号{"smsCode":714178,"phoneNum":"13165508732"}
   */
  user.verifySmsCode = function(data, callback) {
    AV.Cloud.verifySmsCode(data.smsCode, data.phoneNum).then(function() {
      //  验证成功
      callback(null, 'verifySmsCode is ok');

    }, function(err) {
      //验证失败
      callback(err);
    });

  };
  // ,root: true 参数直接返回结构体
  user.remoteMethod(
    'verifySmsCode', {
      accepts: {
        arg: 'data',
        type: 'object',
        http: {
          source: 'body'
        }
      },
      returns: {
        arg: 'result',
        type: 'string',
        root: true
      },
      http: {
        'verb': 'post',
        'path': '/verifySmsCode'
      }
    }
  );

  var Kuser = user;
  //验证的时候要确定这个手机号码是对应的用户的,需要验证码，手机号，用户id，新密码
  //{"smsCode":428023,"phoneNum":"13165508732","password":"123456","id":"579a25992dbd647310ffa576"}
  user.rsetPasswordWithSmsCode = function(data, callback) {

    user.find({
      where: {
        'id': data.id
      }
    }, function(err, userArr) {

      if (err) {
        callback(err);
      }

      if (userArr[0].phoneNum.toString() === data.phoneNum) {
        AV.Cloud.verifySmsCode(data.smsCode, data.phoneNum).then(function() {
            //  验证成功
            userArr[0].updateAttributes({
                password: Kuser.hashPassword(data.password)
              },
              function(err, instance) {
                if (err) {
                  callback(err);
                }
                callback(null, 'ok');
              });
          },
          function(err) {
            //验证失败
            callback(err);
          });
      }
    });

  };
  user.remoteMethod(
    'rsetPasswordWithSmsCode', {
      accepts: {
        arg: 'data',
        type: 'object',
        http: {
          source: 'body'
        }
      },
      returns: {
        arg: 'result',
        type: 'string',
        root: true
      },
      http: {
        'verb': 'post',
        'path': '/rsetPasswordWithSmsCode'
      }
    }
  );


  //增加地址，data里面需要用户的id。address信息。
  //{"id":"579a25992dbd647310ffa576", "address":{"city":"beijing","cityCode":1}}
  user.Addaddres = function(data, callback) {

    user.find({
      where: {
        id: data.id
      }
    }, function(err, userArr) {
      if (err) {
        callback(err);
      }
      userArr[0].addresss.create(data.address, function(err, add) {
        if (err) {
          callback(err);
        }
        callback(null, add);
      });
    });

  };
  user.remoteMethod(
    'Addaddres', {
      accepts: {
        arg: 'data',
        type: 'object',
        http: {
          source: 'body'
        }
      },
      returns: {
        arg: 'result',
        type: 'string',
        root: true
      },
      http: {
        'verb': 'post',
        'path': '/Addaddres'
      }
    }
  );




  //send verification email after registration
  user.afterRemote('create', function(context, user, next) {
    console.log('> user.afterRemote triggered');
    console.log(user.email);
    var options = {
      type: 'email',
      to: user.email,
      from: '13165508732@163.com',
      subject: 'Thanks for registering.',
      template: path.resolve(__dirname, '../../server/views/verify.ejs'),
      redirect: '/verified',
      user: user
    };

    user.verify(options, function(err, response) {
      if (err) return next(err);

      console.log('> verification email sent:', response);

      context.res.render('response', {
        title: 'Signed up successfully',
        content: 'Please check your email and click on the verification link ' +
          'before logging in.',
        redirectTo: '/',
        redirectToLinkText: 'Log in'
      });
    });
  });

  //send password reset link when requested
  user.on('resetPasswordRequest', function(info) {
    var url = 'http://' + config.host + ':' + config.port + '/reset-password';
    var html = 'Click <a href="' + url + '?access_token=' +
      info.accessToken.id + '">here</a> to reset your password';

    user.app.models.Email.send({
      to: info.email,
      from: info.email,
      subject: 'Password reset',
      html: html
    }, function(err) {
      if (err) return console.log('> error sending password reset email');
      console.log('> sending password reset email to:', info.email);
    });
  });
};
