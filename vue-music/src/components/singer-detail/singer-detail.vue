<template>
  <transition name="slide">
    <!-- 歌曲列表 -->
    <music-list :songs="songs" :title="title" :bg-image="bgImage"></music-list>
  </transition>
</template>

<script type="text/ecmascript-6">
import {mapGetters} from 'vuex';
import {getSingerDetail} from '../../api/singer';
import {ERR_OK} from '../../api/config';
import {createSong} from '../../common/js/song';
import MusicList from '../music-list/music-list';
  export default {
    data() {
      return {
        songs: []
      };
    },
    computed: {
      // 计算标题
      title() {
        return this.singer.name;
      },
      // 计算出背景图
      bgImage() {
        return this.singer.avatar;
      },
      // 获取singer数据
      ...mapGetters([
        'singer'
      ])
    },
    created() {
      // 初始化数据
      this._getSingerDetail();
    },
    methods: {
      _getSingerDetail() {
        // 如果没有singer.id就返回去
        if (!this.singer.id) {
        this.$router.push('/singer');
        return;
      }
        getSingerDetail(this.singer.id).then((res) => {
          if (res.code === ERR_OK) {
            this.songs = this._normalizeSongs(res.data.list);
            // console.log(this.song);
          }
        });
      },
      // 处理需要的数据
      _normalizeSongs(list) {
        let ret = [];
        list.forEach((item) => {
          let {musicData} = item;
          if (musicData.songid && musicData.albummid) {
            ret.push(createSong(musicData));
          }
        });
        return ret;
      }
    },
    components: {
      MusicList
    }
  };
</script>

<style scoped lang="stylus" rel="stylesheet/stylus">
@import "~@/common/stylus/variable"
  .slide-enter-active, .slide-leave-active
    transition: all 0.3s

  .slide-enter, .slide-leave-to
    transform: translate3d(100%, 0, 0)
</style>