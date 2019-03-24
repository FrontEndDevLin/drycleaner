<template>
	<section>

		<!--列表-->
		<el-table :data="users" highlight-current-row v-loading="listLoading" @selection-change="selsChange" style="width: 100%;">
			<el-table-column class="status" type="nid" width="55">
			</el-table-column>
			<el-table-column class="status" type="index" width="60">
        <template slot-scope="scope">
          <span v-if="true" :class="[scope.row.readed==1?'read':'']">{{ scope.$index }}</span>
        </template>
			</el-table-column>
			<el-table-column class="status" prop="title" label="标题" width="120" 
      >
        <template slot-scope="scope">
          <span class="notice_content" v-if="true" :class="[scope.row.readed==1?'read':'']">{{ scope.row.title }}</span>
        </template>
			</el-table-column>
			<el-table-column class="status" prop="content" label="具体内容" width="120" 
      >
        <template slot-scope="scope">
          <span class="notice_content" v-if="true" :class="[scope.row.readed==1?'read':'']">{{ scope.row.content }}</span>
        </template>
			</el-table-column>
			<el-table-column class="status" prop="sender" label="发布人" width="120" 
      >
        <template slot-scope="scope">
          <span v-if="true" :class="[scope.row.readed==1?'read':'']">{{ scope.row.sender }}</span>
        </template>
			</el-table-column>
			<el-table-column class="status" prop="stime" label="通知时间" min-width="120" 
      >
        <template slot-scope="scope">
          <span v-if="true" :class="[scope.row.readed==1?'read':'']">{{new Date(parseInt(scope.row.stime)).toLocaleString().replace(/:\d{1,2}$/,' ') }}</span>
        </template>
			</el-table-column>
			<el-table-column class="status" prop="type" label="通知类型" min-width="120" 
      >
        <template slot-scope="scope">
          <span v-if="true" :class="[scope.row.readed==1?'read':'']">{{ scope.row.type }}</span>
        </template>
			</el-table-column>
			<el-table-column class="status" prop="readed" label="状态" min-width="120" 
      >
        <template slot-scope="scope">
          <span v-if="true" :class="[scope.row.readed==1?'read':'']">{{ scope.row.readed==1?'已读':'未读' }}</span>
        </template>
			</el-table-column>
			<el-table-column label="操作" width="150">
				<template slot-scope="scope">
					<el-button size="small" @click="handleEdit(scope.$index, scope.row)">查看</el-button>
					<!-- <el-button type="danger" size="small" @click="handleDel(scope.$index, scope.row)">删除</el-button> -->
				</template>
			</el-table-column>
		</el-table>

		<el-dialog title="通知" v-model="editFormVisible" :close-on-click-modal="false">
			<el-form :model="editForm" label-width="80px" :rules="editFormRules" ref="editForm">
				<el-form-item label="" prop="title">
          <span>标题：<b>{{editForm.title}}</b></span>
				</el-form-item>
				<el-form-item label="" prop="content">
					<span>内容：{{editForm.content}}</span>
				</el-form-item>
			</el-form>
		</el-dialog>

	</section>
</template>

<script>
import util from "../../common/js/util";
import Mock from "mockjs"; //delete
import {
  getUserListPage,
  removeUser,
  batchRemoveUser,
  editUser,
  addUser,
  httpGet
} from "../../api/api";

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
      sels: [], //列表选中列

      editFormVisible: false, //编辑界面是否显示
      editLoading: false,
      editFormRules: {
        name: [{ required: true, message: "请输入姓名", trigger: "blur" }]
      },
      //编辑界面数据
      editForm: {
        nid: 0,
        title:'',
        content:''
      }
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
      let param = {
        pno: page // 当前页码 不传的话默认1
      };
      httpGet("/inform/getnoticeList", param)
        .then(res => {
          this.listLoading = false;
          if (res.code == 200) {
            console.log("users get", res);
            this.total = res.data.informCount;
            this.users = [];
            for (let i = 0; i < res.data.items.length; i++) {
              this.users.push({
                nid: res.data.items[i]._id,
                sender: res.data.items[i].sender,
                readed: res.data.items[i].readed,
                title: res.data.items[i].title,
                content: res.data.items[i].content,
                stime: res.data.items[i].stime,
                type: res.data.items[i].type
              });
            }
          } else {
            this.$message({
              message: res.msg,
              type: "warning"
            });
          }
        })
        .catch(() => {
          this.listLoading = false;
          console.log(err);
        });
    },
    //显示编辑界面
    handleEdit: function(index, row) {
      this.editFormVisible = true;
      this.editForm = Object.assign({}, row);
      console.log(12,this.editForm)
      httpGet("/inform/readnotice", this.editForm)
        .then(res => {
          console.log(res)
          this.listLoading = false;
          if (res.code == 200) {
            this.getUsers(this.page)
          } else {
            this.$message({
              message: res.msg,
              type: "warning"
            });
          }
        })
        .catch(() => {
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

<style>
.notice_content{
  display: inline-block;
  text-overflow: ellipsis;
  overflow: hidden;
  white-space: nowrap;
}
.el-table .cell span.read{
  color: #afadad;
}
</style>