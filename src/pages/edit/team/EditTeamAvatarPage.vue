<template>
  <!-- 顶部 -->
  <van-nav-bar
      v-if="!$route.meta.navBar"
      :title="$route.meta.title"
      right-text="按钮"
      left-arrow
      @click-left="onClickLeft"
      @click-right="onClickRight"
      class="custom-navbar"
  >
    <template #left>
      <van-icon name="arrow-left" size="18"/>
    </template>
    <template #right>
      <van-icon name="success" size="18"/>
    </template>
  </van-nav-bar>

  <div>
    <van-cell
        title="头像"
        center
    >
      <van-uploader
          :after-read="afterRead"
          :max-size="100 * 1024"
          @oversize="onOversize">
        <van-image
            round
            width="48px"
            height="48px"
            :src="(avatarUrl.url === null) ? currentValue : avatarUrl.url"
        />
      </van-uploader>
    </van-cell>
  </div>
</template>

<script setup>
import {useRoute, useRouter} from "vue-router";
import {ref} from "vue";
import {Toast} from "vant";
import myAxios from "../../../plugins/myAxios.ts";
import {getCurrentUser} from "../../../services/user.ts";

const router = useRouter();
const onClickLeft = () => {
  router.back();
};

const route = useRoute();
const {teamId, currentValue} = route.query;

const avatarUrl = ref({url: null});
// 头像的数据流
const avatarData = ref({data: null});

let res;
const onClickRight = async () => {
  // 获取当前用户
  const currentUser = await getCurrentUser();
  if (!currentUser) {
    Toast.fail('用户未登录');
    return;
  }

  res = await myAxios.post('/common/avatar/team', {
    'teamId': Number(teamId),
    'avatar': avatarData.value.data.file,
  }, {
    headers: {
      'Content-Type': 'multipart/form-data'
    }
  });

  if (res.data.code === 0 && res.data.data > 0) {
    Toast.success('修改成功');
  } else {
    Toast.fail('修改失败');
  }

  router.back();
}

//-------- 头像 --------

/**
 * 上传头像
 */
const afterRead = async (file) => {
  avatarUrl.value.url = file.objectUrl;
  avatarData.value.data = file;
};

/**
 * 头像大小不能超过 100kb
 */
const onOversize = () => {
  Toast('头像大小不能超过 100kb');
};
</script>

<style scoped>
.custom-navbar {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  z-index: 1;
}
</style>