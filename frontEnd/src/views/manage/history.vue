<template>
	<section>

		<!--列表-->
		<el-table :data="users" highlight-current-row v-loading="listLoading" @selection-change="selsChange" style="width: 100%;">
			<el-table-column type="index" width="60">
			</el-table-column>
			<el-table-column prop="vipName" label="客户名称" min-width="80">
			</el-table-column>
			<el-table-column prop="title" label="衣物名称" min-width="120">
			</el-table-column>
			<el-table-column prop="color" label="颜色" width="120">
			</el-table-column>
			<el-table-column prop="time" label="完成时间" min-width="100">
        <template slot-scope="scope">
          <span>{{new Date(parseInt(scope.row.time)).toLocaleString().replace(/:\d{1,2}$/,' ')}}</span>
        </template>
			</el-table-column>
			<el-table-column prop="mark" label="备注" width="100">
			</el-table-column>
		</el-table>

		<!--工具条-->
		<el-col :span="24" class="toolbar">
			<el-pagination layout="prev, pager, next" @current-change="handleCurrentChange" :page-size="12" :total="total" style="float:right;">
			</el-pagination>
		</el-col>

		
	</section>
</template>

<script>
import { httpGet, httpPost } from "../../api/api";

export default {
  data() {
    return {
      filters: {
        name: ""
      },
      users: [],
      total: 0,
      page: 1,
      listLoading: false,
      sels: [] //列表选中列
    };
  },
  methods: {
    //性别显示转换
    formatSex: function(row, column) {
      return row.sex == 1 ? "男" : row.sex == 0 ? "女" : "未知";
    },
    handleCurrentChange(val) {
      this.page = val;
      this.getUsers(this.page);
    },
    //获取用户列表
    getUsers(page) {
      console.log("get list");
      let param = {
        pno: page // 当前页码 不传的话默认1
      };
      httpGet("/cloth/gethistorylist", param)
        .then(res => {
          console.log("history list", res);
          this.listLoading = false;
          if (res.code == 200) {
            this.total = res.data.clothCount;
            this.users = [];
            for (let i = 0; i < res.data.items.length; i++) {
              this.users.push({
                color: res.data.items[i].color,
                mark: res.data.items[i].mark,
                title: res.data.items[i].title,
                vipName: res.data.items[i].vipName,
                time: res.data.items[i].time
              });
            }
            console.log(this.users);
          } else {
            this.$message({
              message: res.msg,
              type: "warning"
            });
          }
        })
        .catch(err => {
          this.listLoading = false;
          console.log(err);
        });
    },
    selsChange: function(sels) {
      this.sels = sels;
    }
  },
  mounted() {
    this.getUsers(this.page);
  }
};
</script>

<style scoped>
.owner-avatar {
  width: 20px;
  height: auto;
}
</style>