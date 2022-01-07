<template>
  <div id="app">
    <v-crud border>
      hello word
      <!-- <div>
        <el-button type="primary" @click="openContextMenu">
          context menu
        </el-button>
      </div>
      <el-row type="flex">
        <el-col :span="8">8</el-col>
        <v-flex1>flex1</v-flex1>
      </el-row> -->
      <el-button @click="visible = true">button</el-button>
      <v-dialog
        :visible.sync="visible"
        width="500px"
        :props="{ beforeClose: beforeClose }"
      >
        dialog
      </v-dialog>
      <v-table v-bind="table"> </v-table>
    </v-crud>
  </div>
</template>

<script lang="jsx">
export default {
  name: "App",
  data() {
    return {
      visible: false,
      table: {
        ref: "table",
        props: {
          border: true,
        },
        on: {},
        data: [{ id: 1 }],
        columns: [
          {
            label: "column 1",
            prop: "column1",
            minWidth: 100,
            children: [
              {
                label: "column 1-1",
                prop: "column1-1",
                minWidth: 100,
              },
            ],
          },
          {
            label: "column 2",
            prop: "column2",
            minWidth: 100,
            children: [
              {
                label: "column 2-1",
                prop: "column2-1",
                minWidth: 100,
                children: [
                  { label: "column 2-1-1", prop: "column2-1-1", minWidth: 100 },
                  { label: "column 2-1-2", prop: "column2-1-2", minWidth: 100 },
                ],
              },
              { label: "column 2-2", prop: "column2-2", minWidth: 100 },
            ],
          },
        ],
      },
      contextMenu: [
        {
          label: "新增",
          "suffix-icon": "el-icon-plus",
          callback: (_, done) => {
            this.$message.info("点击了新增");
            done();
          },
        },
        {
          label: "编辑",
          "suffix-icon": "el-icon-edit",
          callback: (_, done) => {
            this.$message.info("点击了编辑");
            done();
          },
        },
        {
          label: "删除",
          "suffix-icon": "el-icon-delete",
          callback: (_, done) => {
            this.$message.info("点击了删除");
            done();
          },
        },
        {
          render(h) {
            return <div>render自定义内容</div>;
          },
          callback: (_, done) => {
            this.$message.info("点击了自定义内容");
            done();
          },
        },
        {
          label: "二级",
          "suffix-icon": "el-icon-right",
          children: [
            {
              label: "文本超出隐藏，有一天晚上",
              ellipsis: true,
            },
            {
              label: "禁用",
              disabled: true,
            },
            {
              label: "更多",
              callback: (_, done) => {
                this.$message.warning("开发中");
                done();
              },
            },
          ],
        },
      ],
    };
  },
  methods: {
    openContextMenu(event) {
      this.$crud.openContextMenu(event, {
        list: this.contextMenu,
      });
    },
    beforeClose(done) {
      console.log("beforeClose");
      done();
    },
  },
};
</script>

<style lang="scss">
html,
body {
  height: 100%;
  margin: 0;
}
#app {
  font-family: Avenir, Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  color: #2c3e50;
  box-sizing: border-box;
  text-align: center;
  height: 100%;
  padding: 10px;
}
</style>
