
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
    status: 'online' | 'idle' | 'dnd'| 'offline'|'invisible',
    isAdmin: Boolean
}

export {Member,Role,Channel}