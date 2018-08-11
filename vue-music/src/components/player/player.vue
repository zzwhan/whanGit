<template>
  <div class="player" v-show="playlist.length>0">
    <transition name="normal" @enter="enter" @afterEnter="afterEnter" @leave="leave" @afterLeave="afterLeave">
      <!-- 播放器主页面 -->
      <div class="normal-player" v-show="fullScreen">
        <!-- 背景图 -->
        <div class="background">
            <img width="100%" height="100%" :src="currentSong.image">
        </div>
        <!-- 上边部分 -->
        <div class="top">
          <!-- 返回按钮 -->
            <div @click="back" class="back">
              <i class="icon-back"></i>
            </div>
            <!-- 歌曲名称与歌手名称 -->
            <h1 class="title" v-html="currentSong.name"></h1>
            <h2 class="subtitle" v-html="currentSong.singer"></h2>
        </div>
        <!-- 中间部分 -->
        <div class="middle" @touchstart.prevent="middleTouchStart" @touchmove.prevent="middleTouchMove" @touchend="middleTouchEnd">
            <div class="middle-l" ref="middleL">
              <!-- 唱片 -->
              <div class="cd-wrapper" ref="cdWrapper">
                <div :class="cdCls" class="cd">
                  <img class="image" :src="currentSong.image">
                </div>
              </div>
              <!-- 当前一句歌词 -->
              <div class="playing-lyric-wrapper">
                <div class="playing-lyric">{{playingLyric}}</div>
              </div>
            </div>
            <!-- 歌词部分 -->
            <scroll class="middle-r" ref="lyricList" :data="currentLyric && currentLyric.lines">
              <div class="lyric-wrapper">
                <div v-if="currentLyric">
                  <p ref="lyricLine"
                    class="text"
                    :class="{'current': currentLineNum ===index}"
                    v-for="(line,index) in currentLyric.lines" :key= "index">{{line.txt}}</p>
                </div>
              </div>
            </scroll>
          </div>
          <!-- 按钮操作区 -->
          <div class="bottom">
            <div class="dot-wrapper">
              <span class="dot" :class="{'active':currentShow==='cd'}"></span>
              <span class="dot" :class="{'active':currentShow==='lyric'}"></span>
            </div>
            <div class="progress-wrapper">
              <span class="time time-l">{{format(currentTime)}}</span>
              <div class="progress-bar-wrapper">
                <!-- 进度条 -->
                <progress-bar @percentChange="onPercentChange" :percent="percent"></progress-bar>
              </div>
              <span class="time time-r">{{format(currentSong.duration)}}</span>
            </div>
            <div class="operators">
              <div class="icon i-left" @click="changeMode">
                <!-- 播放类型按钮 -->
                <i :class="iconMode"></i>
              </div>
              <div class="icon i-left" :class="disableCls">
                <!-- 左按钮 -->
                <i @click="prev" class="icon-prev"></i>
              </div>
              <div class="icon i-center" :class="disableCls">
                <!-- 播放按钮 -->
                <i @click="togglePlaying" :class="playIcon"></i>
              </div>
              <div class="icon i-right" :class="disableCls">
                <!-- 右按钮 -->
                <i @click="next" class="icon-next"></i>
              </div>
              <div class="icon i-right">
                <!-- 收藏按钮 -->
                <i class="icon" :class="getFavoriteIcon(currentSong)" @click="toggleFavorite(currentSong)"></i>
              </div>
            </div>
          </div>
      </div>
    </transition>
    <transition name="mini">
      <div>
        <!-- 缩小是播放器组件 -->
        <div class="mini-player" v-show="!fullScreen" @click="open">
          <!-- 小的CDlogo -->
          <div class="icon">
            <img :class="cdCls" width="40" height="40" :src="currentSong.image">
          </div>
          <!-- 歌曲名称与歌手 -->
          <div class="text">
            <h2 class="name" v-html="currentSong.name"></h2>
            <p class="desc" v-html="currentSong.singer"></p>
          </div>
          <!-- 操作歌曲 -->
          <div class="control">
            <progress-circle :percent="percent" :radius="radius">
              <i @click.stop="togglePlaying" :class="miniIcon" class="icon-mini"></i>
            </progress-circle>
          </div>
          <div class="control" @click.stop="showPlayList">
            <i class="icon-playlist"></i>
          </div>
        </div>
      </div>
    </transition>
    <playlist ref="playlist"></playlist>
    <audio ref="audio" :src="currentSong.url" @play="ready" @error="error" @timeupdate="updateTime" @ended="end"></audio>
  </div>
</template>

