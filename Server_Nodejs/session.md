# 登录流程
```
    服务器初始化一个session map表
    服务器收到登录成功后，
    1. 随机一个session_id，写入session map表中，并存入用户id，level
    2. 服务器返回一个setCookie， httpOnly， 将session_id设置给客户端
    3. 客户端之后的操作都要配置 withCredentials: true
    4. 服务器获取 req.headers.cookie，拿到session_id来判断用户是否登录
```