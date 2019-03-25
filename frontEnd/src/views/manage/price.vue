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
			<el-table-column type="cid" min-width="10">
			</el-table-column>
			<el-table-column type="index" min-width="180">
			</el-table-column>
			<el-table-column prop="newTitle" label="衣物名称" min-width="120">
			</el-table-column>
			<el-table-column prop="newPrice" label="价格" min-width="100">
			</el-table-column>
			<el-table-column label="操作" min-width="150">
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
				<el-form-item label="衣物名称" prop="newTitle">
					<el-input v-model="editForm.newTitle" auto-complete="off"></el-input>
				</el-form-item>
				<el-form-item label="价格" prop="newPrice">
					<el-input-number v-model="editForm.newPrice" :min="10"></el-input-number>
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
				<el-form-item label="衣物名称" prop="newTitle">
					<el-input v-model="addForm.newTitle" auto-complete="off"></el-input>
				</el-form-item>
				<el-form-item label="价格" prop="newPrice">
					<el-input-number v-model="addForm.newPrice" :min="10"></el-input-number>
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
        newTitle: [{ required: true, message: "请输入姓名", trigger: "blur" }]
      },
      //编辑界面数据
      editForm: {
        cid: 0,
        newTitle: "",
        newPrice: 0
      },

      addFormVisible: false, //新增界面是否显示
      addLoading: false,
      addFormRules: {
        newTitle: [{ required: true, message: "请输入物品名称", trigger: "blur" }]
      },
      //新增界面数据
      addForm: {
        newTitle: "",
        newPrice: 10// default 10
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
      httpGet("/cloth/getpricelist", param)
        .then(res => {
          this.listLoading = false;
          if (res.code == 200) {
            console.log("price list", res);
            this.total = res.data.listCount;
            this.users = [];
            for (let i = 0; i < res.data.items.length; i++) {
              this.users.push({
                cid: res.data.items[i]._id,
                newPrice: res.data.items[i].price,
                newTitle: res.data.items[i].title
              });
            }
            console.log(this.users)
          } else {
            this.$message({
              message: res.msg,
              type: "warning"
            });
          }
        })
        .catch((err) => {
          this.listLoading = false;
          console.log(err);
        });
    },
    //删除
    handleDel: function(index, row) {
      this.$confirm("确认删除该记录吗?", "提示", {
        type: "warning"
      })
        .then(res => {
          this.listLoading = true;
          let para = { cid: row.cid };
          console.log(para)
          httpPost("/cloth/delcommodit", para).then(res => {
            console.log("del", res);
            this.listLoading = false;
            if (res.code == 200) {
              this.$message({
                message: res.msg,
                type: "success"
              });
              this.getUsers(this.page);
            } else {
              this.$message({
                message: res.msg,
                type: "warning"
              });
            }
          });
        })
        .catch(err => {
          this.listLoading = false;
          console.log(err);
        });
    },
    //显示编辑界面
    handleEdit: function(index, row) {
      this.editFormVisible = true;
      this.editForm = Object.assign({}, row);
    },
    //显示新增界面
    handleAdd: function() {
      this.addLoading = false;
      this.addFormVisible = true;
    },
    //编辑
    editSubmit() {
      this.$refs.editForm.validate(valid => {
        if (valid) {
          this.$confirm("确认提交吗？", "提示", {}).then(() => {
            this.editLoading = true;
            let para = Object.assign({}, this.editForm);
            console.log(para);
            httpPost("/cloth/editcommodit", para).then(res => {
              console.log("edit", res);
              this.editLoading = false;
              this.editFormVisible = false;
              if (res.code == 200) {
                this.$message({
                  message: res.msg,
                  type: "success"
                });
                this.$refs["editForm"].resetFields();
                this.getUsers(this.page);
              } else {
                this.$message({
                  message: res.msg,
                  type: "warning"
                });
              }
            })
            .catch(err=>{
              console.log(err)
              this.editLoading = false;
              this.editFormVisible = false;
            });
          });
        }
      });
    },
    //新增
    addSubmit: function() {
      console.log('price this.addForm',this.addForm)
      this.$refs.addForm.validate(valid => {
        if (valid) {
          this.$confirm("确认提交吗？", "提示", {}).then(() => {
            this.addLoading = true;
            httpGet("/cloth/addcommodit", this.addForm)
              .then(res => {
                console.log("price", res);
                this.addFormVisible = false;
                this.addLoading = false;
                if (res.code == 200) {
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
    },
  },
  mounted() {
    this.getUsers();
  }
};
</script>

<style scoped>
</style>