<script type="text/ecmascript-6">
  import {mapGetters, mapMutations, mapActions} from 'vuex';
  import animations from 'create-keyframe-animation';
  import {prefixStyle} from '../../common/js/dom';
  import ProgressBar from '../../base/progress-bar/progress-bar';
  import ProgressCircle from '../../base/progress-circle/progress-circle';
  import {playMode} from '../../common/js/config';
  // import {shuffle} from '../../common/js/util';
  import Lyric from 'lyric-parser';
  import Scroll from '../../base/scroll/scroll';
  import Playlist from '../playlist/playlist';
  import {playerMixin} from '../../common/js/mixin';

  const transform = prefixStyle('transform');
  const transitionDuration = prefixStyle('transitionDuration');
  export default {
    mixins: [playerMixin],
    data() {
      return {
        // 歌曲播放是否准备好
        songReady: false,
        // 当前时间
        currentTime: 0,
        radius: 32,
        // 当前歌词
        currentLyric: null,
        // 播放到当前行
        currentLineNum: 0,
        // 歌词与cd切换时,显示不同的dot
        currentShow: 'cd',
        playingLyric: ''
      };
    },
    computed: {
      // cd播放时旋转
      cdCls() {
        return this.playing ? 'play' : 'play pause';
      },
      // 根据播放状态，改变播放样式
      playIcon() {
        return !this.playing ? 'icon-play' : 'icon-pause';
      },
      // 根据播放状态，改变播放样式,小组件的播放器
      miniIcon() {
        return !this.playing ? 'icon-play-mini' : 'icon-pause-mini';
      },
      // 下一首歌出现短暂的样式改变
      disableCls() {
        console.log('dis', this.songReady);
        return this.songReady ? '' : 'disable';
      },
      // 当前播放的进度
      percent() {
        return this.currentTime / this.currentSong.duration;
      },
      // // 对应不同的播放模式，显示不同的样式
      // iconMode() {
      //   return this.mode === playMode.sequence ? 'icon-sequence' : this.mode === playMode.loop ? 'icon-loop' : 'icon-random';
      // },
      ...mapGetters([
        'fullScreen',
        'playing',
        'currentIndex'
      ])
    },
    created() {
      this.touch = {};
    },
    methods: {
      // 展示歌单列表
      showPlayList() {
        this.$refs.playlist.show();
      },
      // 返回
      back() {
        this.setFullSeceen(false);
      },
      // 打开音乐播放器
      open() {
        this.setFullSeceen(true);
      },
      // 改变状态
      ...mapMutations({
        setFullSeceen: 'SET_FULL_SCREEN'
      }),
      // 切换播放状态
      togglePlaying() {
        // console.log('5', this.songReady);
        if (!this.songReady) {
          // console.log('6', this.songReady);
          return;
        }
        this.setPlayingState(!this.playing);
        // 暂停时，歌词滚动也暂停
        if (this.currentLyric) {
          this.currentLyric.togglePlay();
        }
        // console.log('7', this.songReady);
      },
      // 下一首歌
      next() {
        // 如果歌曲没有加载好直接return，防止多次点击造成dom问题
        // console.log('1', this.songReady);
        if (!this.songReady) {
          // console.log('2', this.songReady);
          return;
        }
        if (this.playlist.length === 1) {
          this.loop();
          return;
        } else {
          let index = this.currentIndex + 1;
          if (index === this.playlist.length) {
            index = 0;
          }
          this.setCurrentIndex(index);
          // 处理切换下一首歌时，播放状态样式没有改变
          if (!this.playing) {
            this.togglePlaying();
          }
        }
        // console.log('3', this.songReady);
        this.songReady = false;
        // console.log('4', this.songReady);
      },
      // 上一首歌
      prev() {
        // 如果歌曲没有加载好直接return，防止多次点击造成dom问题
        if (!this.songReady) {
          return;
        }
        if (this.playlist.length === 1) {
          this.loop();
          return;
        } else {
          let index = this.currentIndex - 1;
          if (index === -1) {
            index = this.playlist.length - 1;
          }
          this.setCurrentIndex(index);
          // 处理切换下一首歌时，播放状态样式没有改变
          if (!this.playing) {
            this.togglePlaying();
          }
        }
        this.songReady = false;
      },
      // 歌曲加载成功时
      ready() {
        if (!this.state) {
          this.songReady = true;
          // console.log('9', this.songReady);
          this.savePlayHistory(this.currentSong);
          this.state = true;
        } else {
            setTimeout(() => {
            // console.log('8', this.songReady);
            this.songReady = true;
            // console.log('9', this.songReady);
            this.savePlayHistory(this.currentSong);
          }, 1000);
        }
      },
      ...mapActions([
        'savePlayHistory'
      ]),
      // 歌曲加载错误时
      error() {
        this.songReady = true;
      },
      // 接收子组件一个事件，实现滑动进度条时对应歌曲播放到相应的位置
      onPercentChange(percent) {
        const currentLyricTime = this.currentSong.duration * percent;
        this.$refs.audio.currentTime = currentLyricTime;
        if (!this.playing) {
          this.togglePlaying();
        }
        // 点击或者滑动进度条时，歌词也跳到相应的位置
        if (this.currentLyric) {
          this.currentLyric.seek(currentLyricTime * 1000);
        }
      },
      // 播放结束时，调用调用下一首还是循环播放
      end() {
        if (this.mode === playMode.loop) {
          this.loop();
        } else {
          this.next();
        }
      },
      // 循环播放
      loop() {
        this.$refs.audio.currentTime = 0;
        this.$refs.audio.play();
        // 播放结束歌词重新开始
        if (this.currentLyric) {
          this.currentLyric.seek(0);
        }
      },
      // 获取当前播放时间
      updateTime(e) {
        this.currentTime = e.target.currentTime;
      },
      // // 切换播放模式
      // changeMode() {
      //   const mode = (this.mode + 1) % 3;
      //   this.setPlayMode(mode);
      //   let list = null;
      //   if (mode === playMode.random) {
      //     list = shuffle(this.sequenceList);
      //   } else {
      //     list = this.sequenceList;
      //   }
      //   this.resetCurrentIndex(list);
      //   this.setPlaylist(list);
      //   // console.log(this.playlist);
      //   // console.log(this.sequenceList);
      // },
      resetCurrentIndex(list) {
        let index = list.findIndex((item) => {
          return item.id === this.currentSong.id;
        });
        this.setCurrentIndex(index);
      },
      format(interval) {
        interval = interval | 0;
        const minute = interval / 60 | 0;
        const second = this._pad(interval % 60);
        return `${minute}:${second}`;
      },
      // 按位补0
      _pad(num, n = 2) {
        let a = num.toString().length;
        while (a < n) {
          num = '0' + num;
          a++;
        }
        return num;
      },
      // 获取歌词
      getLyric() {
        this.currentSong.getLyric().then((lyric) => {
          if (this.currentSong.lyric !== lyric) {
            return;
          }
          this.currentLyric = new Lyric(lyric, this.handleLyric);
          if (this.playing) {
            this.currentLyric.play();
          }
          // console.log(this.currentLyric);
        }).catch(() => {
          this.currentLyric = null;
          this.playingLyric = '';
          this.currentLineNum = 0;
        });
      },
      // 回调函数
      handleLyric({lineNum, txt}) {
        // console.log(lineNum);
        this.currentLineNum = lineNum;
        // 歌词自动滚动
        if (lineNum > 5) {
          this.$refs.lyricList.scrollToElement(this.$refs.lyricLine[lineNum - 5], 1000);
        } else {
          this.$refs.lyricList.scrollTo(0, 0, 1000);
        }
        this.playingLyric = txt;
      },
      middleTouchStart(e) {
        this.touch.initiated = true;
        const touch = e.touches[0];
        this.touch.startX = touch.pageX;
        this.touch.startY = touch.pageY;
      },
      middleTouchMove(e) {
        if (!this.touch.initiated) {
          return;
        }
        const touch = e.touches[0];
        const deltaX = touch.pageX - this.touch.startX;
        const deltaY = touch.pageY - this.touch.startY;
        // 纵向滚动大于横向滚动，就返回
        if (Math.abs(deltaY) > Math.abs(deltaX)) {
          return;
        }
        const left = this.currentShow === 'cd' ? 0 : -window.innerWidth;
        // 偏移量最大不超过屏幕大小，同时小于0
        const offsetWidth = Math.min(0, Math.max(-window.innerWidth, left + deltaX));
        // 获取偏移量与屏幕的百分比
        this.touch.percent = Math.abs(offsetWidth / window.innerWidth);
        this.$refs.lyricList.$el.style[transform] = `translate3d(${offsetWidth}px,0,0)`;
        this.$refs.lyricList.$el.style[transitionDuration] = 0;
        // cd部分透明度变化
        this.$refs.middleL.style.opacity = 1 - this.touch.percent;
        // 变化时间
        this.$refs.middleL.style[transitionDuration] = 0;
      },
      middleTouchEnd() {
        let offsetWidth;
        let opacity;
        if (this.currentShow === 'cd') {
          // 在cd页面中，当偏移百分比大于0.1时就切换到歌词页面
          if (this.touch.percent > 0.1) {
            offsetWidth = -window.innerWidth;
            opacity = 0;
            this.currentShow = 'lyric';
          } else {
            offsetWidth = 0;
            opacity = 1;
          }
        } else {
          // 在歌词页面中，当偏移百分比小于0.9时就切换到歌词页面
          if (this.touch.percent < 0.9) {
            offsetWidth = 0;
            this.currentShow = 'cd';
            opacity = 1;
          } else {
            offsetWidth = -window.innerWidth;
            opacity = 0;
          }
        }
        const time = 300;
        this.$refs.lyricList.$el.style[transform] = `translate3d(${offsetWidth}px,0,0)`;
        this.$refs.lyricList.$el.style[transitionDuration] = `${time}ms`;
        this.$refs.middleL.style.opacity = opacity;
        this.$refs.middleL.style[transitionDuration] = `${time}ms`;
        this.touch.initiated = false;
      },
      // 过渡的钩子函数
      enter(el, done) {
        const {x, y, scale} = this._getPosAndScale();

        // 定义动画
        let animation = {
          0: {
            transform: `translate3d(${x}px, ${y}px, 0) scale(${scale})`
          },
          60: {
            transform: `translate3d(0, 0, 0) scale(1.1)`
          },
          100: {
            transform: `translate3d(0, 0, 0) scale(1)`
          }
        };
        // 利用插件实现动画
        animations.registerAnimation({
          name: 'move',
          animation,
          presets: {
            duration: 400,
            easing: 'linear'
          }
        });

        // 运行动画
        animations.runAnimation(this.$refs.cdWrapper, 'move', done);
      },
      afterEnter() {
        // 动画结束把css都设置原来的值
        animations.unregisterAnimation('move');
        this.$refs.cdWrapper.style.animation = '';
      },
      leave(el, done) {
        // 使用原生的js设置css
        this.$refs.cdWrapper.style.transition = 'all 0.4s';
        const {x, y, scale} = this._getPosAndScale();
        this.$refs.cdWrapper.style[transform] = `translate3d(${x}px, ${y}px, 0) scale(${scale})`;
        this.$refs.cdWrapper.addEventListener('transitionend', done);
      },
      afterLeave() {
        // 动画结束把css都设置原来的值
        this.$refs.cdWrapper.style.transition = '';
        this.$refs.cdWrapper.style[transform] = '';
      },
      // 初始化两个CD的位置
      _getPosAndScale() {
        const targetWidth = 40;
        const paddingLeft = 40;
        const paddingBottom = 30;
        const paddingTop = 80;
        const width = window.innerWidth * 0.8;
        // 缩放比例
        const scale = targetWidth / width;
        // x的偏移值
        const x = -(window.innerWidth / 2 - paddingLeft);
        // y的偏移值
        const y = window.innerHeight - paddingTop - width / 2 - paddingBottom;
        return {
          x,
          y,
          scale
        };
      }
    },
    watch: {
      // 监听音乐播放
      currentSong(newSong, oldSong) {
        if (!newSong.id) {
          return;
        }
        if (newSong.id === oldSong.id) {
          return;
        }
        // 处理切换下一首时，出现歌词来回跳动的bug
        if (this.currentLyric) {
          this.currentLyric.stop();
          this.currentTime = 0;
          this.playingLyric = '';
          this.currentLineNum = 0;
        }
        clearTimeout(this.timer);
        this.timer = setTimeout(() => {
          // 播放音乐
          this.$refs.audio.play();
          // 获取歌词
          this.getLyric();
        }, 1000);
      },
      // 监听播放状态，控制播放还是暂停
      playing(newPlaying) {
        const audio = this.$refs.audio;
        this.$nextTick(() => {
          newPlaying ? audio.play() : audio.pause();
        });
      }
    },
    components: {
      ProgressBar,
      ProgressCircle,
      Scroll,
      Playlist
    }
  };
