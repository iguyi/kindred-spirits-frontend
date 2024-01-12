import myAxios from "../plugins/myAxios";
import {getCurrentUserState, setCurrentUserState, clearCurrentUserState} from "../states/user";

/**
 * 获取当前用户
 */
const getCurrentUser = async () => {
    const currentUser = getCurrentUserState();
    if (currentUser) {
        return currentUser;
    }
    // 不存在, 从后端获取
    const res = await myAxios.get('/user/current');
    if (res.data.code === 0) {
        setCurrentUserState(res.data.data);
        return getCurrentUserState();
    }
    return null;
}

/**
 * 更新当前用户信息
 */
const updateCacheUser = async () => {
    const res = await myAxios.get('/user/current');
    if (res.data.code === 0) {
        setCurrentUserState(res.data.data);
        return getCurrentUserState();
    }
    return null;
}

/**
 * 清空当前用户信息的缓存, 退出登录
 */
const clearCacheUser= async () => {
    await clearCurrentUserState()
}

export {
    getCurrentUser,
    updateCacheUser,
    clearCacheUser
}
