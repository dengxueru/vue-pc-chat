import ConnectionStatus from "@/wfc/client/connectionStatus";
import wfc from "@/wfc/client/wfc";
import EventType from "@/wfc/client/wfcEvent";
import ConversationType from "@/wfc/model/conversationType";
import {numberValue} from "@/wfc/util/longUtil";

let store = {
    debug: true,
    state: {
        conversation: {
            currentConversationInfo: null,
            conversationInfoList: [],
            currentConversationMessageList: [],
        },

        contact: {
            currentFriendRequest: null,
            currentGroup: null,
            currentFriend: null,

            expandFriendRequestList: false,
            expandFriendList: false,
            expandGroup: false,
        },

        search: {
            query: null,
            show: false,
        },

        pick: {
            users: [],
            conversations: [],
        },

        misc: {
            test: false,
            connectionStatus: ConnectionStatus.ConnectionStatusUnconnected,
        },
    },

    init() {
        wfc.eventEmitter.on(EventType.ConnectionStatusChanged, (status) => {
            this.state.misc.connectionStatus = status;
        });

        wfc.eventEmitter.on(EventType.UserInfosUpdate, (userInfos) => {
            // TODO optimize
            this._loadDefaultConversationList();
            this._loadCurrentConversationMessages();
            // TODO 其他相关逻辑
        });

        wfc.eventEmitter.on(EventType.GroupInfosUpdate, (groupInfos) => {
            // TODO optimize
            this._loadDefaultConversationList();
            // TODO 其他相关逻辑

        });

        wfc.eventEmitter.on(EventType.ReceiveMessage, (msg, hasMore) => {
            console.log('jooo', msg, hasMore)
            if (hasMore) {
                // do nothing
                return;
            }
            this._loadDefaultConversationList();
            if (msg.conversation.equal(this.state.conversation.currentConversationInfo.conversation)) {
                this._loadCurrentConversationMessages();
            }
        });

        wfc.eventEmitter.on(EventType.RecallMessage, (operator, messageUid) => {
            this._loadDefaultConversationList();
        })
    },

    // conversation actions

    _loadDefaultConversationList() {
        this.loadConversationList([0, 1], [0])
    },

    loadConversationList(conversationType = [0, 1], lines = [0]) {
        let conversationList = wfc.getConversationList(conversationType, lines);
        conversationList.forEach(info => {
            if (info.conversation.type === ConversationType.Single) {
                info.conversation._target = wfc.getUserInfo(info.conversation.target, false);
            } else if (info.conversation.type === ConversationType.Group) {
                info.conversation._target = wfc.getGroupInfo(info.conversation.target, false);
            }
        });
        this.state.conversation.conversationInfoList = conversationList;
    },

    setCurrentConversationInfo(conversationInfo) {
        if (this.debug) {
            console.log('setCurrentConversation', this.state.currentConversation, conversationInfo);
        }
        this.state.conversation.currentConversationInfo = conversationInfo;
        this._loadCurrentConversationMessages();
    },

    _loadCurrentConversationMessages() {
        if(!this.state.conversation.currentConversationInfo){
            return;
        }
        let conversation = this.state.conversation.currentConversationInfo.conversation;
        let msgs = wfc.getMessages(conversation);
        let lastTimestamp = 0;
        msgs.forEach(m => {
            // TODO
            // _from
            // _showTime
            m._from = wfc.getUserInfo(m.from, false, m.conversation.type === ConversationType.Group ? m.conversation.target : '');
            if (numberValue(m.timestamp) - numberValue(lastTimestamp) > 60 * 1000) {
                m._showTime = true;
                lastTimestamp = m.timestamp;
            }
        });
        console.log('loaddc', msgs)
        this.state.conversation.currentConversationMessageList = msgs;
    },

    // contact actions
    setCurrentFriendRequest(friendRequest) {
        this.state.contact.currentFriendRequest = friendRequest;
        this.state.contact.currentFriend = null;
        this.state.contact.currentGroup = null;
    },

    setCurrentFriend(friend) {
        this.state.contact.currentFriendRequest = null;
        this.state.contact.currentFriend = friend;
        this.state.contact.currentGroup = null;
    },

    setCurrentGroup(group) {
        this.state.contact.currentFriendRequest = null;
        this.state.contact.currentFriend = null;
        this.state.contact.currentGroup = group;
    },

    toggleGroupList() {
        this.state.contact.expandGroup = !this.state.contact.expandGroup;
    },

    toggleFriendRequestList() {
        this.state.contact.expandFriendRequestList = !this.state.contact.expandFriendRequestList;
    },

    toggleFriendList() {
        this.state.contact.expandFriendList = !this.state.contact.expandFriendList;
    },

    // search actions
    toggleSearchView(show) {
        console.log('ts', show, this.state.search.show);
        this.state.search.show = show
    },

    setSearchQuery(query) {
        this.state.search.query = query;
    },

    // pick actions
    pickUser(user, pick = true) {
        if (pick) {
            this.state.pick.users.push(user);
        } else {
            // TODO 根据user.uid 判断
            this.state.pick.users = this.state.pick.users.filter(u => user.uid !== u.uid)
        }
    },

    // TODO pickConversation


    // misc actions
}

export default store
