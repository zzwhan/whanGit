<template>
    <div ref="wrapper">
        <slot></slot>
    </div>
</template>

<script>
import BScroll from 'better-scroll';
export default {
    props: {
        probeType: {
            type: Number,
            defalut: 1
        },
        click: {
            type: Boolean,
            default: true
        },
        data: {
            type: Array,
            default: null
        },
        listenScroll: {
            type: Boolean,
            default: false
        },
        pullup: {
            type: Boolean,
            default: false
        },
        beforeScroll: {
            type: Boolean,
            default: false
        },
        refreshDelay: {
            type: Number,
            default: 20
        }
    },
    mounted() {
        setTimeout(() => {
            this._initScroll();
        }, 20);
    },
    methods: {
        // 初始化this.scroll
        _initScroll() {
            if (!this.$refs.wrapper) {
                return;
            }
            this.scroll = new BScroll(this.$refs.wrapper, {
                probeType: this.probeType,
                click: this.click
            });

            if (this.listenScroll) {
                let me = this;
                this.scroll.on('scroll', (pos) => {
                    me.$emit('scroll', pos);
                });
            }
            // 上拉更新
            if (this.pullup) {
                this.scroll.on('scrollEnd', () => {
                    if (this.scroll.y <= (this.scroll.maxScrollY + 50)) {
                        this.$emit('scrollToEnd');
                    }
                });
            }

            // 滚动条开始滚动之前派发一个事件，这里主要是处理移动端点击搜索框时出现键盘，滚动没有消失
            if (this.beforeScroll) {
                this.scroll.on('beforeScrollStart', () => {
                    this.$emit('beforeScroll');
                });
            }
        },
        // 判断this.scroll 是否启用
        enable() {
            this.scroll && this.scroll.enable();
        },
        // 关闭this.scroll
        disable() {
            this.scroll && this.scroll.disable();
        },
        // 刷新
        refresh() {
            this.scroll && this.scroll.refresh();
        },
        // 滚动到指定的位置
        scrollTo() {
            this.scroll && this.scroll.scrollTo.apply(this.scroll, arguments);
        },
        // 滚动到指定的目标元素
        scrollToElement() {
            this.scroll && this.scroll.scrollToElement.apply(this.scroll, arguments);
        }
    },
    // 监测data数据是否变化，变化就刷新this.scroll
    watch: {
        data() {
            setTimeout(() => {
                this.refresh();
            }, this.refreshDelay);
        }
    }
};
</script>
<style lang="stylus">

</style>