</script>

<style scoped lang="stylus" rel="stylesheet/stylus">
  @import "~@/common/stylus/variable"
  @import "~@/common/stylus/mixin"

  .player
    .normal-player
      position: fixed
      left: 0
      right: 0
      top: 0
      bottom: 0
      z-index: 150
      background: $color-background
      .background
        position: absolute
        left: 0
        top: 0
        width: 100%
        height: 100%
        z-index: -1
        opacity: 0.6
        filter: blur(20px)
      .top
        position: relative
        margin-bottom: 25px
        .back
          position absolute
          top: 0
          left: 6px
          z-index: 50
          .icon-back
            display: block
            padding: 9px
            font-size: $font-size-large-x
            color: $color-theme
            transform: rotate(-90deg)
        .title
          width: 70%
          margin: 0 auto
          line-height: 40px
          text-align: center
          no-wrap()
          font-size: $font-size-large
          color: $color-text
        .subtitle
          line-height: 20px
          text-align: center
          font-size: $font-size-medium
          color: $color-text
      .middle
        position: fixed
        width: 100%
        top: 80px
        bottom: 170px
        white-space: nowrap
        font-size: 0
        .middle-l
          display: inline-block
          vertical-align: top
          position: relative
          width: 100%
          height: 0
          padding-top: 80%
          .cd-wrapper
            position: absolute
            left: 10%
            top: 0
            width: 80%
            height: 100%
            .cd
              width: 100%
              height: 100%
              box-sizing: border-box
              border: 10px solid rgba(255, 255, 255, 0.1)
              border-radius: 50%
              &.play
                animation: rotate 20s linear infinite
              &.pause
                animation-play-state: paused
              .image
                position: absolute
                left: 0
                top: 0
                width: 100%
                height: 100%
                border-radius: 50%

          .playing-lyric-wrapper
            width: 80%
            margin: 30px auto 0 auto
            overflow: hidden
            text-align: center
            .playing-lyric
              height: 20px
              line-height: 20px
              font-size: $font-size-medium
              color: $color-text-l
        .middle-r
          display: inline-block
          vertical-align: top
          width: 100%
          height: 100%
          overflow: hidden
          .lyric-wrapper
            width: 80%
            margin: 0 auto
            overflow: hidden
            text-align: center
            .text
              line-height: 32px
              color: $color-text-l
              font-size: $font-size-medium
              &.current
                color: $color-text
      .bottom
        position: absolute
        bottom: 50px
        width: 100%
        .dot-wrapper
          text-align: center
          font-size: 0
          .dot
            display: inline-block
            vertical-align: middle
            margin: 0 4px
            width: 8px
            height: 8px
            border-radius: 50%
            background: $color-text-l
            &.active
              width: 20px
              border-radius: 5px
              background: $color-text-ll
        .progress-wrapper
          display: flex
          align-items: center
          width: 80%
          margin: 0px auto
          padding: 10px 0
          .time
            color: $color-text
            font-size: $font-size-small
            flex: 0 0 30px
            line-height: 30px
            width: 30px
            &.time-l
              text-align: left
            &.time-r
              text-align: right
          .progress-bar-wrapper
            flex: 1
        .operators
          display: flex
          align-items: center
          .icon
            flex: 1
            color: $color-theme
            &.disable
              color: $color-theme-d
            i
              font-size: 30px
          .i-left
            text-align: right
          .i-center
            padding: 0 20px
            text-align: center
            i
              font-size: 40px
          .i-right
            text-align: left
          .icon-favorite
            color: $color-sub-theme
      &.normal-enter-active, &.normal-leave-active
        transition: all 0.4s
        .top, .bottom
          transition: all 0.4s cubic-bezier(0.86, 0.18, 0.82, 1.32)
      &.normal-enter, &.normal-leave-to
        opacity: 0
        .top
          transform: translate3d(0, -100px, 0)
        .bottom
          transform: translate3d(0, 100px, 0)
    .mini-player
      display: flex
      align-items: center
      position: fixed
      left: 0
      bottom: 0
      z-index: 180
      width: 100%
      height: 60px
      background: $color-highlight-background
      &.mini-enter-active, &.mini-leave-active
        transition: all 0.4s
      &.mini-enter, &.mini-leave-to
        opacity: 0
      .icon
        flex: 0 0 40px
        width: 40px
        padding: 0 10px 0 20px
        img
          border-radius: 50%
          &.play
            animation: rotate 10s linear infinite
          &.pause
            animation-play-state: paused
      .text
        display: flex
        flex-direction: column
        justify-content: center
        flex: 1
        line-height: 20px
        overflow: hidden
        .name
          margin-bottom: 2px
          no-wrap()
          font-size: $font-size-medium
          color: $color-text
        .desc
          no-wrap()
          font-size: $font-size-small
          color: $color-text-d
      .control
        flex: 0 0 30px
        width: 30px
        padding: 0 10px
        .icon-play-mini, .icon-pause-mini, .icon-playlist
          font-size: 30px
          color: $color-theme-d
        .icon-mini
          font-size: 32px
          position: absolute
          left: 0
          top: 0

  @keyframes rotate
    0%
      transform: rotate(0)
    100%
      transform: rotate(360deg)
</style>