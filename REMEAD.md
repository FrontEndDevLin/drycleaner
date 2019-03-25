# 洗衣店后台管理系统

## 开发技术
> Vue + Element-ui + Node.js + Mysql

## 数据库设计 Mysql
```
    Table Member(   // 成员
        _id: number,
        name: string,
        gender: number,
        phone: number,
        email: string,
        level: number,
        pwd: md5(string),
        avatar: string,
        store: number,
        rgt: date,
        del: boolean
    );

    Table Store(    // 分店
        _id: number,
        name: string,
        del: boolean
    );

    Table Vip(  // 会员
        _id: number,
        name: string,
        phone: number,
        gender: number,
        rgt: date,
        count: number,   // 积分
        del: boolean
    );

    Table Orderform(    // 订单
        _id: number,
        ordernum: number,
        user: string,
        phone: number,
        accept: number, // 受理人
        accepted: boolean,
        accepttime: date,
        complete: boolean,
        del: boolean
    );

    Table Commodit(     // 价格表
        _id: number,
        title: string,
        price: number,
        type: number,
        del: boolean
    );

    Table Clothes(
        _id: number,
        type: number,
        mark: string,
        color: string,
        vipid: number,
        del: boolean
    );

    Table Recyclebin(
        _id: number,
        from: string,
        type: number,
        fromid: number,
        time: date
    );

    Table Config(
        _id: number,
        logo: string,
        title: string,
        page404: string
    )
```

## API
登录
```
    http://192.168.2.108:4449/auth/login
    method: post
    param: {
        phone: 
        pwd:
    }
    withCredentials: true
```

检查登录
```
    http://192.168.2.108:4449/auth/checklogin
    method: post,
    withCredentials: true
```

注销
```
    http://192.168.2.108:4449/auth/logout
    method: post,
    withCredentials: true
```

个人信息
```
    http://192.168.2.108:4449/auth/getselfinfo
    method: get,
    withCredentials: true
```

添加会员
```
    http://192.168.2.108:4449/vip/addvip
    method: post,
    param: {
        name: string,
        phone: number
    }
```

会员列表
```
    http://192.168.2.108:4449/vip/getviplist
    method: get,
    param: {
        pno,    // 当前页码 不传的话默认1
        field,  // 排序字段 有 'rgt'和'count'(注册时间，积分) 两种选择 不传默认为'rgt'
        sort    // 排序方式 1或-1 默认为-1(降序)
    }
```

删除会员
```
    http://192.168.2.108:4449/vip/delvip
    method: post,
    param: {
        vid
    }
```

编辑会员
```
    http://192.168.2.108:4449/vip/editvip
    method: post,
    param: {
        newName:
        newPhone:
        newGender
    }
```

添加店铺
```
    http://192.168.2.108:4449/store/addstore
    method: post,
    param: {
        storeName: string 必填
        intro: string 店铺简介 可填
    }
```

店铺列表
```
    http://192.168.2.108:4449/store/getstorelist
    method: get,
    param: {
        pno: number 请求页码，默认为1
    }
```

能否添加员工
```
    http://192.168.2.108:4449/staff/canaddstaff
    method: get,
    param: {
        ident: string 可选 "manager" || "staff"(默认值)
    }
```

添加员工
```
    http://192.168.2.108:4449/staff/addstaff
    method: post,
    param: {
        name: string,
        phone: number/string,
        pwd: string,
        storeId: number,
        gender: number,
        ident: 'staff'(默认员工) / 'manager'
    }
```

获取店长列表
```
    http://192.168.2.108:4449/staff/getmanagerlist
    method: get,
    param: {
        pno: [number] 默认为1
    }
```

获取员工列表
```
    http://192.168.2.108:4449/staff/getstafflist
    method: get,
    param: {
        pno: [number] 默认为1
    }
```

编辑店长资料
```
    http://192.168.2.108:4449/staff/editmanager
    method: post,
    param: {
        id: number,
        newName: string,
        newPhone: number,
        gender: number,
        salary: number,
        indet: [string]     默认为空，传"staff"则降级为员工
    }
```

编辑员工资料
```
    http://192.168.2.108:4449/staff/editstaff
    method: post,
    param: {
        id: number,
        newName: string,
        newPhone: number,
        gender: number,
        salary: number,
        indet: [string]     默认为空，传"manager"则升级为店长
    }
```

删除店长
```
    http://192.168.2.108:4449/staff/delmanager
    method: post,
    param: {
        id: number
    }
```

