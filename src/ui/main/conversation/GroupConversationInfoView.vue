<template>
    <div class="conversation-info">
        <header>
            <label>
                {{ $t('conversation.group_name') }}
                <input type="text"
                       ref="groupNameInput"
                       :disabled="!enableEditGroupNameOrAnnouncement"
                       v-model="newGroupName"
                       @keyup.enter="updateGroupName"
                       :placeholder="conversationInfo.conversation._target._displayName">
            </label>
            <label>
                {{ $t('conversation.group_announcement') }}
                <input type="text"
                       ref="groupAnnouncementInput"
                       :disabled="!enableEditGroupNameOrAnnouncement"
                       @keyup.enter='updateGroupAnnouncement'
                       v-model.trim="newGroupAnnouncement"
                       :placeholder="groupAnnouncement">
            </label>
            <label>
                {{ $t('group.alias') }}
                <input type="text"
                       @keyup.enter='updateGroupAlias'
                       v-model.trim="newGroupAlias"
                       :placeholder="groupAlias">
            </label>
            <label class="switch">
                保存到通讯录
                <input type="checkbox"
                       :checked="conversationInfo.conversation._target._isFav"
                       @change="setFavGroup(conversationInfo.conversation.target, $event.target.checked)">
                <span class="slider"></span>
            </label>
        </header>
        <div class="search-item">
            <input type="text" v-model="filterQuery" :placeholder="$t('common.search')">
            <i class="icon-ion-ios-search"></i>
        </div>
        <div class="member-container">
            <div v-if="enableAddGroupMember && !filterQuery" @click="showCreateConversationModal" class="action-item">
                <div class="icon">+</div>
                <p>{{ $t('conversation.add_member') }}</p>
            </div>
            <div v-if="enableRemoveGroupMember && !filterQuery" @click="showRemoveGroupMemberModal" class="action-item">
                <div class="icon">-</div>
                <p>{{ $t('conversation.remove_member') }}</p>
            </div>
            <UserListVue :users="users"
                         :show-category-label="false"
                         :padding-left="'20px'"
            />
        </div>
        <div v-if="enableQuitGroup" @click="quitGroup" class="quit-group-item">
            {{ $t('conversation.quit_group') }}
        </div>
    </div>
</template>

<script>
import UserListVue from "@/ui/main/user/UserListVue";
import ConversationInfo from "@/wfc/model/conversationInfo";
import store from "@/store";
import wfc from "@/wfc/client/wfc";
import axios from "axios";
import GroupMemberType from "@/wfc/model/groupMemberType";
import GroupType from "@/wfc/model/groupType";
import ModifyGroupInfoType from "../../../wfc/model/modifyGroupInfoType";
import EventType from "../../../wfc/client/wfcEvent";
import appServerApi from "../../../api/appServerApi";
import AppServerError from "../../../api/appServerError";

