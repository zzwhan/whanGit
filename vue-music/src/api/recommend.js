import jsonp from '../common/js/jsonp';
import {commonParams, options} from './config';
import axios from 'axios';

// 定义方法getRecommend jsonp获取数据
export function getRecommend() {
    const url = 'https://c.y.qq.com/musichall/fcgi-bin/fcg_yqqhomepagerecommend.fcg';

    const data = Object.assign({}, commonParams, {
        platform: 'h5',
        uin: 0,
        needNewcode: 1
    });
    return jsonp(url, data, options);
}
// 定义方法getDiscList 用axios获取数据
export function getDiscList() {
    const url = '/api/getDiscList';

    const data = Object.assign({}, commonParams, {
        platform: 'yqq',
        picmid: 1,
        loginUin: 0,
        hostUin: 0,
        needNewcode: 0,
        categoryId: 10000000,
        sortId: 5,
        sin: 0,
        ein: 29,
        format: 'json',
        rnd: Math.random()
    });
    return axios.get(url, {
        params: data
    }).then((res) => {
        return Promise.resolve(res.data);
    });
}

// 推荐歌单歌曲
// 定义方法getDiscList 用axios获取数据
export function getSongList(disstid) {
    const url = '/api/SongList';

    const data = Object.assign({}, commonParams, {
        disstid,
        type: 1,
        json: 1,
        utf8: 1,
        onlysong: 0,
        platform: 'yqq',
        needNewCode: 0,
        format: 'json',
        hostUin: 0,
        loginUin: 0
    });
    return axios.get(url, {
        params: data
    }).then((res) => {
        return Promise.resolve(res.data);
    });
}