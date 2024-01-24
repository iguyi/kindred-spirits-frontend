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

  <form action="/public">
    <van-search
        v-model="searchText"
        show-action
        placeholder="请输入搜索标签"
        @search="onSearch"
        @cancel="onCancel"
    >
      <template #action>
        <div style="padding-bottom: 5px">
          <van-button
              icon="search"
              type="primary"
              size="small"
              color="green"
              @click="onSearch"
          />
        </div>
      </template>
    </van-search>
  </form>
  <van-divider
      :style="{ color: '#1989fa', borderColor: '#1989fa', padding: '0 16px' }"
  >
    已选标签
    <div style="padding-bottom: 5px">
      <van-button
          icon="delete"
          type="primary"
          size="mini"
          color="red"
          style="margin-left: 5px"
          @click="closeAll"
      />
    </div>
  </van-divider>
  <div v-if="activeIds.length === 0" class="van-ellipsis" style="padding-left: 20px; color: rgb(92, 139, 250)">
    暂未选择搜索标签
  </div>
  <van-row gutter="16" style="padding: 0 16px">
    <van-col v-for="tag in activeIds">
      <van-tag closeable size="small" type="success" @close="doClose(tag)">
        {{ tag }}
      </van-tag>
    </van-col>
  </van-row>

  <!-- 可选标签 -->
  <van-divider
      :style="{ color: '#1989fa', borderColor: '#1989fa', padding: '0 16px' }"
  >
    可选标签
  </van-divider>
  <van-tree-select
      v-model:active-id="activeIds"
      v-model:main-active-index="activeIndex"
      :items="tagList"
  />
</template>

<script setup>
import {useRoute, useRouter} from "vue-router";
import {onMounted, ref} from "vue";
import {Toast} from "vant";
import myAxios from "../../../plugins/myAxios.ts";
import {getCurrentUser, updateCacheUser} from "../../../services/user.ts";

const router = useRouter();
const route = useRoute();

// 可选标签列表 - 源数据
let originTagList;

// 可选标签列表
let tagList = ref(originTagList);

// 已选中的标签的消息
const activeIds = ref([]);
const activeIndex = ref(0);

let res;

// 搜索内容
const searchText = ref('');

// 用户(当前编辑)属性
const editUser = ref({});

const tagGroup = ref({});

onMounted(async () => {
  // 处理用户已选标签
  let currentValue = JSON.parse(route.query.currentValue);
  editUser.value = ref({currentValue: currentValue});
  currentValue.forEach(tagName => {
    activeIds.value.push(tagName);
  });

  const result = await myAxios.get("/tag/simple/list");
  if (!result || result.data.code !== 0) {
    Toast.fail("标签数据数据异常");
    return;
  }

  let responseTagData = result.data.data;
  tagGroup.value = responseTagData;

  let tempData = [];
  responseTagData.forEach(childrenTagList => {
    let parentName;
    let childrenList = [];

    childrenTagList.forEach(tag => {
      let tagName = tag.tagName;
      if (tag.isParent === 1) {
        parentName = tagName;
      } else {
        childrenList.push({text: tagName, id: tagName});
      }
    });

    tempData.push({text: parentName, children: childrenList})
  });
  originTagList = tempData;
  tagList.value = originTagList;
});

/**
 * 搜索条件过滤
 *
 * @param val
 */
const onSearch = (val) => {
  tagList.value = originTagList.map(parentTag => {
    // 克隆一份原始数据
    const tempChildren = [...parentTag.children];
    const tempParentTag = {...parentTag};
    tempParentTag.children = tempChildren.filter(item => item.text.includes(searchText.value));
    return tempParentTag;
  });
};

/**
 * 取消, 清空搜索框中的内容
 * 只对标签搜索有效
 */
const onCancel = () => {
  searchText.value = '';
  tagList.value = originTagList;
};

/**
 * 清空所有已选标签
 */
const closeAll = () => {
  if (activeIds.value.length === 0) {
    return;
  }
  activeIds.value.forEach(item => doClose(item));
}

/**
 * 移除已选标签
 * @param tag - 已选标签
 */
const doClose = (tag) => {
  activeIds.value = activeIds.value.filter(item => item !== tag);
};

/**
 * 回退到上一个页面
 */
const onClickLeft = () => {
  router.back();
};

/**
 * 提交修改
 * @returns {Promise<void>}
 */
const onClickRight = async () => {
  // 获取当前用户
  const currentUser = await getCurrentUser();
  if (!currentUser) {
    Toast.fail('用户未登录')
    return;
  }

  // alert(JSON.stringify(editUser.value.currentValue))
  // alert(JSON.stringify(tagGroup.value))

  let newTagData = {};
  activeIds.value.forEach(tagName => {
    tagGroup.value.forEach(group => {
      let parentId;
      group.forEach(tag => {
        if (tag.isParent === 1) {
          parentId = tag.id.toString();
        } else {
          if (tag.tagName === tagName) {
            if (newTagData.hasOwnProperty(parentId.toString())) {
              newTagData[parentId.toString()].push({"tag": tag.tagName, "weights": tag.weights});
            } else {
              newTagData[parentId.toString()] = [{"tag": tag.tagName, "weights": tag.weights}];
            }
          }
        }
      });
    });
  });

  res = await myAxios.post('/user/update', {
    'id': currentUser.id,
    'tags': JSON.stringify(newTagData)
  });

  if (res && (res.data.code === 0 && res.data.data > 0)) {
    await updateCacheUser();
    Toast.success('修改成功');
  } else {
    Toast.fail('修改失败');
  }

  router.back();
}
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