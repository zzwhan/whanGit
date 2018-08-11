<template>
  <div class="slider" ref="slider">
    <div class="slider-group" ref="sliderGroup">
      <slot>
      </slot>
    </div>
    <div class="dots">
      <span v-for="(item, index) in dots" :key="index" class="dot" :class="{active:currentPageIndex === index}"></span>
    </div>
  </div>
</template>

<script>
import {addClass} from '../../common/js/dom';
import BScroll from 'better-scroll';

  export default {
    name: 'slider',
    props: {
      // 循环播放
      loop: {
        type: Boolean,
        default: true
      },
      // 是否自动播放
      autoPlay: {
        type: Boolean,
        default: true
      },
      // 播放间隔时间
      interval: {
        type: Number,
        default: 4000
      }
    },
    data() {
      return {
        // 轮播图下面的小点
        dots: [],
        currentPageIndex: 0
      };
    },
    mounted() {
      setTimeout(() => {
        this._setSliderWidth();
        this._initDots();
        this._initSlider();

        if (this.autoPlay) {
          this._play();
        }
      }, 20);
          // 窗口改变触发事件
          window.addEventListener('resize', () => {
            if (!this.slider) {
              return;
            }
            this._setSliderWidth(true);
            this.slider.refresh();
          });
    },
    activated() {
      if (this.autoPlay) {
        this._play();
      }
    },
    deactivated() {
      clearTimeout(this.timer);
    },
    beforeDestroy() {
      clearTimeout(this.timer);
    },
    methods: {
      // 计算设置轮播图的总宽度
      _setSliderWidth(isResize) {
        this.children = this.$refs.sliderGroup.children;
        // console.log('hh', this.children.length);
        let width = 0;
        let sliderWidth = this.$refs.slider.clientWidth;
        for (let i = 0; i < this.children.length; i++) {
          let child = this.children[i];
          addClass(child, 'slider-item');

          child.style.width = sliderWidth + 'px';
          width += sliderWidth;
        }
        // 一开始this.children为5个，改变窗口时this.children已经加2，所以不用再加2倍屏幕大小
        if (this.loop && !isResize) {
          width += 2 * sliderWidth;
        }
        this.$refs.sliderGroup.style.width = width + 'px';
      },
      _initSlider() {
        /* scrollX设置横向滚动 scrollY设置纵向滚动
        *  momentum当快速在屏幕上滑动一段距离的时候，会根据滑动的距离和时间计算出动量，并生成滚动动画。设置为 true 则开启动画
        *
        */
        this.slider = new BScroll(this.$refs.slider, {
          scrollX: true,
          scrollY: false,
          momentum: false,
          snap: {
            loop: true,
            threshold: 0.3
          }
        });
          // 每次滚动结束会派发scrollEnd事件
          this.slider.on('scrollEnd', () => {
            let pageIndex = this.slider.getCurrentPage().pageX;
            console.log(pageIndex);

            this.currentPageIndex = pageIndex;

            if (this.autoPlay) {
              this._play();
             }

            this.slider.on('beforeScrollStart', () => {
              if (this.autoPlay) {
                clearTimeout(this.timer);
              }
            });
          });
        //   if (this.autoPlay) {
        //     this._play()
        //   }
        // })

        // this.slider.on('beforeScrollStart', () => {
        //   if (this.autoPlay) {
        //     clearTimeout(this.timer)
        //   }
        // })
      },
      // 获取轮播图个数,制作点
      _initDots() {
        this.dots = new Array(this.children.length);
      },
      // 设置轮播图自动播放
      _play() {
        let pageIndex = this.currentPageIndex + 1;
        // 循环轮播，去掉多出来的第一个和最后一个
        if (pageIndex === this.children.length - 2) {
          // pageIndex = 0;
          // 处理最后一张图跳转到第一张图
          setTimeout(() => {
            this.slider.next(400);
          }, 4000);
          return;
        }
        console.log('1', pageIndex);
        this.timer = setTimeout(() => {
          this.slider.goToPage(pageIndex, 0, 400);
        }, this.interval);
      }
    }
  };
</script>

<style scoped lang="stylus" rel="stylesheet/stylus">
  @import "~@/common/stylus/variable"

  .slider
    min-height: 1px
    .slider-group
      position: relative
      overflow: hidden
      white-space: nowrap
      .slider-item
        float: left
        box-sizing: border-box
        overflow: hidden
        text-align: center
        a
          display: block
          width: 100%
          overflow: hidden
          text-decoration: none
        img
          display: block
          width: 100%
    .dots
      position: absolute
      right: 0
      left: 0
      bottom: 12px
      text-align: center
      font-size: 0
      .dot
        display: inline-block
        margin: 0 4px
        width: 8px
        height: 8px
        border-radius: 50%
        background: $color-text-l
        &.active
          width: 20px
          border-radius: 5px
          background: $color-text-ll
</style>