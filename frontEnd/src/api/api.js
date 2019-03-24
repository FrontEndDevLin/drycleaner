import axios from 'axios';
import qs from 'qs';

// let base = '';//域名
let base = 'http://192.168.2.108:4449';//域名test http://192.168.2.108:4449， http://127.0.0.1:4449， http://188.131.187.74:4449
export const requestLogin = params => { return axios.get(`${base}/login`, params).then(res => res.data); };

export const getUserList = params => { return axios.get(`${base}/user/list`, { params: params }); };

export const getUserListPage = params => { return axios.get(`${base}/user/listpage`, { params: params }); };

export const removeUser = params => { return axios.get(`${base}/user/remove`, { params: params }); };

export const batchRemoveUser = params => { return axios.get(`${base}/user/batchremove`, { params: params }); };

export const editUser = params => { return axios.get(`${base}/user/edit`, { params: params }); };

export const addUser = params => { return axios.get(`${base}/user/add`, { params: params }); };


const axiosP = axios.create({
    headers: { 'content-type': 'application/x-www-form-urlencoded' },
    withCredentials: true
});
export const httpGet = (url, data) => {
    return new Promise((resolve, reject) => {
        axiosP.get(base + url, { params: data })
            .then(res => {
                // if (res.data.code == 200) {
                    resolve(res.data);
                // } else {
                //     console.log(res);
                //     alert(res.data.msg);
                // }
            })
            .catch(err => {
                reject(
                    console.log(err, '网络错误，get请求失败'),
                    alert('网络错误，get请求失败')
                )
            })
    })
}
export const httpPost = (url, data) => {
    return new Promise((resolve, reject) => {
        axiosP.post(base + url, qs.stringify(data))
            .then(res => {
                // console.log(1, res)
                // if (res.data.code == 200) {
                    resolve(res.data);
                // } else {
                //     console.log(res);
                //     resolve(res.data);
                //     alert(res.data.msg);
                // }
            })
            .catch(err => {
                reject(
                    console.log(err, '网络错误，post请求失败'),
                    alert('网络错误，post请求失败')
                )
            })
    })
}

/*用户名验证*/
export const checkUser = (user) => {   
    var reg = /^[a-zA-Z][a-zA-Z0-9]{3,15}$/;
    if (reg.test(user) == false) return false;
    return true;
}
/*密码验证*/
export const checkPwd = (pwd) => {
    var reg = /^[a-zA-Z0-9]{4,20}$/;
    if (reg.test(pwd) == false) return false;//"密码不能含有非法字符，长度在4-20之间";
    return true;
}

export const checkRepwd = (pwd,repwd) => {
    if (pwd != repwd) return false;//"两次输入的密码不一致";
    return true;
}

/*验证邮箱*/
export const checkEmail = (email) => {
    var reg = /^\w+@\w+(\.[a-zA-Z]{2,3}){1,2}$/;
    if (reg.test(email) == false) return false;//"Email格式不正确，例如web@sohu.com";
    return true;
}
/*验证手机号码*/
export const checkMobile = (mobile) => {
    var regMobile = /^1\d{10}$/;
    if (regMobile.test(mobile) == false) return false;//"手机号码不正确，请重新输入";
    return true;
}