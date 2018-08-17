import jsonp from '../common/js/jsonp';
import {commonParams, options} from './config';
import Axios from 'axios';

// 获取热门标签数据
export function getHotKey() {
  const url = 'https://c.y.qq.com/splcloud/fcgi-bin/gethotkey.fcg';

  const data = Object.assign({}, commonParams, {
    uin: 0,
    needNewCode: 1,
    platform: 'h5'
  });

  return jsonp(url, data, options);
}

// 获取搜索的数据
export function search(query, page, zhida, perpage) {
  const url = '/api/Search';

  const data = Object.assign({}, commonParams, {
    w: query,
    p: page,
    perpage,
    n: perpage,
    g_tk: 1928093487,
    // n: 20,
    catZhida: zhida ? 1 : 0,
    zhidaqu: 1,
    t: 0,
    flag: 1,
    ie: 'utf-8',
    sem: 1,
    aggr: 0,
    remoteplace: 'txt.mqq.all',
    uin: 0,
    needNewCode: 1,
    platform: 'h5'
  });

  return Axios.get(url, {
    params: data
  }).then((res) => {
    return Promise.resolve(res.data);
  });
}
