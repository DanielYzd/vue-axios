import axios from 'axios';
import qs from 'qs';
import { Message } from 'element-ui';
import { Loading } from 'element-ui';
//跨域请求
axios.defaults.withCredentials = true

let loading

function startLoading() {
  loading = Loading.service({
    lock: true,
    text: '加载中……',
    // spinner: 'el-icon-loading',
    background: 'rgba(0, 0, 0, 0.7)'
  })
}

function endLoading() {
  loading.close()
}
let needLoadingRequestCount = 0

export function showFullScreenLoading() {
  if (needLoadingRequestCount === 0) {
    startLoading()
  }
  needLoadingRequestCount++
}

export function tryHideFullScreenLoading() {
  if (needLoadingRequestCount <= 0) return
  needLoadingRequestCount--
  if (needLoadingRequestCount === 0) {
    endLoading()
  }
}
axios.interceptors.request.use(config => {
	console.log(config);
  if (config.showLoading != false) {
    showFullScreenLoading()
  }

  return config
}, error => {
  return Promise.reject(error)
})

axios.interceptors.response.use(response => {
  tryHideFullScreenLoading()
  return response
}, error => {
  tryHideFullScreenLoading()
  return Promise.reject(error)
})

function successState(res) {
  if (res.data.returnCode != "0") {
    Message({ message: res.data.errorMessage, type: "error" });
  }
}

function errorState(error) {
  // 如果http状态码正常，则直接返回数据
  if (error && (error.status === 200 || error.status === 304 || error.status === 400)) {
    return response
    // 如果不需要除了data之外的数据，可以直接 return response.data
  } else {
    Message({
      message: '网络连接超时,请检查网络',
      type: 'error'
    });
    return error;
  }
}
const httpServer = (opts, data) => {
  let Public = { //公共参数
    xxxx: 'test'
  }
  data = Object.assign(Public, data);
  let httpDefaultOpts = {
    method: opts.method,
    url: opts.url,
    showLoading:opts.showLoading,
    timeout: 4000,
    data: JSON.stringify(data),
    params: data,
    headers: opts.method == 'get' ? {
      'Content-Type': 'application/x-www-form-urlencoded',
      'X-Requested-With': 'XMLHttpRequest',
    } : {
      "Accept": "application/json",
      'X-Requested-With': 'XMLHttpRequest',
      "Content-Type": "application/json; charset=UTF-8"
    }
  };
  if (opts.method == 'get') {
    delete httpDefaultOpts.data;
  } else {
    delete httpDefaultOpts.params;
  }

  let promise = new Promise((resolve, reject) => {
    axios(httpDefaultOpts).then(
      res => {
        successState(res)
        resolve(res)
      }
    ).catch(error => {
      errorState(error)
      reject(error)
    })
  })

  return promise;
}
export default httpServer
