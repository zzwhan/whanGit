// 获取歌手数据
export const singer = state => state.singer;
// 获取播放状态
export const playing = state => state.playing;
// 获取是否最小化
export const fullScreen = state => state.fullScreen;
// 获取播放列表
export const playlist = state => state.playlist;
// 获取顺序播放列表
export const sequenceList = state => state.sequenceList;
// 获取播放类型
export const mode = state => state.mode;
// 获取当前播放位置
export const currentIndex = state => state.currentIndex;
// 获取当前播放歌曲
export const currentSong = (state) => {
  return state.playlist[state.currentIndex] || {};
};

export const disc = state => state.disc;

export const topList = state => state.topList;

export const searchHistory = state => state.searchHistory;

export const playHistory = state => state.playHistory;

export const favoriteList = state => state.favoriteList;