<template>
	<section>

		<!--列表-->
		<el-table :data="users" highlight-current-row v-loading="listLoading" @selection-change="selsChange" style="width: 100%;">
			<el-table-column class="status" type="selection" width="55">
			</el-table-column>
			<el-table-column class="status" type="index" width="60">
        <template slot-scope="scope">
          <span v-if="true" :class="[scope.$index<3?'read':'']">{{ scope.$index }}</span>
          <!-- <span v-else style="color: #6b6d6e">{{ scope.row.index }}</span> -->
        </template>
			</el-table-column>
			<el-table-column class="status" prop="name" label="标题" width="180" sortable>
        <template slot-scope="scope">
          <span v-if="true" :class="[scope.$index<3?'read':'']">{{ scope.row.name }}</span>
          <!-- <span v-else style="color: #6b6d6e">{{ scope.row.name }}</span> -->
        </template>
			</el-table-column>
			<el-table-column class="status" prop="read" label="状态" width="100" sortable>
        <template slot-scope="scope">
          <span v-if="true" :class="[scope.$index<3?'read':'']">{{ scope.row.read }}</span>
          <!-- <span v-else style="color: #6b6d6e">{{ scope.row.read }}</span> -->
        </template>
			</el-table-column>
			<el-table-column class="status" prop="dec" label="具体内容" min-width="200" sortable>
        <template slot-scope="scope">
          <span v-if="true" :class="[scope.$index<3?'read':'']">{{ scope.row.dec }}</span>
          <!-- <span v-else style="color: #6b6d6e">{{ scope.row.dec }}</span> -->
        </template>
			</el-table-column>
			<el-table-column label="操作" width="150">
				<template slot-scope="scope">
					<el-button size="small" @click="handleEdit(scope.$index, scope.row)">查看</el-button>
					<el-button type="danger" size="small" @click="handleDel(scope.$index, scope.row)">删除</el-button>
				</template>
			</el-table-column>
		</el-table>

		<el-dialog title="通知" v-model="editFormVisible" :close-on-click-modal="false">
			<el-form :model="editForm" label-width="80px" :rules="editFormRules" ref="editForm">
				<el-form-item label="标题" prop="name">
				</el-form-item>
				<el-form-item label="具体内容">
					具体内容……
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
        id: 0,
        name: "",
        price: 0,
        time: "",
        dec: ""
      },

      addFormVisible: false, //新增界面是否显示
      addLoading: false,
      addFormRules: {
        name: [{ required: true, message: "请输入姓名", trigger: "blur" }]
      },
      //新增界面数据
      addForm: {
        name: "",
        price: 0,
        time: "",
        dec: "",
        isRead: true
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
      this.getUsers();
    },
    //获取用户列表
    getUsers() {
      //   let para = {
      //     page: this.page,
      //     name: this.filters.name
      //   };
      //   this.listLoading = true;
      //   
      //   getUserListPage(para).then(res => {
      //     this.total = res.data.total;
      //     this.users = res.data.users;
      //     this.listLoading = false;
      //     
      //   });
      this.total = 1; //delete
      this.listLoading = false;
      this.users = []; //delete

      for (let i = 0; i < 86; i++) {
        //delete
        this.users.push(
          Mock.mock({
            id: Mock.Random.guid(),
            read: '已读',
            name: Mock.Random.cname(),
            dec: Mock.mock("@county(true)"),
            "age|18-60": 1,
            time: Mock.Random.date(),
            sex: Mock.Random.integer(0, 1)
          })
        );
      }

      //   let param = {
      //     title: "长袖", // unique
      //     price: 20, // default 10
      //     type: 0 // default 0  0代表织物类 基本只有这个
      //   };

      //   httpGet("/cloth/addcommodit",param)
      //   .then(res => {
      // 	  console.log('cloth/addcommodit',res)
      //   })
      //   .catch( ()=>{
      // 	  this.listLoading = false;
      //   });
    },
    //删除
    handleDel: function(index, row) {
      this.$confirm("确认删除该记录吗?", "提示", {
        type: "warning"
      })
        .then(() => {
          this.listLoading = true;
          
          let para = { id: row.id };
          removeUser(para).then(res => {
            this.listLoading = false;
            
            this.$message({
              message: "删除成功",
              type: "success"
            });
            this.getUsers();
          });
        })
        .catch(() => {});
    },
    //显示编辑界面
    handleEdit: function(index, row) {
      this.editFormVisible = true;
      this.editForm = Object.assign({}, row);
    },
    //显示新增界面
    handleAdd: function() {
      this.addFormVisible = true;
      this.addForm = {
        name: "",
        sex: -1,
        age: 0,
        time: "",
        dec: ""
      };
    },
    //编辑
    editSubmit: function() {
      this.$refs.editForm.validate(valid => {
        if (valid) {
          this.$confirm("确认提交吗？", "提示", {}).then(() => {
            this.editLoading = true;
            
            let para = Object.assign({}, this.editForm);
            para.time =
              !para.time || para.time == ""
                ? ""
                : util.formatDate.format(new Date(para.time), "yyyy-MM-dd");
            editUser(para).then(res => {
              this.editLoading = false;
              
              this.$message({
                message: "提交成功",
                type: "success"
              });
              this.$refs["editForm"].resetFields();
              this.editFormVisible = false;
              this.getUsers();
            });
          });
        }
      });
    },
    //新增
    addSubmit: function() {
      this.$refs.addForm.validate(valid => {
        if (valid) {
          this.$confirm("确认提交吗？", "提示", {}).then(() => {
            this.addLoading = true;
            
            // let para = Object.assign({}, this.addForm);
            // para.time =
            //   !para.time || para.time == ""
            //     ? ""
            //     : util.formatDate.format(new Date(para.time), "yyyy-MM-dd");
            // addUser(para).then(res => {
            //   this.addLoading = false;
            //   
            //   this.$message({
            //     message: "提交成功",
            //     type: "success"
            //   });
            //   this.$refs["addForm"].resetFields();
            //   this.addFormVisible = false;
            //   this.getUsers();
            // });
            let param = {
              title: "长袖", // unique
              price: 20, // default 10
              type: 0 // default 0  0代表织物类 基本只有这个
            };
			httpGet("/cloth/addcommodit",param)
			.then((res)=>{
				this.addLoading = false;
				console.log(33,res)
			})
			.catch((err)=>{
				this.addLoading = false;
				console.log(err)
			});
          });
        }
      });
    },
    selsChange: function(sels) {
      this.sels = sels;
    },
    //批量删除
    batchRemove: function() {
      var ids = this.sels.map(item => item.id).toString();
      this.$confirm("确认删除选中记录吗？", "提示", {
        type: "warning"
      })
        .then(() => {
          this.listLoading = true;
          
          let para = { ids: ids };
          batchRemoveUser(para).then(res => {
            this.listLoading = false;
            
            this.$message({
              message: "删除成功",
              type: "success"
            });
            this.getUsers();
          });
        })
        .catch(() => {});
    }
  },
  mounted() {
    this.getUsers();
  }
};
</script>

<style>
.el-table .cell span.read{
  color: #888686;
}
</style>