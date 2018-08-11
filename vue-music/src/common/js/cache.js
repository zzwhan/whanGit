import storage from 'good-storage';

// 缓存的key
const SEARCH_KEY = '__search__';
// 缓存最多的数据长度
const SEARCH_MAX_LEN = 15;

// 播放历史记录
const PLAY_KEY = '__play__';
const PLAY_MAX_LEN = 200;

const FAVORITE_KEY = '__favorite__';
const FAVORITE_MAX_LEN = 200;

// 添加到本地时，对数组的处理
function insertArray(arr, val, compare, maxLen) {
  // 判断搜索的数据是否在数组里
  const index = arr.findIndex(compare);
  // 如果在第一个数据，就直接返回
  if (index === 0) {
    return;
  }
  // 如果在数组里且不是第一个，就删掉该元素，添加到第一个元素上
  if (index > 0) {
    arr.splice(index, 1);
  }
  arr.unshift(val);
  // 如果超过数组最大长度，直接删掉最后一个元素
  if (maxLen && arr.length > maxLen) {
    arr.pop();
  }
}
// 删掉本地数据，对数组的处理
function deleteFromArray(arr, compare) {
  const index = arr.findIndex(compare);
  // 如果该数组存在时，删除该元素
  if (index > -1) {
    arr.splice(index, 1);
  }
}

// 保存数据到本地中，利用good-storage
export function saveSearch(query) {
  let searches = storage.get(SEARCH_KEY, []);
  insertArray(searches, query, (item) => {
    return item === query;
  }, SEARCH_MAX_LEN);
  storage.set(SEARCH_KEY, searches);
  return searches;
}

// 删除在本地的数据
export function deleteSearch(query) {
  let searches = storage.get(SEARCH_KEY, []);
  deleteFromArray(searches, (item) => {
    return item === query;
  });
  storage.set(SEARCH_KEY, searches);
  return searches;
}

// 清空缓存在本地的数据
export function clearSearch() {
  storage.remove(SEARCH_KEY);
  return [];
}

// 加载localStorage
export function loadSearch() {
  return storage.get(SEARCH_KEY, []);
}

export function savePlay(song) {
  let songs = storage.get(PLAY_KEY, []);
  insertArray(songs, song, (item) => {
    return song.id === item.id;
  }, PLAY_MAX_LEN);
  storage.set(PLAY_KEY, songs);
  return songs;
}

export function loadPlay() {
  return storage.get(PLAY_KEY, []);
}

export function saveFavorite(song) {
  let songs = storage.get(FAVORITE_KEY, []);
  insertArray(songs, song, (item) => {
    return song.id === item.id;
  }, FAVORITE_MAX_LEN);
  storage.set(FAVORITE_KEY, songs);
  return songs;
}

export function deleteFavorite(song) {
  let songs = storage.get(FAVORITE_KEY, []);
  deleteFromArray(songs, (item) => {
    return item.id === song.id;
  });
  storage.set(FAVORITE_KEY, songs);
  return songs;
}

export function loadFavorite() {
  return storage.get(FAVORITE_KEY, []);
}
