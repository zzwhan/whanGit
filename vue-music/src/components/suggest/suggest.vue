<template>
  <scroll ref="suggest" class="suggest" :data="result" :pullup="pullup" @scrollToEnd="searchMore" :beforeScroll="beforeScroll" @beforeScroll="listScroll">
    <ul class="suggest-list">
      <li @click="selectItem(item)" class="suggest-item" v-for="(item,index) in result" :key="index">
        <div class="icon">
          <i :class="getIconCls(item)"></i>
        </div>
        <div class="name">
          <p class="text" v-html="getDisplayName(item)"></p>
        </div>
      </li>
      <loading v-show="hasMore" title=""></loading>
    </ul>
    <div v-show="!hasMore && !result.length" class="no-result-wrapper">
      <no-result title="抱歉，暂无搜索结果"></no-result>
    </div>
  </scroll>
</template>

<script type="text/ecmascript-6">
  import Scroll from '../../base/scroll/scroll';
  import Loading from '../../base/loading/loading';
  import NoResult from '../../base/no-result/no-result';
  import {search} from '../../api/search';
  import {ERR_OK} from '../../api/config';
  import {createSong} from '../../common/js/song';
  import {mapMutations, mapActions} from 'vuex';
  import Singer from '../../common/js/singer';

  const TYPE_SINGER = 'singer';
  const perpage = 20;

  export default {
    props: {
      showSinger: {
        type: Boolean,
        default: true
      },
      query: {
        type: String,
        default: ''
      }
    },
    data() {
      return {
        // 第一页
        page: 1,
        // 上拉刷新状态值
        pullup: true,
        beforeScroll: true,
        // 是否有更多的数据
        hasMore: true,
        // 搜索结果
        result: []
      };
    },
    // methods: {
    //   refresh() {
    //     this.$refs.suggest.refresh()
    //   },
    //   search() {
    //     this.page = 1
    //     this.hasMore = true
    //     this.$refs.suggest.scrollTo(0, 0)
    //     search(this.query, this.page, this.showSinger, perpage).then((res) => {
    //       if (res.code === ERR_OK) {
    //         this.result = this._genResult(res.data)
    //         this._checkMore(res.data)
    //       }
    //     })
    //   },
    //   searchMore() {
    //     if (!this.hasMore) {
    //       return
    //     }
    //     this.page++
    //     search(this.query, this.page, this.showSinger, perpage).then((res) => {
    //       if (res.code === ERR_OK) {
    //         this.result = this.result.concat(this._genResult(res.data))
    //         this._checkMore(res.data)
    //       }
    //     })
    //   },
    //   listScroll() {
    //     this.$emit('listScroll')
    //   },
    //   selectItem(item) {
    //     if (item.type === TYPE_SINGER) {
    //       const singer = new Singer({
    //         id: item.singermid,
    //         name: item.singername
    //       })
    //       this.$router.push({
    //         path: `/search/${singer.id}`
    //       })
    //       this.setSinger(singer)
    //     } else {
    //       this.insertSong(item)
    //     }
    //     this.$emit('select', item)
    //   },
    //   getDisplayName(item) {
    //     if (item.type === TYPE_SINGER) {
    //       return item.singername
    //     } else {
    //       return `${item.name}-${item.singer}`
    //     }
    //   },
    //   getIconCls(item) {
    //     if (item.type === TYPE_SINGER) {
    //       return 'icon-mine'
    //     } else {
    //       return 'icon-music'
    //     }
    //   },
    //   _genResult(data) {
    //     let ret = []
    //     if (data.zhida && data.zhida.singerid) {
    //       ret.push({...data.zhida, ...{type: TYPE_SINGER}})
    //     }
    //     if (data.song) {
    //       ret = ret.concat(this._normalizeSongs(data.song.list))
    //     }
    //     return ret
    //   },
    //   _normalizeSongs(list) {
    //     let ret = []
    //     list.forEach((musicData) => {
    //       if (musicData.songid && musicData.albummid) {
    //         ret.push(createSong(musicData))
    //       }
    //     })
    //     return ret
    //   },
    //   _checkMore(data) {
    //     const song = data.song
    //     if (!song.list.length || (song.curnum + song.curpage * perpage) > song.totalnum) {
    //       this.hasMore = false
    //     }
    //   },
    //   ...mapMutations({
    //     setSinger: 'SET_SINGER'
    //   }),
    //   ...mapActions([
    //     'insertSong'
    //   ])
    // },
    methods: {
      refresh() {
        this.$refs.suggest.refresh();
      },
      // 获取搜索数据
      search() {
        this.page = 1;
        this.hasMore = true;
        this.$refs.suggest.scrollTo(0, 0);
        search(this.query, this.page, this.showSinger, perpage).then((res) => {
          if (res.code === ERR_OK) {
            this.result = this._genResult(res.data);
            this._checkMove(res.data);
          }
        });
      },
      // 初始化数据,如果有zhida且有zhida.singerid就加一个type
      _genResult(data) {
        let ret = [];
        if (data.zhida && data.zhida.singerid) {
          ret.push({...data.zhida, ...{type: TYPE_SINGER}});
        }
        // 如果是歌曲
        if (data.song) {
          ret = ret.concat(this._normalizeSongs(data.song.list));
        }
        return ret;
      },
      // 格式化搜索数据
      _normalizeSongs(list) {
        let ret = [];
        list.forEach((musicData) => {
          // 满足条件就直接添加到数组里
          if (musicData.songid && musicData.albummid) {
            ret.push(createSong(musicData));
          }
        });
        return ret;
      },
      // 派发一个事件
      listScroll() {
        this.$emit('listScroll');
      },
      // 上拉加载更多数据
      searchMore() {
        if (!this.hasMore) {
          return;
        }
        this.page++;
        search(this.query, this.page, this.showSinger, perpage).then((res) => {
          if (res.code === ERR_OK) {
            this.result = this.result.concat(this._genResult(res.data));
            this._checkMove(res.data);
          }
        });
      },
      // 检查是否有更多的数据
      _checkMove(data) {
        const song = data.song;
        // 搜索的数据大于歌曲总数就没有更多的数据
        if (!song.list.length || (song.curnum + song.curpage * perpage) > song.totalnum) {
          this.hasMore = false;
        }
      },
      // 判断搜索出来的是歌手还是歌曲，对应不同的样式
      getIconCls(item) {
        if (item.type === TYPE_SINGER) {
          return 'icon-mine';
        } else {
          return 'icon-music';
        }
      },
      // 搜索结果，如果是歌手直接显示歌手，如果是歌曲就显示歌曲名称加上歌手
      getDisplayName(item) {
        if (item.type === TYPE_SINGER) {
              return item.singername;
        } else {
          return `${item.name}-${item.singer}`;
        }
      },
      // 点击歌曲播放，点击歌手进入歌手详情页
      selectItem(item) {
        if (item.type === TYPE_SINGER) {
          const singer = new Singer({
            id: item.singermid,
            name: item.singername
          });
          this.$router.push({
            path: `/search/${singer.id}`
          });
          this.setSinger(singer);
        } else {
          this.insertSong(item);
        }
        this.$emit('select');
      },
      ...mapMutations({
        setSinger: 'SET_SINGER'
      }),
      ...mapActions([
        'insertSong'
      ])
    },
    watch: {
      // 每次搜索时，监听query变化
      query(newQuery) {
        this.search(newQuery);
      }
    },
    components: {
      Scroll,
      Loading,
      NoResult
    }
  };
</script>

<style scoped lang="stylus" rel="stylesheet/stylus">
  @import "~@/common/stylus/variable"
  @import "~@/common/stylus/mixin"

  .suggest
    height: 100%
    overflow: hidden
    .suggest-list
      padding: 0 30px
      .suggest-item
        display: flex
        align-items: center
        padding-bottom: 20px
      .icon
        flex: 0 0 30px
        width: 30px
        [class^="icon-"]
          font-size: 14px
          color: $color-text-d
      .name
        flex: 1
        font-size: $font-size-medium
        color: $color-text-d
        overflow: hidden
        .text
          no-wrap()
    .no-result-wrapper
      position: absolute
      width: 100%
      top: 50%
      transform: translateY(-50%)
</style>