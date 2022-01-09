interface Role {
    name: String,
    id: String,
    color: String,
    isAdmin: Boolean
}
interface Channel{
    channelName: String,
    channelId: String,
}
interface Member {
    nickName: String|null,
    name: String,
    tag: String,
    id: String,
    avatar: String,
    roles?: Array<Role>,//
    isAdmin: Boolean
}

export {Member,Role,Channel}