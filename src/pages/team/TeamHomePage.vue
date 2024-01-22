<template xmlns="http://www.w3.org/1999/html">
  <!-- 顶部 -->
  <van-nav-bar
      v-if="!$route.meta.navBar"
      :title="teamDetail.name"
      left-arrow
      @click-left="onClickLeft"
      class="custom-navbar"
  >
    <template #left>
      <van-icon name="arrow-left" size="18"/>
    </template>
  </van-nav-bar>

  <template v-if="teamDetail">
    <!-- 队伍头像   -->
    <van-cell is-link center>
      <template #title>
        <div style="font-size: 15px">头像</div>
      </template>
      <van-image
          round
          width="48px"
          height="48px"
          :src="teamDetail.avatarUrl"
      />
    </van-cell>

    <!--  队伍介绍  -->
    <van-cell center is-link>
      <template #title>
        <div style="font-size: 15px">队伍介绍</div>
      </template>
      <template #value>
        <div style="font-size: 15px">
          {{ teamDetail.name }}
        </div>
      </template>
    </van-cell>
    <van-cell is-link>
      <template #title>
        <div style="font-size: 15px">队伍介绍</div>
      </template>
      <template #label>
        <div style="font-size: 15px">
          {{ teamDetail.description }}
        </div>
      </template>
    </van-cell>

    <!-- 入队链接   -->
    <van-cell>
      <template #title>
        <div style="font-size: 15px">入队链接</div>
      </template>
      <template #label>
        <div style="font-size: 15px; margin-right: 5px">{{ teamDetail.teamLink ?? "无" }}</div>
      </template>
      <template #extra>
        <van-button round size="mini" type="success" icon="replay"/>
      </template>
    </van-cell>

    <!-- 入队截至时间   -->
    <van-cell>
      <template #title>
        <div style="font-size: 15px">入队截至时间</div>
      </template>
      <template #value>
        <div style="font-size: 15px; margin-right: 10px">{{ teamDetail.expireTime }}</div>
      </template>
    </van-cell>

    <!-- 队伍成员   -->
    <van-collapse v-model="activeNames">
      <van-collapse-item :title="`队伍成员(剩余 ${teamDetail.maxNum-teamDetail.num} 个位置)`" name="1">
        <van-cell
            v-for="user in teamDetail.userList"
            is-link
            center
        >
          <template #value>
            <div class="custom-cell">
              <div>
                <van-image
                    round
                    width="35px"
                    height="35px"
                    :src="user.avatarUrl"
                />
              </div>
              <div style="margin-left: 5px">
                <span class="custom-title">{{ user.username }}</span><br>
                <span class="custom-tag">
                  <van-tag
                      type="success"
                      v-if="user.id === teamDetail.userId"
                      style="margin-left: 3px; margin-right: 3px"
                  >
                    建队
                  </van-tag>
                  <van-tag
                      type="success"
                      v-if="user.id === teamDetail.leaderId"
                      style="margin-left: 3px; margin-right: 3px"
                  >
                    队长
                  </van-tag>
                  <van-tag
                      type="success"
                      v-if="user.id !== teamDetail.userId && user.id !== teamDetail.leaderId"
                      style="margin-left: 3px; margin-right: 3px"
                  >
                    队员
                  </van-tag>
                </span>
              </div>
            </div>
          </template>
        </van-cell>
      </van-collapse-item>
    </van-collapse>

    <!-- 创建时间   -->
    <van-cell>
      <template #title>
        <div style="font-size: 15px">创建时间</div>
      </template>
      <template #value>
        <div style="font-size: 15px; margin-right: 10px">{{ teamDetail.createTime }}</div>
      </template>
    </van-cell>
  </template>

</template>

<script setup lang="ts">
import {useRoute, useRouter} from "vue-router";
import {onMounted, ref} from "vue";
import myAxios from "../../plugins/myAxios";
import {Toast} from "vant";

const router = useRouter();
const route = useRoute();

const teamDetail = ref({});

const activeNames = ref(['1']);

onMounted(async () => {
  const {teamId} = route.query;
  const teamMessage = await myAxios.get("/team/check", {
    params: {
      teamId: Number(teamId)
    }
  });
  if (!teamMessage || teamMessage.data.code !== 0) {
    Toast.fail(teamMessage.data.description);
    return;
  }
  teamDetail.value = teamMessage.data.data;
});

/**
 * 回退
 */
const onClickLeft = () => {
  router.back();
}

</script>

<style scoped>
.custom-cell {
  display: flex;
  align-items: center; /* 垂直居中对齐 */
}

.custom-title {
  font-weight: bold;
  margin-top: 0;
  margin-right: 4px;
  vertical-align: middle;
  font-size: 20px;
}

.custom-tag {
  margin-right: 4px;
  vertical-align: middle;
}
</style>