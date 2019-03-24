<template>
	<section>
		<!--工具条-->
		<el-col :span="24" class="toolbar" style="padding-bottom: 0px;">
			<el-form :inline="true" :model="filters">
				<el-form-item>
					<el-button type="primary" @click="handleAdd">新增</el-button>
				</el-form-item>
			</el-form>
		</el-col>

		<!--列表-->
		<el-table :data="users" highlight-current-row v-loading="listLoading" @selection-change="selsChange" style="width: 100%;">
			<el-table-column type="" width="10">
			</el-table-column>
			<el-table-column type="index" min-width="40">
			</el-table-column>
			<el-table-column prop="newName" label="店铺名称" min-width="120">
			</el-table-column>
			<el-table-column prop="vid" label="店铺编号" min-width="120">
			</el-table-column>
			<el-table-column prop="time" label="开店日期" min-width="180">
        <template slot-scope="scope">
          <span>{{new Date(parseInt(scope.row.time)).toLocaleString().replace(/:\d{1,2}$/,' ')}}</span>
        </template>
			</el-table-column>
			<el-table-column prop="owname" label="店铺店长" min-width="120">
			</el-table-column>
			<el-table-column prop="dec" label="店铺简介" min-width="180">
			</el-table-column>
			<el-table-column label="操作" min-width="200">
				<template slot-scope="scope">
					<el-button size="small" @click="handleEdit(scope.$index, scope.row)">编辑</el-button>
					<el-button type="danger" size="small" @click="handleDel(scope.$index, scope.row)">删除</el-button>
				</template>
			</el-table-column>
		</el-table>

		<!--工具条-->
		<el-col :span="24" class="toolbar">
			<el-pagination layout="prev, pager, next" @current-change="handleCurrentChange" :page-size="12" :total="total" style="float:right;">
			</el-pagination>
		</el-col>

		<!--编辑界面-->
		<el-dialog title="编辑" v-model="editFormVisible" :close-on-click-modal="false">
			<el-form :model="editForm" label-width="80px" :rules="editFormRules" ref="editForm">
				<el-form-item label="店铺名称" prop="newName">
					<el-input v-model="editForm.newName" auto-complete="off"></el-input>
				</el-form-item>
				<el-form-item label="店铺简介" prop="dec">
					<el-input type="textarea" v-model="editForm.dec" auto-complete="off"></el-input>
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
				<el-form-item label="店铺名称" prop="storeName">
					<el-input v-model="addForm.storeName" auto-complete="off"></el-input>
				</el-form-item>
				<el-form-item label="店铺简介" prop="intro">
					<el-input type="textarea" v-model="addForm.intro" auto-complete="off"></el-input>
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
import {
  httpGet,
  httpPost
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
        newName: [{ required: true, message: "请输入姓名", trigger: "blur" }]
      },
      //编辑界面数据
      editForm: {
        vid: 0,
        newName: "",
        time: "",
        dec: ""
      },

      addFormVisible: false, //新增界面是否显示
      addLoading: false,
      addFormRules: {
        storeName: [{ required: true, message: "请输入姓名", trigger: "blur" }]
      },
      //新增界面数据
      addForm: {
        storeName: "",
        intro: ""
      }
    };
  },
  methods: {
    handleCurrentChange(val) {
      this.page = val;
      this.getUsers(this.page);
    },
    //获取用户列表
    getUsers(page) {
      let param = {
        pno: page // 当前页码 不传的话默认1
      };
      httpGet("/store/getstorelist", param)
        .then(res => {
          this.listLoading = false;
          if (res.code == 200) {
            console.log("shop get", res);
            this.total = res.data.storeCount;
            // console.log('total',this.total)
            this.users = [];
            for (let i = 0; i < res.data.items.length; i++) {
              this.users.push({
                vid: res.data.items[i]._id,
                newName: res.data.items[i].name,
                time: res.data.items[i].rgt,
                dec: res.data.items[i].intro,
                owname: res.data.items[i].owname
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
    //删除
    handleDel: function(index, row) {
      this.$confirm("确认删除该记录吗?", "提示", {
        type: "warning"
      })
        .then((res) => {
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
        .catch((err) => {
          console.log(err)
          this.listLoading = false;
        });
    },
    //显示编辑界面
    handleEdit: function(index, row) {
      this.editFormVisible = true;
      this.editForm = Object.assign({}, row);
    },
    //显示新增界面
    handleAdd: function() {
      this.addFormVisible = true;
    },
    //编辑
    editSubmit: function() {
      this.$refs.editForm.validate(valid => {
        if (valid) {
          this.$confirm("确认提交吗？", "提示", {}).then(() => {
            this.editLoading = true;
            editUser(para).then(res => {
              this.editLoading = false;              
              this.$message({
                message: res.msg,
                type: "success"
              });
              this.$refs["editForm"].resetFields();
              this.editFormVisible = false;
              this.getUsers();
            });
          })
          .catch(err=>{
            console.log(err)
            this.editLoading = false;     
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
            // console.log(this.addForm)
            httpPost("/store/addstore", this.addForm)
              .then(res => {
                console.log('addShop',res)
                this.addFormVisible = false;
                this.addLoading = false;
                if (res.code == 200) {
                  console.log(33, res);
                  this.$message({
                    message: res.msg,
                    type: "success"
                  });
                  this.$refs["addForm"].resetFields();
                  this.getUsers(this.page);
                } else {
                  this.$message({
                    message: res.msg,
                    type: "warning"
                  });
                }
              })
              .catch(err => {
                this.addLoading = false;
                this.addFormVisible = false;
                console.log(err);
              });
          });
        }
      });
    },
    selsChange: function(sels) {
      this.sels = sels;
    }
  },
  created() {
    this.getUsers(this.page);
  }
};
</script>

<style scoped>
</style>