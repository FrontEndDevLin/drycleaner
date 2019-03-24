import Login from './views/Login.vue'
import NotFound from './views/404.vue'
import Home from './views/Home.vue'
import Main from './views/Main.vue'
import Table from './views/nav1/Table.vue'
import Form from './views/nav1/Form.vue'
import user from './views/nav1/user.vue'
import Page4 from './views/nav2/Page4.vue'
import Page5 from './views/nav2/Page5.vue'
import Page6 from './views/nav3/Page6.vue'
import echarts from './views/charts/echarts.vue'
import indexPage from './views/index/index.vue'
import userPage from './views/user/user.vue'
import historyPage from './views/history/history.vue'
import manageHistory from './views/manage/history.vue'
import manageStock from './views/manage/stock.vue'
import managePrice from './views/manage/price.vue'
import orderPage from './views/order/order.vue'
import memberList from './views/member/list.vue'
import memberFlash from './views/member/flash.vue'
import staff from './views/staff/staff.vue'
import shopowner from './views/staff/shopowner.vue'
import webAll from './views/webAdmin/all.vue'
import webShop from './views/webAdmin/shop.vue'
import webAdvertise from './views/webAdmin/advertise.vue'
import recovery from './views/recovery/recovery.vue'
import shop from './views/shop/shop.vue'
import notice from './views/notice/notice.vue'


let routes = [
    {
        path: '/login',
        component: Login,
        name: '',
        hidden: true
    },
    {
        path: '/404',
        component: NotFound,
        name: '',
        hidden: true
    },

    // start
    {
        path: '/',
        component: Home,
        name: '',
        iconCls: 'fa fa-home',
        leaf: true,//只有一个节点
        children: [
            { path: '/', component: indexPage, name: '首页' }
        ]
    },
    {
        path: '/',
        component: Home,
        name: '',
        iconCls: 'fa fa-user-circle',
        leaf: true,//只有一个节点
        children: [
            { path: '/user', component: userPage, name: '个人资料' }
        ]
    },
    // {
    //     path: '/',
    //     component: Home,
    //     name: '',
    //     iconCls: 'fa fa-history',
    //     leaf: true,//只有一个节点
    //     children: [
    //         { path: '/history', component: historyPage, name: '历史统计' }
    //     ]
    // },
    {
        path: '/',
        component: Home,
        name: '衣物管理',
        iconCls: 'fa fa-asterisk',
        children: [
            { path: '/manage_stock', component: manageStock, name: '库存衣物' },
            { path: '/manage_history', component: manageHistory, name: '历史衣物' },
            { path: '/manage_price', component: managePrice, name: '价格表' },
        ]
    },
    {
        path: '/',
        component: Home,
        name: '',
        iconCls: 'fa fa-reorder',
        leaf: true,//只有一个节点
        children: [
            { path: '/order', component: orderPage, name: '订单管理' }
        ]
    },
    {
        path: '/',
        component: Home,
        name: '会员管理',
        iconCls: 'fa fa-diamond',
        leaf: true,//只有一个节点
        children: [
            { path: '/member_list', component: memberList, name: '会员列表' },
            // { path: '/member_flash', component: memberFlash, name: '优惠促销' }
        ]
    },
    {
        path: '/',
        component: Home,
        name: '',
        iconCls: 'fa fa-university',
        leaf: true,//只有一个节点
        shop:true,
        children: [
            { path: '/shop', component: shop, name: '店铺管理' }
        ]
    },
    {
        path: '/',
        component: Home,
        name: '员工管理',
        iconCls: 'fa fa-anchor',
        staff: true,
        children: [
            { path: '/staff_shopowner', component: shopowner, name: '管理店长',id:9 },
            { path: '/staff_staff', component: staff, name: '管理员工',id:0 }
        ]
    },
    // {
    //     path: '/',
    //     component: Home,
    //     name: '网站管理',
    //     iconCls: 'fa fa-cubes',
    //     children: [
    //         // { path: '/web_advertise', component: webAdvertise, name: '网站信息' },
    //         { path: '/web_all', component: webAll, name: '全体通知' },
    //         { path: '/web_shop', component: webShop, name: '店铺通知' },
    //     ]
    // },
    // {
    //     path: '/',
    //     component: Home,
    //     name: '',
    //     iconCls: 'fa fa-trash',
    //     leaf: true,//只有一个节点
    //     children: [
    //         { path: '/recovery', component: recovery, name: '回收站' }
    //     ]
    // },
    // {
    //     path: '/',
    //     component: Home,
    //     name: '通知',
    //     // iconCls: 'fa fa-cubes',
    //     hidden: true,
    //     children: [
    //         { path: '/notice', component: notice, name: '通知消息' }
    //         // { path: '/web_all', component: webAll, name: '全体通知' },
    //         // { path: '/web_shop', component: webShop, name: '店铺通知' },
    //     ]
    // },
    {
        path: '*',
        hidden: true,
        redirect: { path: '/404' }
    }
];

export default routes;