#loopback-example-user-management
```
$ cd user-management
$ npm install
$ node .
```

######Notes
- 短信部分需要leancloud的短信服务，填上app的key和appId就可以了（user.js）
- 邮箱部分需要填写自己的邮箱账号密码--（datasources.js)
- localhost:3000 有一个简单的登录注册页面，只能在上面进行邮箱注册和验证。
- 只是基本实现了几个小功能，权限和对应的验证等等都没有做，进一步的使用mongose在另外一个项目里
