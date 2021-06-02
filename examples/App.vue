<template>
  <div id="app">
    <img alt="Vue logo" src="./assets/logo.png" />
    <el-row type="flex">
      <el-col :span="3">3</el-col>
      <v-flex1>111</v-flex1>
    </el-row>
    <el-button @click="visible = !visible">visible</el-button>
    <v-dialog :visible.sync="visible"></v-dialog>
  </div>
</template>

<script>
export default {
  name: "App",
  data() {
    return {
      visible: false,
    };
  },
  mounted() {},
};
</script>

<style lang="scss">
#app {
  font-family: Avenir, Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  color: #2c3e50;
  margin-top: 60px;
}
</style>
