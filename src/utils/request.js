/**
 * request 网络请求工具
 * 更详细的api文档: https://bigfish.alipay.com/doc/api#request
 */
import {extend} from 'umi-request';
import {message} from 'antd';
import * as cache from "./cache";
import {CONSTANT} from "@/utils/constant";
import {history} from '@@/exports';


const codeMessage = {
  200: '服务器成功返回请求的数据。',
  201: '新建或修改数据成功。',
  202: '一个请求已经进入后台排队（异步任务）。',
  204: '删除数据成功。',
  400: '发出的请求有错误，服务器没有进行新建或修改数据的操作。',
  401: '用户没有权限（令牌、用户名、密码错误）。',
  403: '当前用户权限不够，无法操作此功能。',
  404: '发出的请求针对的是不存在的记录，服务器没有进行操作。',
  406: '请求的格式不可得。',
  410: '请求的资源被永久删除，且不会再得到的。',
  422: '当创建一个对象时，发生一个验证错误。',
  500: '服务器发生错误，请联系管理员。',
  502: '网关错误。',
  503: '服务不可用，服务器暂时过载或维护。',
  504: '网关超时。',
};

/**
 * 异常处理程序
 */
const errorHandler = error => {
  console.log(34, 'error', error)
  const {response = {}} = error;
  if (!response) {
    if (error) {
      return;
    }
    message.error('请求未响应');
    return;
  }
  const errorText = codeMessage[response.status] || response.statusText;
  const {status, url} = response;

  if (status === 400) {
    message.error(errorText);
    return;
  }
  if (status === 401) {
    history.push("/login");
    return;
  }
  // environment should not be used
  if (status === 403) {
    message.error(errorText);
    return;
  }
  if (status <= 504 && status > 500) {
    console.log(70, 'message');
    message.error(errorText);
    return;
  }
  if (status >= 404 && status < 422) {
    message.error(errorText);
  }

};

export const BASE_URL = window._env_.API_URL || API_URL;
export const ERD_BASE_URL = window._env_.ERD_API_URL || API_URL;

/**
 * 配置request请求时的默认参数
 */
const request = extend({
  prefix: BASE_URL,
  errorHandler, // 默认错误处理
});
/**
 * 配置request请求时的默认参数
 */
const request_erd = extend({
  prefix: ERD_BASE_URL,
  errorHandler, // 默认错误处理
});


request.interceptors.request.use((url, options) => {
  // let params = (new URL(document.location)).searchParams;
  // let projectId = params.get(CONSTANT.PROJECT_ID);
  if (url.indexOf('/oauth/token') < 0) {
    const authorization = cache.getItem('Authorization');
    const projectId = cache.getItem(CONSTANT.PROJECT_ID);
    if (authorization) {
      options.headers = {
        ...options.headers,
        projectId: projectId,
        'Authorization': `Bearer ${authorization}`
      }
      return (
        {
          options: {
            ...options,
            interceptors: true,
          },
        }
      );
    }
  } else {
    options.headers = {
      ...options.headers,
      'Authorization': 'Basic Y2xpZW50MjoxMjM0NTY='
    }
    return (
      {
        options: {
          ...options,
          interceptors: true,
        },
      }
    );
  }
  return (
    {
      options: {
        ...options,
        interceptors: true,
      },
    }
  );
});


// clone response in response interceptor
request.interceptors.response.use(async (response, options) => {
  if (options.responseType === 'blob') {
    return response;
  }
  const data = await response.clone().json();
  if (data) {
    const {code, msg} = data;
    if (code && code !== 200) {
      const errorText = msg || codeMessage[code];
      const { url } = options;
      /**
       * match the error code to silent the error message
       * /ncnb/connector/dbversion
       * /ncnb/connector/dbsync
       * /ncnb/hisProject/save
       */
        if (!['/ncnb/connector/dbversion', '/ncnb/hisProject/save', '/ncnb/connector/dbsync'].includes(url)) {
            message.error(errorText);
        }
    }
  }
  return response;
});


export const logout = () => {
  request("/auth/exit", {
    method: 'POST',
  });
  cache.setItem(CONSTANT.PROJECT_ID, "");
  cache.setItem('licence', "");
  history.push("/login");
}

export {request_erd};
export default request;
