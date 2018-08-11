import {mapGetters, mapMutations, mapActions} from 'vuex';
import {playMode} from './config';
import {shuffle} from './util';

export const playlistMixin = {
  computed: {
    ...mapGetters([
      'playlist'
    ])
  },
  mounted() {
    this.handlePlaylist(this.playlist);
  },
  activated() {
    this.handlePlaylist(this.playlist);
  },
  watch: {
    playlist(newVal) {
      this.handlePlaylist(newVal);
    }
  },
  methods: {
    // 组件中必须要实现这个方法，要不然就抛出一个异常
    handlePlaylist() {
      throw new Error('component must implement handlePlaylist method');
    }
  }
};

export const playerMixin = {
  computed: {
    // 对应不同的播放模式，显示不同的样式
    iconMode() {
      return this.mode === playMode.sequence ? 'icon-sequence' : this.mode === playMode.loop ? 'icon-loop' : 'icon-random';
    },
    ...mapGetters([
      'sequenceList',
      'playlist',
      'currentSong',
      'mode',
      'favoriteList'
    ])
  },
  methods: {
    // 切换播放模式
    changeMode() {
      const mode = (this.mode + 1) % 3;
      this.setPlayMode(mode);
      let list = null;
      if (mode === playMode.random) {
        list = shuffle(this.sequenceList);
      } else {
        list = this.sequenceList;
      }
      this.resetCurrentIndex(list);
      this.setPlaylist(list);
    },
    resetCurrentIndex(list) {
      let index = list.findIndex((item) => {
        return item.id === this.currentSong.id;
      });
      this.setCurrentIndex(index);
    },
    // 切换收藏
    toggleFavorite(song) {
      if (this.isFavorite(song)) {
        this.deleteFavoriteList(song);
      } else {
        this.saveFavoriteList(song);
      }
    },
    // 获取收藏的样式
    getFavoriteIcon(song) {
      if (this.isFavorite(song)) {
        return 'icon-favorite';
      }
      return 'icon-not-favorite';
    },
    // 判断是否收藏
    isFavorite(song) {
      const index = this.favoriteList.findIndex((item) => {
        return item.id === song.id;
      });
      return index > -1;
    },
    ...mapMutations({
      setPlayMode: 'SET_PLAY_MODE',
      setPlaylist: 'SET_PLAYLIST',
      setCurrentIndex: 'SET_CURRENT_INDEX',
      setPlayingState: 'SET_PLAYING_STATE'
    }),
    ...mapActions([
      'saveFavoriteList',
      'deleteFavoriteList'
    ])
  }
};

export const searchMixin = {
  data() {
    return {
      query: '',
      refreshDelay: 120
    };
  },
  computed: {
    ...mapGetters([
      'searchHistory'
    ])
  },
  methods: {
    // 搜索时调用
    onQueryChange(query) {
      this.query = query;
    },
    blurInput() {
      this.$refs.searchBox.blur();
    },
    // 点击热门标签，写人搜索框
    addQuery(query) {
      this.$refs.searchBox.setQuery(query);
    },
    // 保存缓存
    saveSearch() {
      this.saveSearchHistory(this.query);
    },
    ...mapActions([
      'saveSearchHistory',
      'deleteSearchHistory'
    ])
  }
};
