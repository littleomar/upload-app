<template>
  <div class="wrapper">
    <div class="button-wrapper">
      <router-link to="/user/login" class="button" :class="{active:this.$route.name==='Login'}">登&nbsp;&nbsp;录</router-link>
      <router-link to="/user/register" class="button" :class="{active:this.$route.name==='Register'}">注&nbsp;&nbsp;册</router-link>
    </div>
    <router-view/>
  </div>
</template>

<script>
  export default {
    name: "User"
  }
</script>

<style lang="scss" scoped>
  .wrapper{
    width: 352px;
    /*height: 462px;*/
    margin: 260px auto 100px;
    border-radius: 5px;
    border: 1px solid #ddd;
    box-shadow: 5px 5px 5px #ddd;
    background-color: #999;
    .button-wrapper{
      display: flex;
      padding: 0 20px;
      .button{
        box-sizing: border-box;
        text-decoration: none;
        text-align: center;
        display: block;
        width: 50%;
        height: 43px;
        color: #fff;
        line-height: 20px;
        padding: 10px 0;
        font-size: 18px;
        &.active{
          border-bottom: 3px solid deepskyblue;
        }
      }
    }

  }
</style>