export default {
    name: "GroupConversationInfoView",
    props: {
        conversationInfo: {
            type: ConversationInfo,
            required: true,
        }
    },
    data() {
        return {
            groupMemberUserInfos: store.getConversationMemberUsrInfos(this.conversationInfo.conversation),
            filterQuery: '',
            sharedContactState: store.state.contact,
            groupAnnouncement: '',
            newGroupName: '',
            newGroupAnnouncement: '',
            newGroupAlias: '',
            groupAlias: '',
        }
    },

    mounted() {
        wfc.eventEmitter.on(EventType.UserInfosUpdate, this.onUserInfosUpdate);
        wfc.eventEmitter.on(EventType.GroupMembersUpdate, this.onUserInfosUpdate)
        wfc.getGroupMembers(this.conversationInfo.conversation.target, true);

        this.groupAlias = wfc.getUserInfo(wfc.getUserId(), false, this.conversationInfo.conversation.target).groupAlias;
    },

    beforeDestroy() {
        wfc.eventEmitter.removeListener(EventType.UserInfosUpdate, this.onUserInfosUpdate);
        wfc.eventEmitter.removeListener(EventType.GroupMembersUpdate, this.onUserInfosUpdate);
    },

    components: {UserListVue},
    methods: {
        onUserInfosUpdate() {
            this.groupMemberUserInfos = store.getConversationMemberUsrInfos(this.conversationInfo.conversation);
        },
        showCreateConversationModal() {
            let successCB = users => {
                let ids = users.map(u => u.uid);
                wfc.addGroupMembers(this.conversationInfo.conversation.target, ids, null, [0])
            }
            let groupMemberUserInfos = store.getGroupMemberUserInfos(this.conversationInfo.conversation.target, false);

            this.$pickContact({
                successCB,
                initialCheckedUsers: groupMemberUserInfos,
                uncheckableUsers: groupMemberUserInfos,
                confirmTitle: this.$t('common.add'),
            });
        },

        showRemoveGroupMemberModal() {
            let successCB = users => {
                let ids = users.map(u => u.uid);
                wfc.kickoffGroupMembers(this.conversationInfo.conversation.target, ids, [0])
            }
            let groupMemberUserInfos = store.getGroupMemberUserInfos(this.conversationInfo.conversation.target, false, false);
            this.$pickContact({
                successCB,
                users: groupMemberUserInfos,
            });
        },

        showUserInfo(user) {
            console.log('todo show userInfo', user);
        },

        async getGroupAnnouncement() {
            appServerApi.getGroupAnnouncement(this.conversationInfo.conversation.target)
                .then(response => {
                    if (response.text) {
                        this.groupAnnouncement = response.text;
                    }
                })
                .catch(err => {
                    console.log('getGroupAnnouncement', err)
                    if (this.enableEditGroupNameOrAnnouncement) {
                        this.groupAnnouncement = this.$t('conversation.click_to_edit_group_announcement');
                    }
                })
        },

        updateGroupName() {
            let groupId = this.conversationInfo.conversation.target;
            if (!this.newGroupName || this.newGroupName === this.conversationInfo.conversation._target._displayName) {
                return;
            }

            wfc.modifyGroupInfo(groupId, ModifyGroupInfoType.Modify_Group_Name, this.newGroupName, [0], null, () => {
                this.conversationInfo.conversation._target._displayName = this.newGroupName;
                this.$refs.groupNameInput.blur();
            }, (err) => {
                // do nothing
            })
        },

        async updateGroupAnnouncement() {
            if (!this.newGroupAnnouncement || this.newGroupAnnouncement === this.groupAnnouncement) {
                return;
            }
            await appServerApi.updateGroupAnnouncement(wfc.getUserId(), this.conversationInfo.conversation.target, this.newGroupAnnouncement)
            this.groupAnnouncement = this.newGroupAnnouncement;
            this.$refs.groupAnnouncementInput.blur();
        },

        updateGroupAlias() {
            if (this.newGroupAlias && this.newGroupAlias !== this.groupAlias) {
                wfc.modifyGroupAlias(this.conversationInfo.conversation.target, this.newGroupAlias, [0], null, () => {
                    this.groupAlias = this.newGroupAlias;
                }, null);
            }
        },

        quitGroup() {
            store.quitGroup(this.conversationInfo.conversation.target)
        },

        setFavGroup(groupId, fav) {
            wfc.setFavGroup(groupId, fav, () => {
                this.conversationInfo.conversation._target._isFav = fav;
                store.reloadFavGroupList();
            }, (err) => {
                console.log('setFavGroup error', err);
            })
        }
    },

    created() {
        this.getGroupAnnouncement();
    },

    computed: {
        enableQuitGroup() {
            let groupInfo = this.conversationInfo.conversation._target;
            if (groupInfo.type === GroupType.Organization) {
                return false;
            }
            return true;
        },

        enableAddGroupMember() {
            let selfUid = wfc.getUserId();
            let groupInfo = this.conversationInfo.conversation._target;
            if (groupInfo.type === GroupType.Organization) {
                return false;
            }
            //在group type为Restricted时，0 开放加入权限（群成员可以拉人，用户也可以主动加入）；1 只能群成员拉人入群；2 只能群管理拉人入群
            if (groupInfo.type === GroupType.Restricted) {
                if (groupInfo.joinType === 0 || groupInfo.joinType === 1) {
                    return true;
                } else if (groupInfo.joinType === 2) {
                    let groupMember = wfc.getGroupMember(this.conversationInfo.conversation.target, selfUid);
                    return [GroupMemberType.Manager, GroupMemberType.Owner].indexOf(groupMember.type) >= 0;
                }
            }
            return true;
        },

        enableRemoveGroupMember() {
            let groupInfo = this.conversationInfo.conversation._target;
            if (groupInfo.type === GroupType.Organization) {
                return false;
            }
            let selfUid = wfc.getUserId();
            let groupMember = wfc.getGroupMember(this.conversationInfo.conversation.target, selfUid);
            if (groupMember) {
                return [GroupMemberType.Manager, GroupMemberType.Owner].indexOf(groupMember.type) >= 0;
            }
            return false;

        },

        enableEditGroupNameOrAnnouncement() {
            let groupInfo = this.conversationInfo.conversation._target;
            if (groupInfo.type === GroupType.Organization) {
                return false;
            }
            let selfUid = wfc.getUserId();
            let groupMember = wfc.getGroupMember(this.conversationInfo.conversation.target, selfUid);
            if (groupMember) {
                return [GroupMemberType.Manager, GroupMemberType.Owner].indexOf(groupMember.type) >= 0;
            }
            return false;
        },

        users() {
            if (this.filterQuery) {
                return store.filterUsers(this.groupMemberUserInfos, this.filterQuery)
            } else {
                return this.groupMemberUserInfos;
            }
        }
    },
};
</script>

