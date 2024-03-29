import axios, {AxiosInstance} from "axios";
import backendUrl from "../config/url";

const myAxios: AxiosInstance = axios.create({
    baseURL: `http://${backendUrl}`
});

// 发送请求时携带 cookie
myAxios.defaults.withCredentials = true;

// 添加请求拦截器
myAxios.interceptors.request.use(function (config) {
    // 在请求发送前执行的任务
    console.log('请求已发送');
    return config;
}, function (error) {
    // 处理请求错误
    return Promise.reject(error);
});

// 添加响应拦截器
myAxios.interceptors.response.use(function (response) {
    // 处理响应数据
    console.log('接收到响应数据\n', response);
    // 未登录
    if (response?.data?.code === 40100) {
        const redirectUrl = window.location.href;
        window.location.href = `/?redirect=${redirectUrl}&isLogin=1`;
    }

    // return response.data;  // SearchResultPage 会出问题
    return response;
}, function (error) {
    // 处理响应错误
    console.log('响应出错');
    return Promise.reject(error);
});

export default myAxios;
