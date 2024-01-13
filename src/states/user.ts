import {UserType} from "../models/user";

let currentUserState: UserType;

const setCurrentUserState = (user: UserType) => {
    // @ts-ignore
    user.tags = JSON.parse(user.tags);
    currentUserState = user;
}

const getCurrentUserState = (): UserType => {
    return currentUserState;
}

const clearCurrentUserState = async () => {
    currentUserState = null;
}

export {
    setCurrentUserState,
    getCurrentUserState,
    clearCurrentUserState
}