<style lang="css" scoped>
.conversation-info {
    display: flex;
    flex-direction: column;
    position: relative;
    justify-content: flex-start;
    height: 100%;
    overflow: hidden;
}

header {
    padding-left: 20px;
    padding-right: 20px;
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
}

header label {
    width: 100%;
    display: flex;
    margin-top: 15px;
    flex-direction: column;
    justify-content: center;
    align-items: flex-start;
    font-size: 14px;
    color: #999999;
}

header label:last-of-type {
    padding-bottom: 15px;
    border-bottom: 1px solid #ececec;
}

header label input {
    flex: 1;
    margin-top: 5px;
    border: none;
    outline: none;
    width: 100%;
    font-size: 13px;
    background-color: transparent;
}

.member-container {
    flex: 1;
    overflow: auto;
}

.search-item {
    position: relative;
    padding: 10px 20px;
}

.search-item input {
    width: 100%;
    padding: 0 10px 0 20px;
    height: 25px;
    border-radius: 3px;
    border: 1px solid #ededed;
    background-color: white;
    text-align: left;
    outline: none;
}

.search-item input:active {
    border: 1px solid #4168e0;
}

.search-item input:focus {
    border: 1px solid #4168e0;
}

.search-item i {
    position: absolute;
    left: 25px;
    top: 15px;
}

.action-item {
    height: 50px;
    display: flex;
    padding-left: 20px;
    align-items: center;
}

.action-item .icon {
    width: 40px;
    height: 40px;
    display: flex;
    justify-content: center;
    align-items: center;
    border-radius: 3px;
    border: 1px dashed #d6d6d6;
}

.action-item img {
    width: 40px;
    height: 40px;
}

.action-item p {
    margin-left: 10px;
    font-size: 13px;
}

.action-item:active {
    background-color: #d6d6d6;
}

.quit-group-item {
    display: flex;
    color: red;
    align-items: center;
    justify-content: center;
    height: 50px;
    max-height: 50px;
    border-top: 1px solid #ececec;
}

.quit-group-item:active {
    background: #d6d6d6;
}

.switch {
    display: flex;
    flex-direction: row;
}

.switch input {
    margin-left: 20px;
}

</style>
