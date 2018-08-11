<template>
  <transition name="list-fade">
    <div class="playlist" @click="hide" v-show="showFlag">
      <div class="list-wrapper" @click.stop>
        <!-- 头部 -->
        <div class="list-header">
          <h1 class="title">
            <i class="icon" :class="iconMode" @click="changeMode"></i>
            <span class="text">{{modeText}}</span>
            <span class="clear" @click="showConfirm"><i class="icon-clear"></i></span>
          </h1>
        </div>
        <!-- 歌曲列表 -->
        <scroll :data="sequenceList" ref="listContent" class="list-content" :refreshDelay="refreshDelay">
          <transition-group name="list" tag="ul">
            <li class="item" v-for="(item, index) in sequenceList" :key="item.id" @click="selectItem(item,index)" ref="listItem">
              <i class="current" :class="getCurrentIcon(item)"></i>
              <span class="text">{{item.name}}</span>
              <span class="like" @click.stop="toggleFavorite(item)">
                <i :class="getFavoriteIcon(item)"></i>
              </span>
              <!-- 删除歌曲 -->
              <span class="delete" @click.stop="deleteOne(item)">
                <i class="icon-delete"></i>
              </span>
            </li>
          </transition-group>
        </scroll>
        <!-- 底部，操作部分 -->
        <div class="list-operate">
          <div class="add" @click="addSong">
            <i class="icon-add"></i>
            <span class="text">添加歌曲到队列</span>
          </div>
        </div>
        <div @click="hide" class="list-close">
          <span>关闭</span>
        </div>
      </div>
      <confirm ref="confirm" @confirm="confirmClear" text="是否清空播放列表" confirmBtnText="清空"></confirm>
      <add-song ref="addSong"></add-song>
    </div>
  </transition>
</template>

<script type="text/ecmascript-6">
  import {mapActions} from 'vuex';
  import {playMode} from '../../common/js/config';
  import Scroll from '../../base/scroll/scroll';
  import Confirm from '../../base/confirm/confirm';
  import AddSong from '../add-song/add-song';
  import {playerMixin} from '../../common/js/mixin';

  export default {
    mixins: [playerMixin],
    data() {
      return {
        showFlag: false,
        refreshDelay: 120
      };
    },
    computed: {
      modeText() {
        return this.mode === playMode.sequence ? '顺序播放' : this.mode === playMode.random ? '随机播放' : '单曲循环';
      }
    },
    methods: {
      // 打开歌曲列表
      show() {
        this.showFlag = true;
        // 刷新scroll
        setTimeout(() => {
          this.$refs.listContent.refresh();
          this.scrollToCurrent(this.currentSong);
        }, 20);
      },
      // 隐藏歌曲列表
      hide() {
        this.showFlag = false;
      },
      // 在歌曲列表中找到当前播放的歌曲，并设置歌曲播放样式
      getCurrentIcon(item) {
        if (item.id === this.currentSong.id) {
          return 'icon-play';
        } else {
          return '';
        }
      },
      // 在播放列表中选择一首歌播放
      selectItem(item, index) {
        if (this.mode === playMode.random) {
           index = this.playlist.findIndex((song) => {
             return song.id === item.id;
           });
        }
          this.setCurrentIndex(index);
          this.setPlayingState(true);
      },
      // 使列表播放的歌曲处于首位，利用better-scroll滚动
      scrollToCurrent(current) {
        const index = this.sequenceList.findIndex((song) => {
          return song.id === current.id;
        });
        this.$refs.listContent.scrollToElement(this.$refs.listItem[index], 300);
      },
      // 删掉一首歌曲
      deleteOne(item) {
        this.deleteSong(item);
        if (!this.playlist.length) {
          this.hide();
        }
      },
      // 显示询问弹窗
      showConfirm() {
        this.$refs.confirm.show();
      },
      // 清空播放列表
      confirmClear() {
        this.deleteSongList();
        this.hide();
      },
      // 新增歌曲
      addSong() {
        this.$refs.addSong.show();
      },
      ...mapActions([
        'deleteSong',
        'deleteSongList'
      ])
    },
    //   showConfirm() {
    //     this.$refs.confirm.show()
    //   },
    //   confirmClear() {
    //     this.deleteSongList()
    //     this.hide()
    //   },
    //   scrollToCurrent(current) {
    //     const index = this.sequenceList.findIndex((song) => {
    //       return current.id === song.id
    //     })
    //     this.$refs.listContent.scrollToElement(this.$refs.list.$el.children[index], 300)
    //   },
    //   addSong() {
    //     this.$refs.addSong.show()
    //   },
    //   ...mapActions([
    //     'deleteSong',
    //     'deleteSongList'
    //   ])
    // },
    watch: {
      // 监听当前歌曲是否改变
      currentSong(newSong, oldSong) {
        if (!this.showFlag || newSong.id === oldSong.id) {
          return;
        }
        // 歌曲改变，滚动到首位
        setTimeout(() => {
          this.scrollToCurrent(newSong);
        }, 20);
      }
    },
    components: {
      Scroll,
      Confirm,
      AddSong
    }
  };
</script>

<style scoped lang="stylus" rel="stylesheet/stylus">
  @import "~@/common/stylus/variable"
  @import "~@/common/stylus/mixin"

  .playlist
    position: fixed
    left: 0
    right: 0
    top: 0
    bottom: 0
    z-index: 200
    background-color: $color-background-d
    &.list-fade-enter-active, &.list-fade-leave-active
      transition: opacity 0.3s
      .list-wrapper
        transition: all 0.3s
    &.list-fade-enter, &.list-fade-leave-to
      opacity: 0
      .list-wrapper
        transform: translate3d(0, 100%, 0)
    &.list-fade-enter
    .list-wrapper
      position: absolute
      left: 0
      bottom: 0
      width: 100%
      background-color: $color-highlight-background
      .list-header
        position: relative
        padding: 20px 30px 10px 20px
        .title
          display: flex
          align-items: center
          .icon
            margin-right: 10px
            font-size: 30px
            color: $color-theme-d
          .text
            flex: 1
            font-size: $font-size-medium
            color: $color-text-l
          .clear
            extend-click()
            .icon-clear
              font-size: $font-size-medium
              color: $color-text-d
      .list-content
        max-height: 240px
        overflow: hidden
        .item
          display: flex
          align-items: center
          height: 40px
          padding: 0 30px 0 20px
          overflow: hidden
          &.list-enter-active, &.list-leave-active
            transition: all 0.1s
          &.list-enter, &.list-leave-to
            height: 0
          .current
            flex: 0 0 20px
            width: 20px
            font-size: $font-size-small
            color: $color-theme-d
          .text
            flex: 1
            no-wrap()
            font-size: $font-size-medium
            color: $color-text-d
          .like
            extend-click()
            margin-right: 15px
            font-size: $font-size-small
            color: $color-theme
            .icon-favorite
              color: $color-sub-theme
          .delete
            extend-click()
            font-size: $font-size-small
            color: $color-theme
      .list-operate
        width: 140px
        margin: 20px auto 30px auto
        .add
          display: flex
          align-items: center
          padding: 8px 16px
          border: 1px solid $color-text-l
          border-radius: 100px
          color: $color-text-l
          .icon-add
            margin-right: 5px
            font-size: $font-size-small-s
          .text
            font-size: $font-size-small
      .list-close
        text-align: center
        line-height: 50px
        background: $color-background
        font-size: $font-size-medium-x
        color: $color-text-l
</style>