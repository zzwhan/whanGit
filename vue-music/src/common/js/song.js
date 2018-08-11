// import { reject } from "when";
import {getLyric} from '../../api/song';
import {ERR_OK} from '../../api/config';
import {Base64} from 'js-base64';

// 歌曲类
export default class Song {
  constructor({id, mid, singer, name, album, duration, image, url}) {
    this.id = id;
    this.mid = mid;
    this.singer = singer;
    this.name = name;
    this.album = album;
    this.duration = duration;
    this.image = image;
    this.url = url;
  };
  getLyric() {
    if (this.lyric) {
      return Promise.resolve(this.lyric);
    }
    return new Promise((resolve, reject) => {
      getLyric(this.mid).then((res) => {
        if (res.retcode === ERR_OK) {
          // base64解码
          this.lyric = Base64.decode(res.lyric);
          // console.log(this.lyric);
          resolve(this.lyric);
        } else {
          reject(new Error('no lyric'));
        }
      });
    });
  }
}
// 初始化歌曲类

export function createSong(musicData) {
  // const fileName = `C400${musicData.songmid}.m4a`;
  // const vKey = res.data.items[0].vkey;
  // const t = new Date().getUTCMilliseconds()
  // const guid = (Math.round(2147483647 * Math.random()) * t) % 1e10;
  return new Song({
    id: musicData.songid,
    mid: musicData.songmid,
    singer: filterSinger(musicData.singer),
    name: musicData.songname,
    album: musicData.albumname,
    duration: musicData.interval,
    image: `https://y.gtimg.cn/music/photo_new/T002R300x300M000${musicData.albummid}.jpg?max_age=2592000`,
    url: `http://ws.stream.qqmusic.qq.com/C100${musicData.songmid}.m4a?fromtag=0&guid=126548448`
  });
}
// 处理一首歌多个歌手，转化成字符串数组
function filterSinger(singer) {
  let ret = [];
  if (!singer) {
    return '';
  }
  singer.forEach((s) => {
    ret.push(s.name);
  });
  return ret.join('/');
}
