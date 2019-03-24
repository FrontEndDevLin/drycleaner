<template>
	<section>
		<!--工具条-->
		<el-col :span="24" class="toolbar" style="padding-bottom: 0px;">
			<el-form :inline="true" :model="filters">
				<el-form-item>
					<el-input v-model="filters.name" placeholder="姓名"></el-input>
				</el-form-item>
				<el-form-item>
					<el-button type="primary" v-on:click="getUsers">查询</el-button>
				</el-form-item>
				<el-form-item>
					<el-button type="primary" @click="handleAdd">新增</el-button>
				</el-form-item>
			</el-form>
		</el-col>

		<!--列表-->
		<el-table :data="users" highlight-current-row v-loading="listLoading" @selection-change="selsChange" style="width: 100%;">
			<el-table-column type="selection" width="55">
			</el-table-column>
			<el-table-column type="index" width="60">
			</el-table-column>
			<el-table-column prop="name" label="衣物名称" width="120" sortable>
			</el-table-column>
			<el-table-column prop="price" label="价格" width="100" sortable>
			</el-table-column>
			<el-table-column prop="time" label="有效时间" width="120" sortable>
			</el-table-column>
			<el-table-column prop="dec" label="备注" min-width="180" sortable>
			</el-table-column>
			<el-table-column label="操作" width="150">
				<template slot-scope="scope">
					<el-button size="small" @click="handleEdit(scope.$index, scope.row)">恢复</el-button>
					<el-button type="danger" size="small" @click="handleDel(scope.$index, scope.row)">删除</el-button>
				</template>
			</el-table-column>
		</el-table>

		<!--工具条-->
		<el-col :span="24" class="toolbar">
			<el-button type="danger" @click="batchRemove" :disabled="this.sels.length===0">批量删除</el-button>
			<el-pagination layout="prev, pager, next" @current-change="handleCurrentChange" :page-size="20" :total="total" style="float:right;">
			</el-pagination>
		</el-col>

		<!--编辑界面-->
		<el-dialog title="编辑" v-model="editFormVisible" :close-on-click-modal="false">
			<el-form :model="editForm" label-width="80px" :rules="editFormRules" ref="editForm">
				<el-form-item label="衣物名称" prop="name">
					<el-input v-model="editForm.name" auto-complete="off"></el-input>
				</el-form-item>
				<el-form-item label="价格">
					<el-input-number v-model="editForm.price" :min="0" :max="200"></el-input-number>
				</el-form-item>
				<el-form-item label="有效时间">
					<el-date-picker type="date" placeholder="选择日期" v-model="editForm.time"></el-date-picker>
				</el-form-item>
				<el-form-item label="备注">
					<el-input type="textarea" v-model="editForm.dec"></el-input>
				</el-form-item>
			</el-form>
			<div slot="footer" class="dialog-footer">
				<el-button @click.native="editFormVisible = false">取消</el-button>
				<el-button type="primary" @click.native="editSubmit" :loading="editLoading">提交</el-button>
			</div>
		</el-dialog>

		<!--新增界面-->
		<el-dialog title="新增" v-model="addFormVisible" :close-on-click-modal="false">
			<el-form :model="addForm" label-width="80px" :rules="addFormRules" ref="addForm">
				<el-form-item label="衣物名称" prop="name">
					<el-input v-model="addForm.name" auto-complete="off"></el-input>
				</el-form-item>
				<el-form-item label="价格">
					<el-input-number v-model="editForm.price" :min="0" :max="200"></el-input-number>
				</el-form-item>
				<el-form-item label="有效时间">
					<el-date-picker type="date" placeholder="选择日期" v-model="addForm.time"></el-date-picker>
				</el-form-item>
				<el-form-item label="备注">
					<el-input type="textarea" v-model="addForm.dec"></el-input>
				</el-form-item>
			</el-form>
			<div slot="footer" class="dialog-footer">
				<el-button @click.native="addFormVisible = false">取消</el-button>
				<el-button type="primary" @click.native="addSubmit" :loading="addLoading">提交</el-button>
			</div>
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
        dec: ""
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
            price: Mock.Random.guid(),
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

<style scoped>
</style>