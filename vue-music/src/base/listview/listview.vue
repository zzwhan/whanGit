<template>
  <scroll :data="data" class="listview" ref="listview" @scroll="scroll" :listenScroll="listenScroll" :probeType="probeType">
    <!-- 左侧的歌手列表 -->
    <ul>
      <li v-for="(group, index) in data" :key = "index" class="list-group" ref="listGroup">
        <h2 class="list-group-title">{{group.title}}</h2>
        <ul>
          <li v-for="(item, i) in group.items" :key = "i" class="list-group-item" @click="selectItem(item)">
            <img v-lazy="item.avatar" class="avatar">
            <span class="name">{{item.name}}</span>
          </li>
        </ul>
      </li>
    </ul>
    <!-- 右侧类型入口 -->
    <div class="list-shortcut" @touchstart="onShortcutTouchStart" @touchmove.stop.prevent="onShortcutTouchMove">
      <ul>
        <li v-for="(item, index) in shortcutList" :key = "index" :data-index = "index" class="item" :class="{'current' : currentIndex===index}">{{item}}</li>
      </ul>
    </div>
    <!-- 歌手页的所属类型，固定在上面 -->
    <div class="list-fixed" v-show="fixedTitle" ref="fixed">
      <h1 class="fixed-title">{{fixedTitle}}</h1>
    </div>
    <!-- 数据没有更新时出现正在加载 -->
    <div v-show="!data.length" class="loading-container">
      <loading></loading>
    </div>
  </scroll>
</template>

<script type="text/ecmascript-6">
  import Scroll from '../scroll/scroll';
  import {getData} from '../../common/js/dom';
  import Loading from '../loading/loading';
  const ANCHOR_HEIGHT = 18;
  const TITLE_HEIGHT = 30;
  export default {
    created() {
      this.touch = {};
      this.listenScroll = true;
      this.listHeight = [];
      this.probeType = 3;
    },
    data() {
      return {
        scrollY: -1,
        currentIndex: 0,
        diff: -1
      };
    },
    props: {
      data: {
        type: Array,
        default: function() {
          return [];
        }
      }
    },
    computed: {
      // 把title取出来
      shortcutList() {
        return this.data.map((group) => {
          return group.title.substr(0, 1);
        });
      },
      fixedTitle() {
        if (this.scrollY > 0) {
          return '';
        }
        return this.data[this.currentIndex] ? this.data[this.currentIndex].title : '';
      }
    },
    methods: {
      // 跳转歌手详情页面
      selectItem(item) {
        this.$emit('select', item);
      },
      // 触摸屏幕发生的事件
      onShortcutTouchStart(e) {
        let anchorIndex = getData(e.target, 'index');
        // touches：表示当前跟踪的触摸操作的touch对象的数组。
        let fristTouch = e.touches[0];
        this.touch.y1 = fristTouch.pageY;
        this.touch.anchorIndex = anchorIndex;
        this._scrollTo(anchorIndex);
      },
      // 滑动屏幕发送的事件
      onShortcutTouchMove(e) {
        let fristTouch = e.touches[0];
        this.touch.y2 = fristTouch.pageY;
        let delta = (this.touch.y2 - this.touch.y1) / ANCHOR_HEIGHT | 0;
        let anchorIndex = parseInt(this.touch.anchorIndex) + delta;
        this._scrollTo(anchorIndex);
      },
      // 获取scrollY的值
      scroll(pos) {
        this.scrollY = pos.y;
      },
      // 封装方法
      _scrollTo(index) {
        // 处理非点击块
        if (!index && index !== 0) {
          return;
        }
        if (index < 0) {
          index = 0;
        } else if (index === this.listHeight.length - 2) {
          index = this.listHeight.length - 2;
        }
        // 点击右侧时也可以左右联动
        this.scrollY = -this.listHeight[index];
        this.$refs.listview.scrollToElement(this.$refs.listGroup[index], 0);
      },
      // 计算滚动距离
      _calculateHeight() {
        this.listHeight = [];
        const list = this.$refs.listGroup;
        let height = 0;
        this.listHeight.push(height);
        for (let i = 0; i < list.length; i++) {
          let item = list[i];
          height += item.clientHeight;
          this.listHeight.push(height);
        }
      },
      // 刷新滚动条
      refresh() {
        this.$refs.listview.refresh();
      }
    },
    watch: {
      data() {
        setTimeout(() => {
          this._calculateHeight();
        }, 20);
      },
      // 监听scrollY
      scrollY(newY) {
        const listHeight = this.listHeight;
        for (let i = 0; i < listHeight.length - 1; i++) {
          let height1 = listHeight[i];
          let height2 = listHeight[i + 1];
          // 当滚动到顶部，newY>0
          if (newY > 0) {
            this.currentIndex = 0;
            return;
          }
          // 在中间部分滚动
          if (-newY >= height1 && -newY < height2) {
            this.currentIndex = i;
            this.diff = height2 + newY;
            return;
          }
          // 滚动到底部，且-newY大于最后一个元素的上限
          this.currentIndex = listHeight.length - 2;
        }
      },
      // 监听diff值变化，改变title
      diff(newVal) {
        let fixedTop = (newVal > 0 && newVal < TITLE_HEIGHT) ? newVal - TITLE_HEIGHT : 0;
        if (this.fixedTop === fixedTop) {
          return;
        }
        console.log(newVal);
        console.log(fixedTop);
        this.fixedTop = fixedTop;
        this.$refs.fixed.style.transform = `translate3d(0, ${fixedTop}px ,0)`;
      }
    },
    components: {
      Scroll,
      Loading
    }
  };

</script>

<style scoped lang="stylus" rel="stylesheet/stylus">
  @import "~@/common/stylus/variable"

  .listview
    position: relative
    width: 100%
    height: 100%
    overflow: hidden
    background: $color-background
    .list-group
      padding-bottom: 30px
      .list-group-title
        height: 30px
        line-height: 30px
        padding-left: 20px
        font-size: $font-size-small
        color: $color-text-l
        background: $color-highlight-background
      .list-group-item
        display: flex
        align-items: center
        padding: 20px 0 0 30px
        .avatar
          width: 50px
          height: 50px
          border-radius: 50%
        .name
          margin-left: 20px
          color: $color-text-l
          font-size: $font-size-medium
    .list-shortcut
      position: absolute
      z-index: 30
      right: 0
      top: 50%
      transform: translateY(-50%)
      width: 20px
      padding: 20px 0
      border-radius: 10px
      text-align: center
      background: $color-background-d
      font-family: Helvetica
      .item
        padding: 3px
        line-height: 1
        color: $color-text-l
        font-size: $font-size-small
        &.current
          color: $color-theme
    .list-fixed
      position: absolute
      top: 0
      left: 0
      width: 100%
      .fixed-title
        height: 30px
        line-height: 30px
        padding-left: 20px
        font-size: $font-size-small
        color: $color-text-l
        background: $color-highlight-background
    .loading-container
      position: absolute
      width: 100%
      top: 50%
      transform: translateY(-50%)
</style>
