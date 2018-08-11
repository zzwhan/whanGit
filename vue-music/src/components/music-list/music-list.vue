<template>
  <div class="music-list">
    <!-- 返回按钮 -->
    <div class="back" @click="back">
      <i class="icon-back"></i>
    </div>
    <!-- 上标题 -->
    <h1 class="title" v-html="title"></h1>
    <!-- 背景图 -->
    <div class="bg-image" :style="bgStyle" ref="bgImage">
      <div class="play-wrapper">
        <div class="play" v-show="songs.length>0" ref="playBtn" @click="random">
          <i class="icon-play"></i>
          <span class="text">随机播放全部</span>
        </div>
      </div>
      <div class="filter" ref="filter"></div>
    </div>
    <!-- 歌曲滚动时，偏移，盖住背景图 -->
    <div class="bg-layer" ref="layer"></div>
    <!-- 歌曲列表 -->
    <scroll :probe-type="probeType" :listen-scroll="listenScroll" @scroll="scroll" :data="songs" class="list" ref="list">
      <div class="song-list-wrapper">
        <song-list :rank="rank" @select="selectItem" :songs="songs"></song-list>
      </div>
      <div v-show="!songs.length" class="loading-container">
        <loading></loading>
      </div>
    </scroll>
  </div>
</template>

<script type="text/ecmascript-6">
import Scroll from '../../base/scroll/scroll';
import Loading from '../../base/loading/loading';
import SongList from '../../base/song-list/song-list';
import {prefixStyle} from '../../common/js/dom';
import {mapActions} from 'vuex';
import {playlistMixin} from '../../common/js/mixin';

const RESERVEN_HEIGHT = 40;
const transform = prefixStyle('transform');
const backdrop = prefixStyle('backdrop-filter');
  export default {
    mixins: [playlistMixin],
    props: {
      // 背景图
      bgImage: {
        type: String,
        default: ''
      },
      // 歌单
      songs: {
        type: Array,
        default: function() {
          return [];
        }
      },
      title: {
        type: String,
        default: ''
      },
      rank: {
        type: Boolean,
        default: false
      }
    },
    data() {
      return {
        scrollY: -1
      };
    },
    created() {
      this.probeType = 3;
      this.listenScroll = true;
    },
    computed: {
      // 设置背景图
      bgStyle() {
        return `background-image:url(${this.bgImage})`;
      }
    },
    mounted() {
      this.imageHeight = this.$refs.bgImage.clientHeight;
      this.minTranslateY = -this.imageHeight + RESERVEN_HEIGHT;
      // 设置歌曲列表top值
      this.$refs.list.$el.style.top = `${this.$refs.bgImage.clientHeight}px`;
    },
    methods: {
      handlePlaylist(playlist) {
        const bottom = playlist.length > 0 ? '60px' : '';
        this.$refs.list.$el.style.bottom = bottom;
        this.$refs.list.refresh();
      },
      // scrollY值
      scroll(pos) {
        this.scrollY = pos.y;
      },
      // 返回歌手页面
      back() {
        this.$router.back();
      },
      // 接收子组件派发的事件
      selectItem(item, index) {
        this.selectPlay({
          // 所有歌曲数据与当前索引值
          list: this.songs,
          index: index
        });
      },
      // 随机播放
      random() {
        this.randomPlay({
          list: this.songs
        });
      },
      ...mapActions([
        'selectPlay',
        'randomPlay'
      ])
    },
    watch: {
      // 监听scrollY
      scrollY(newY) {
        let translateY = Math.max(this.minTranslateY, newY);
        let zIndex = 0;
        let scale = 1;
        let blur = 0;
        // this.$refs.layer.style['WebkitTransform'] = `translate3d(0,${translateY}px,0)`;
        this.$refs.layer.style[transform] = `translate3d(0,${translateY}px,0)`;
        const percent = Math.abs(newY / this.imageHeight);
        // 下拉时背景图放大
        if (newY > 0) {
          scale = 1 + percent;
          zIndex = 10;
        } else {
          // 高斯模糊
          blur = Math.min(20 * percent, 20);
        }
          // this.$refs.filter.style['WebkitBackdrop-filter'] = `blur(${blur})`;
          this.$refs.filter.style[backdrop] = `blur(${blur})`;
        // 处理歌曲向上滚动时
        if (newY < this.minTranslateY) {
          zIndex = 10;
          this.$refs.bgImage.style.paddingTop = 0;
          this.$refs.bgImage.style.height = `${RESERVEN_HEIGHT}px`;
          // 设置随机播放按钮消失
          this.$refs.playBtn.style.display = 'none';
        } else {
          this.$refs.bgImage.style.paddingTop = '70%';
          this.$refs.bgImage.style.height = 0;
          this.$refs.playBtn.style.display = '';
        }
          this.$refs.bgImage.style.zIndex = zIndex;
          // this.$refs.bgImage.style['WebkitTransform'] = `scale(${scale})`;
          this.$refs.bgImage.style[transform] = `scale(${scale})`;
      }
    },
    components: {
      Scroll,
      SongList,
      Loading
    }
  };
</script>

<style scoped lang="stylus" rel="stylesheet/stylus">
  @import "~@/common/stylus/variable"
  @import "~@/common/stylus/mixin"

  .music-list
    position: fixed
    z-index: 100
    top: 0
    left: 0
    bottom: 0
    right: 0
    background: $color-background
    .back
      position absolute
      top: 0
      left: 6px
      z-index: 50
      .icon-back
        display: block
        padding: 10px
        font-size: $font-size-large-x
        color: $color-theme
    .title
      position: absolute
      top: 0
      left: 10%
      z-index: 40
      width: 80%
      no-wrap()
      text-align: center
      line-height: 40px
      font-size: $font-size-large
      color: $color-text
    .bg-image
      position: relative
      width: 100%
      height: 0
      padding-top: 70%
      transform-origin: top
      background-size: cover
      .play-wrapper
        position: absolute
        bottom: 20px
        z-index: 50
        width: 100%
        .play
          box-sizing: border-box
          width: 135px
          padding: 7px 0
          margin: 0 auto
          text-align: center
          border: 1px solid $color-theme
          color: $color-theme
          border-radius: 100px
          font-size: 0
          .icon-play
            display: inline-block
            vertical-align: middle
            margin-right: 6px
            font-size: $font-size-medium-x
          .text
            display: inline-block
            vertical-align: middle
            font-size: $font-size-small
      .filter
        position: absolute
        top: 0
        left: 0
        width: 100%
        height: 100%
        background: rgba(7, 17, 27, 0.4)
    .bg-layer
      position: relative
      height: 100%
      background: $color-background
    .list
      position: fixed
      top: 0
      bottom: 0
      width: 100%
      background: $color-background
      .song-list-wrapper
        padding: 20px 30px
      .loading-container
        position: absolute
        width: 100%
        top: 50%
        transform: translateY(-50%)
</style>