删除员工
```
    http://192.168.2.108:4449/staff/delstaff
    method: post,
    param: {
        id: number
    }
```

添加价格表项目
```
    http://192.168.2.108:4449/cloth/addcommodit
    method: get
    param: {
        title: '长袖', // unique
        price: 20,   // default 10
        type: 0     // default 0  0代表织物类 基本只有这个
    }
```

获取价格表
```
    http://192.168.2.108:4449/cloth/getpricelist
    method: get,
    param: {
        pno: [number],  // 默认1
        sort: [number],  // 默认-1降序  1是升序
        all: [boolean]       // 默认为false true获取全部
    }
```

删除价格表项目
```
    http://192.168.2.108:4449/cloth/delcommodit
    method: post,
    param: {
        id: number
    }
```

生成订单
```
    http://192.168.2.108:4449/orderform/createform
    method: post,
    param: {
        mark: string,   // 备注
        vipPhone: number, 
        color: string,
        typeId: number  // 对应价格表的id
    }
```

获取订单列表
```
    http://192.168.2.108:4449/orderform/getform
    method: post,
    param: {
        pno: [number] 默认1
        field: [string] 排序字段 默认为'accepttime',可选'acceptStore','price','complete','cpltime',
        select: [string] 要搜索的字段，"user"||"phone"||"ordernum"||"price"||"color"||"acceptStore"||"accepter"||"cpler"
        kw: [string] 搜索的关键字 和select字段要同时出现
    }
```

处理订单列表
```
    http://192.168.2.108:4449/orderform/endform
    method: get,
    param: {
        id: number 订单id, 不是订单号
    }
```

查看库存衣物
```
    http://192.168.2.108:4449/orderform/getstocklist
    method: get,
    param: {
        pno: [number] 默认为1
    }
```


广播给所有人
```
    http://192.168.2.108:4449/inform/noticeofall
    method: get,
    param: {
        title: string,
        content: string
    }
```
广播给店长
```
    http://192.168.2.108:4449/inform/noticeofmanager
    method: get,
    param: {
        title: string,
        content: string,
        managerId: [number] // 不传默认所有店长
    }
```

广播给指定店铺
```
    http://192.168.2.108:4449/inform/noticeofstore
    method: get,
    param: {
        title: string,
        content: string,
        storeId: number
    }
```

广播给自己的员工(店长身份)
```
    http://192.168.2.108:4449/inform/noticeofstaff
    method: get,
    param: {
        title: string,
        content: string
    }
```

获取未读消息数量
```
    http://192.168.2.108:4449/inform/getnoticeCount
    method: get
```

获取消息列表
```
    http://192.168.2.108:4449/inform/getnoticeList
    method: get,
    param: {
        pno: [number] 默认为1
    }
```

已读消息
```
    http://192.168.2.108:4449/inform/readnotice
    method: get,
    param: {
        nid: number
    }
```

编辑店铺
```
    http://192.168.2.108:4449/store/editstore
    method: post,
    param: {
        storeId: number,
        storeName: string,
        intro: string
    }
```


## 功能:
### ~~登录/注销~~

### ~~今日数据统计(echart)~~

### ~~个人信息~~
1. ~~展示~~
2. ~~修改，上传头像~~

### ~~历史数据统计~~

### ~~衣服管理~~
1. ~~查看库存衣物~~
2. ~~价格表~~(~~可添加~~，~~删除~~)

### ~~订单管理~~
1. ~~创建订单~~
2. ~~查看订单~~(~~处理订单~~)

### 会员管理
1. ~~会员列表(可添加会员)~~
2. 优惠促销(根据会员积分)

### ~~店铺管理(仅CEO可见)~~
1. ~~店铺列表~~(~~可修改~~)
2. ~~添加店铺~~

### ~~员工管理~~(~~CEO、店长可见~~)
1. ~~店长管理~~(~~仅CEO可见~~)
2. ~~员工管理~~(~~CEO、店长可见~~) ~~CEO可见全体员工，店长可见所属员工~~

### 系统管理(CEO、店长可见)
1. ~~全体通知(CEO可见)~~
2. ~~店铺通知(CEO、店长可见)~~
3. 网站信息(logo, 标题)

### 回收站
1. 获取列表
2. 恢复和永久删除

### ~~右上角通知~~
1. ~~有新通知时, 右上角闪烁~~

## TODO:
1. 统计加入日期筛选
2. ~~价格表可编辑~~
3. ~~订单~~，员工加入搜索

订单显示 accept -> accepter
