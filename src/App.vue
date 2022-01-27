<template>
  <div id="app">
    <v-crud ref="crud" border @load="onLoad">
      <v-dialog :visible.sync="visible" width="500px"> dialog </v-dialog>
      <v-table v-bind="table">
        <template #header>
          <div>
            <div>{{ form }}</div>
            <v-form ref="form" v-model="form" :options="formOptions" />
            <el-button @click="openForm">打开表单</el-button>
            hello word
            <v-add-btn />
            <v-refresh-btn />
            <el-button @click="visible = true" v-contextmenu="contextMenu"
              >dialog</el-button
            >
            <v-filter-group v-model="search">
              <v-filter label="关键字">
                <el-input v-model="search.keyword" />
              </v-filter>
            </v-filter-group>
          </div>
        </template>
        <template #footer>
          <div>footer</div>
        </template>
      </v-table>
    </v-crud>
  </div>
</template>

<script lang="jsx">
export default {
  name: "App",
  data() {
    return {
      visible: false,
      off: false,
      search: {
        keyword: "",
      },
      form: {
        name: "",
      },
      formOptions: {
        items: [
          {
            label: "昵称",
            prop: "name",
            value: "name",
            component: {
              name: "el-input",
              attrs: {
                placeholder: "请填写昵称",
              },
            },
            rules: {
              required: true,
              message: "昵称不能为空",
            },
          },
          {
            label: "性别",
            prop: "sex",
            value: "男",
            component: {
              name: "el-select",
              attrs: {
                placeholder: "请选择性别",
                style: "width:100%",
              },
              options: ["男", "女", "未知"],
            },
            rules: {
              required: true,
              message: "性别不能为空",
            },
          },
          {
            label: "radio",
            prop: "radio",
            value: "A",
            component: {
              name: "el-radio-group",
              options: ["A", "B", "C"],
            },
          },
          {
            label: "checkbox",
            prop: "checkbox",
            value: ["A"],
            component: {
              name: "el-checkbox-group",
              options: ["A", "B", "C"],
            },
          },
        ],
        on: {
          submit: (data, { close, done }) => {
            this.$message.closeAll();
            this.$message.success("保存成功");
            console.log(data);
            setTimeout(() => {
              this.form = { ...data };
              close();
            }, 300);
          },
        },
      },
      table: {
        ref: "table",
        props: {
          border: true,
          rowKey: "id",
        },
        pagination: {
          position: "bottom",
        },
        on: {},
        align: "left",
        contextMenu: ["refresh", "update", "delete", "order-asc", "order-desc"],
        data: [{ id: 1, a: [{ b: { c: 3 } }] }, { id: 2 }],
        columns: [
          { type: "selection" },
          { label: "序号", type: "index", minWidth: 120 },
          {
            label: "column 1",
            prop: "column1",
            minWidth: 100,
            children: [
              {
                label: "ID",
                prop: "id",
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
                  {
                    label: "column 2-1-1",
                    prop: "column2-1-1",
                    minWidth: 100,
                    emptyText: "-",
                  },
                  {
                    label: "column 2-1-2",
                    prop: "column2-1-2",
                    minWidth: 100,
                    render: (h, { row }) => JSON.stringify(row),
                  },
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
  mounted() {},
  methods: {
    openForm() {
      let form = this.$refs.form.open(this.formOptions);
    },
    openContextMenu(event) {
      this.$crud.openContextMenu(event, {
        list: this.contextMenu,
      });
    },
    onLoad(ctx) {
      let service = {
        page: (query) => {
          return new Promise((reslove) => {
            console.log(query);
            setTimeout(() => {
              reslove({
                list: [{ id: Date.now(), ...query }],
                pagination: { total: 100, ...query },
              });
            }, 300);
          });
        },
      };
      ctx.service(service).done().refresh(this.search);
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
