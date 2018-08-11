import * as types from './mutation-types';

const matations = {
    // 改变歌手的数据
    [types.SET_SINGER](state, singer) {
        state.singer = singer;
    },
    // 改变播放状态
    [types.SET_PLAYING_STATE](state, flag) {
        state.playing = flag;
    },
    // 最小化
    [types.SET_FULL_SCREEN](state, flag) {
        state.fullScreen = flag;
    },
    // 改变播放列表
    [types.SET_PLAYLIST](state, list) {
        state.playlist = list;
    },
    // 改变顺序播放列表
    [types.SET_SEQUENCE_LIST](state, list) {
        state.sequenceList = list;
    },
    // 改变播放类型
    [types.SET_PLAY_MODE](state, mode) {
        state.mode = mode;
    },
    // 改变播放位置
    [types.SET_CURRENT_INDEX](state, index) {
        state.currentIndex = index;
    },
    // 推荐歌单
    [types.SET_DISC](state, disc) {
        state.disc = disc;
    },
    // 排行榜歌曲
    [types.SET_TOP_LIST](state, topList) {
        state.topList = topList;
    },
    // 搜索记录
    [types.SET_SEARCH_HISTORY](state, history) {
        state.searchHistory = history;
    },
    [types.SET_PLAY_HISTORY](state, history) {
        state.playHistory = history;
    },
    [types.SET_FAVORITE_LIST](state, list) {
        state.favoriteList = list;
    }
};

export default matations;