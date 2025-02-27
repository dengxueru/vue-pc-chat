<template>
    <section class="contact-list">
        <ul>
            <li>
                <div @click="showNewFriends" class="category-item-container">
                    <i class="arrow right" v-bind:class="{down: sharedContactState.expandFriendRequestList}"></i>
                    <div class="category-item">
                        <span class="title">{{ $t('contact.new_friend') }}</span>
                        <span class="desc" v-if="sharedContactState.unreadFriendRequestCount > 0">{{ sharedContactState.unreadFriendRequestCount }}</span>
                    </div>
                </div>
                <NewFriendListView v-if="sharedContactState.expandFriendRequestList"/>
            </li>
            <li>
                <div @click="showGroups" class="category-item-container">
                    <i class="arrow right" v-bind:class="{down: sharedContactState.expandGroup}"></i>
                    <div class="category-item">
                        <span class="title">{{ $t('contact.group') }}</span>
                        <span class="desc">{{ sharedContactState.favGroupList.length }}</span>
                    </div>
                </div>
                <GroupListVue v-if="sharedContactState.expandGroup"/>
            </li>
            <li>
                <div @click="showChannels" class="category-item-container">
                    <i class="arrow right" v-bind:class="{down: sharedContactState.expandChanel}"></i>
                    <div class="category-item">
                        <span class="title">{{ $t('contact.channel') }}</span>
                        <span class="desc">{{ sharedContactState.channelList.length }}</span>
                    </div>
                </div>
                <ChannelListView v-if="sharedContactState.expandChanel"/>
            </li>
            <li>
                <div @click="showOrganization" class="category-item-container">
                    <i class="arrow right" v-bind:class="{down: sharedContactState.expandOrganization}"></i>
                    <div class="category-item">
                        <span class="title">组织结构</span>
                        <span class="desc"></span>
                    </div>
                </div>
                <OrganizationListView v-if="sharedContactState.expandOrganization"/>
            </li>
            <li>
                <div @click="showContacts" class="category-item-container">
                    <i class="arrow right" v-bind:class="{down: sharedContactState.expandFriendList}"></i>
                    <div class="category-item">
                        <span class="title">{{ $t('contact.contact') }}</span>
                        <span class="desc">{{ sharedContactState.friendList.length }}</span>
                    </div>
                </div>
                <UserListVue
                    v-if="sharedContactState.expandFriendList && users.length < 200"
                    :enable-pick="false"
                    :users="users"
                    :click-user-item-func="setCurrentUser"
                    :padding-left="'30px'"
                />
                <virtual-list
                    v-else-if="sharedContactState.expandFriendList"
                    :data-component="contactItemView" :data-sources="groupedContacts" :data-key="'uid'"
                    :estimate-size="30"
                    style="max-height: 600px; overflow-y: auto"/>
            </li>
        </ul>
    </section>
</template>
<script>
import FriendRequestListView from "@/ui/main/contact/FriendRequestListView";
import GroupListVue from "@/ui/main/contact/GroupListView";
import store from "@/store";
import UserListVue from "@/ui/main/user/UserListVue";
import ChannelListView from "./ChannelListView";
import ContactItemView from "./ContactItemView";
import OrganizationListView from "./OrganizationListView.vue";
import organizationServerApi from "../../../api/organizationServerApi";

export default {
    name: "ContactListView",
    components: {
        OrganizationListView,
        ChannelListView,
        UserListVue,
        GroupListVue,
        NewFriendListView: FriendRequestListView
    },
    data() {
        return {
            sharedContactState: store.state.contact,
            contactItemView: ContactItemView,
            users: store.state.contact.favContactList.concat(store.state.contact.friendList),
            rootOrganizations: [],
        }
    },
    methods: {
        setCurrentUser(userInfo) {
            store.setCurrentFriend(userInfo)
        },
        showNewFriends() {
            store.toggleFriendRequestList();
        },
        showGroups() {
            store.toggleGroupList();
        },
        showChannels() {
            store.toggleChannelList();
        },
        showContacts() {
            store.toggleFriendList();
        },
        showOrganization() {
            store.toggleOrganizationList();
        }
    },
    computed: {
        groupedContacts() {
            let groupedUsers = [];
            let currentCategory = {};
            let lastCategory = null;
            this.users.forEach((user) => {
                if (!lastCategory || lastCategory !== user._category) {
                    lastCategory = user._category;
                    currentCategory = {
                        type: 'category',
                        category: user._category,
                        uid: user._category,
                    };
                    groupedUsers.push(currentCategory);
                    groupedUsers.push(user);
                } else {
                    groupedUsers.push(user);
                }
            });
            return groupedUsers;
        },
    }
}
</script>

<style lang="css" scoped>

.contact-list {
    height: 100%;
    overflow: auto;
}

.category-item-container {
    height: 40px;
    display: flex;
    align-items: center;
    padding-left: 15px;
    color: #262626;
    font-size: 14px;
    position: sticky;
    background-color: #fafafa;
    top: 0;
}

.category-item {
    display: flex;
    width: 100%;
    justify-content: space-between;
}

.category-item span:last-of-type {
    margin-right: 15px;
}

.arrow {
    border: solid #b9b9b9;
    border-width: 0 1px 1px 0;
    display: inline-block;
    padding: 3px;
    margin-right: 10px;
}

.right {
    transform: rotate(-45deg);
    -webkit-transform: rotate(-45deg);
}

.left {
    transform: rotate(135deg);
    -webkit-transform: rotate(135deg);
}

.up {
    transform: rotate(-135deg);
    -webkit-transform: rotate(-135deg);
}

.down {
    transform: rotate(45deg);
    -webkit-transform: rotate(45deg);
}

</style>
