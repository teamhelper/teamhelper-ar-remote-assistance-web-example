<template>
  <div class="user-list">
    <template v-for="(item, index) in userListData">
      <div class="user-item" :key="`user_${index}`" @click="handleCall(item)" v-if="userInfo.userId != item.userId">
        <div class="user-item-i">
          <span>用户姓名 {{ item.nickname }}</span>
        </div>
        <div class="user-item-i">
          <span><strong>userId: {{ item.userId }}</strong></span>
        </div>
      </div>
    </template>
  </div>
</template>

<script>
export default {
  name: 'userList',
  props: ['THMKitEvent', 'userInfo'],
  data() {
    return {
      userListData: []
    }
  },
  mounted() {
    this.handleGetUserListData()
  },
  methods: {
    handleGetUserListData: async function () {
      const psnRes = await this.THMKitEvent.getUserList()
      if (psnRes.code != 200) {
        this.$message.error(psnRes.msg)
        return false
      }
      this.userListData = psnRes.data
    },
    handleCall: function (row) {
      this.$emit('handleCall', row)
    }
  }
}
</script>

<style lang="scss" scoped>
.user-list {
  width: 100%;
  height: 400px;
  overflow: hidden;
  overflow-y: scroll;
  cursor: pointer;

  .user-item {
    width: calc(100% - 20px - 10px);
    height: 60px;
    background: rgba($color: #F5F7FA, $alpha: 1);
    display: flex;
    flex-direction: column;
   justify-content: center;
    margin: 5px;
    padding: 10px 10px;
    border-radius: 5px;
    .user-item-i {
      margin:5px 0;
    }
  }
}
</style>
