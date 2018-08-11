<template>
    <!-- 进度条 -->
  <div class="progress-bar" ref="progressBar" @click="progressClick">
    <div class="bar-inner">
      <div class="progress" ref="progress"></div>
      <!-- 进度小球 -->
      <div class="progress-btn-wrapper" ref="progressBtn" @touchstart="progressTouchStart" @touchmove="progressTouchMove" @touchend="progressTouchEnd">
        <div class="progress-btn"></div>
      </div>
    </div>
  </div>
</template>

<script type="text/ecmascript-6">
  import {prefixStyle} from '../../common/js/dom';

  const progressBtnWidth = 16;
  const transform = prefixStyle('transform');

  export default {
    props: {
      // 进度条的百分比
      percent: {
        type: Number,
        default: 0
      }
    },
    created() {
      // 处理滑动时公共的数据
      this.touch = {};
    },
    methods: {
      // 进度条滑动开始时
      progressTouchStart(e) {
        // 设置一个标志位
        this.touch.initiated = true;
        this.touch.startX = e.touches[0].pageX;
        this.touch.left = this.$refs.progress.clientWidth;
      },
      // 进度条移动
      progressTouchMove(e) {
        if (!this.touch.initiated) {
          return;
        }
        // 移动的距离
        const deltaX = e.touches[0].pageX - this.touch.startX;
        // 总的偏移量
        const offsetWidth = Math.min(this.$refs.progressBar.clientWidth - progressBtnWidth, Math.max(0, this.touch.left + deltaX));
        this._offset(offsetWidth);
      },
      // 进度条移动结束
      progressTouchEnd() {
        this.touch.initiated = false;
        this._triggerPercent();
      },
      _triggerPercent() {
        const barWidth = this.$refs.progressBar.clientWidth - progressBtnWidth;
        const percent = this.$refs.progress.clientWidth / barWidth;
        this.$emit('percentChange', percent);
      },
      // 点击进度条实现歌曲播放
        progressClick(e) {
          const rect = this.$refs.progressBar.getBoundingClientRect();
          const offsetWidth = e.pageX - rect.left;
          this._offset(offsetWidth);
          // 这里当我们点击 progressBtn 的时候，e.offsetX 获取不对
          // this._offset(e.offsetX);
          this._triggerPercent();
        },
      // 设置进度条偏移量
      _offset(offsetWidth) {
        this.$refs.progress.style.width = `${offsetWidth}px`;
        this.$refs.progressBtn.style[transform] = `translate3d(${offsetWidth}px,0,0)`;
      }
    },
    watch: {
      // 监听percent，改变进度条
      percent(newPercent) {
        if (newPercent >= 0 && !this.touch.initiated) {
          // progressBtnWidth小球的宽度,barWidth进度条的宽度
          const barWidth = this.$refs.progressBar.clientWidth - progressBtnWidth;
          const offsetWidth = newPercent * barWidth;
          this._offset(offsetWidth);
        }
      }
    }
  };
</script>

<style scoped lang="stylus" rel="stylesheet/stylus">
  @import "~@/common/stylus/variable"

  .progress-bar
    height: 30px
    .bar-inner
      position: relative
      top: 13px
      height: 4px
      background: rgba(0, 0, 0, 0.3)
      .progress
        position: absolute
        height: 100%
        background: $color-theme
      .progress-btn-wrapper
        position: absolute
        left: -8px
        top: -13px
        width: 30px
        height: 30px
        .progress-btn
          position: relative
          top: 7px
          left: 7px
          box-sizing: border-box
          width: 16px
          height: 16px
          border: 3px solid $color-text
          border-radius: 50%
          background: $color-theme
</style>