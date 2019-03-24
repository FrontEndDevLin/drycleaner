<template>
	<section>
		<!--工具条-->
		<el-col :span="24" class="toolbar" style="padding-bottom: 0px;">
			<el-form :inline="true" :model="filters">
				<!-- <el-form-item>
					<el-input v-model="filters.name" placeholder="姓名"></el-input>
				</el-form-item> -->
				<!-- <el-form-item>
					<el-button type="primary" v-on:click="getUsers">查询</el-button>
				</el-form-item> -->
				<el-form-item>
					<el-button type="primary" @click="addFormVisible = true">新增</el-button>
				</el-form-item>
        <el-form-item>
          <span class="count" @click="sortByCount">
            积分排序
            <i :class="['fa',!countDown?'fa-sort-desc':'fa-sort-asc']"></i>
          </span>
        </el-form-item>
        <el-form-item>
          <span class="date" @click="sortByDate">
            注册时间排序
            <i :class="['fa',!dateDown?'fa-sort-desc':'fa-sort-asc']"></i>
          </span>
        </el-form-item>
			</el-form>
		</el-col>

		<!--列表-->
		<el-table :data="users" highlight-current-row v-loading="listLoading" @selection-change="selsChange" style="width: 100%;">
			<el-table-column type="vid" width="10">
			</el-table-column>
			<el-table-column type="index" min-width="80">
			</el-table-column>
			<el-table-column prop="newName" label="会员名称" min-width="120">
			</el-table-column>
			<el-table-column prop="newPhone" label="电话" min-width="140">
			</el-table-column>
			<el-table-column prop="count" label="积分" min-width="100">
			</el-table-column>
			<el-table-column prop="newGender" label="性别" min-width="100">
        <template slot-scope="scope">
					<span>{{scope.row.newGender==2?'女':scope.row.newGender==1?'男':'未知'}}</span>
				</template>
			</el-table-column>
			<el-table-column prop="time" label="注册时间" min-width="140">
        <template slot-scope="scope">
          <span>{{new Date(parseInt(scope.row.time)).toLocaleString().replace(/:\d{1,2}$/,' ')}}</span>
        </template>
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
			<el-pagination layout="total,prev, pager, next" @current-change="handleCurrentChange" :page-size="12" :total="total" style="float:right;">
			</el-pagination>
		</el-col>

		<!--编辑界面-->
		<el-dialog title="编辑" v-model="editFormVisible" :close-on-click-modal="false">
			<el-form :model="editForm" label-width="80px" :rules="editFormRules" ref="editForm">
				<el-form-item label="会员名称" prop="name">
					<el-input v-model="editForm.newName" auto-complete="off"></el-input>
				</el-form-item>
				<el-form-item label="电话" prop="phone">
					<el-input v-model="editForm.newPhone"></el-input>
				</el-form-item>
				<el-form-item label="性别">
					<el-radio-group v-model="editForm.newGender">
						<el-radio class="radio" :label="1">男</el-radio>
						<el-radio class="radio" :label="2">女</el-radio>
					</el-radio-group>
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
				<el-form-item label="会员名称" prop="name">
					<el-input v-model="addForm.name" auto-complete="off"></el-input>
				</el-form-item>
				<el-form-item label="电话" prop="phone">
					<el-input v-model="addForm.phone" auto-complete="off"></el-input>
				</el-form-item>
				<!-- <el-form-item label="性别">
					<el-radio-group v-model="addForm.sex">
						<el-radio class="radio" :label="1">男</el-radio>
						<el-radio class="radio" :label="2">女</el-radio>
					</el-radio-group>
				</el-form-item> -->
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
  httpPost,
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
      listLoading: false,
      sels: [], //列表选中列

      editFormVisible: false, //编辑界面是否显示
      editLoading: false,
      editFormRules: {
        newName: [{ required: true, message: "请输入姓名", trigger: "blur" }],
        newPhone: [
          {
            required: true,
            pattern: /^1\d{10}$/,
            message: "手机号格式不正确",
            trigger: "blur"
          }
        ]
      },
      //编辑界面数据
      editForm: {
        vid: 0,
        newName: "",
        newPhone: 0,
        newGender: 0
      },

      addFormVisible: false, //新增界面是否显示
      addLoading: false,
      addFormRules: {
        name: [{ required: true, message: "请输入姓名", trigger: "blur" }],
        phone: [
          {
            required: true,
            pattern: /^1\d{10}$/,
            message: "手机号格式不正确",
            trigger: "blur"
          }
        ]
      },
      //新增界面数据
      addForm: {
        name: "",
        phone: "",
        sex: 1,
        time: ""
      },
      page: 1,
      countDown: false,
      dateDown: false,
      currentFiled: "rgt",
      currentSort: -1
    };
  },
  methods: {
    handleCurrentChange(val) {
      this.page = val;
      this.getUsers(this.page, this.currentFiled, this.currentSort);
    },
    //获取用户列表
    getUsers(page, field, sort) {
      let param = {
        pno: page, // 当前页码 不传的话默认1
        field: field, // 排序字段 有 'rgt'和'count'(注册时间，积分) 两种选择 不传默认为'rgt'
        sort: sort // 排序方式 1或-1 默认为-1(降序)
      };
      httpGet("/vip/getviplist", param)
        .then(res => {
          this.listLoading = false;
          if (res.code == 200) {
            console.log("res get", res);
            this.total = res.data.vipCount;
            this.users = [];
            for (let i = 0; i < res.data.items.length; i++) {
              this.users.push({
                vid: res.data.items[i]._id,
                newPhone: res.data.items[i].phone,
                newName: res.data.items[i].name,
                email: res.data.items[i].email,
                time: res.data.items[i].rgt,
                newGender: res.data.items[i].gender,
                count: res.data.items[i].count
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
    handleDel(index, row) {
      this.$confirm("确认删除该记录吗?", "提示", {
        type: "warning"
      })
        .then((res) => {
          this.listLoading = true;
          let para = { vid: row.vid };
          // console.log(para)
          httpPost("/vip/delvip", para).then(res => {
            console.log(res);
            this.listLoading = false;
            if (res.code == 200) {
              this.$message({
                message: res.msg,
                type: "success"
              });
              this.getUsers(this.page, this.currentFiled, this.currentSort);
            } else {
              this.$message({
                message: res.msg,
                type: "warning"
              });
            }
          });
        })
        .catch((err) => {
          console.log(err)
          this.listLoading = false;
        });
    },
    //显示编辑界面
    handleEdit(index, row) {
      this.editFormVisible = true;
      this.editForm = Object.assign({}, row);
      // console.log(this.editForm)
    },
    //编辑
    editSubmit() {
      this.$refs.editForm.validate(valid => {
        if (valid) {
          this.$confirm("确认提交吗？", "提示", {}).then(() => {
            this.editLoading = true;
            let para = Object.assign({}, this.editForm);
            console.log(para);
            httpPost("/vip/editvip", para).then(res => {
              console.log("edit", res);
              this.editLoading = false;
              this.editFormVisible = false;
              if (res.code == 200) {
                this.$message({
                  message: res.msg,
                  type: "success"
                });
                this.$refs["editForm"].resetFields();
                this.getUsers(this.page, this.currentFiled, this.currentSort);
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
    addSubmit() {
      this.$refs.addForm.validate(valid => {
        if (valid) {
          console.log("addForm", this.addForm);
          this.$confirm("确认提交吗？", "提示", {}).then(() => {
            this.addLoading = true;
            httpPost("/vip/addvip", this.addForm)
              .then(res => {
                this.addFormVisible = false;
                this.addLoading = false;
                if (res.code == 200) {
                  console.log(33, res);
                  this.$message({
                    message: "提交成功",
                    type: "success"
                  });
                  this.$refs["addForm"].resetFields();
                  this.getUsers(this.page, this.currentFiled, this.currentSort);
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
    selsChange(sels) {
      this.sels = sels;
    },
    sortByDate() {
      // let param = {
      //   pno: page, // 当前页码 不传的话默认1
      //   field: field, // 排序字段 有 'rgt'和'count'(注册时间，积分) 两种选择 不传默认为'rgt'
      //   sort: sort // 排序方式 1或-1 默认为-1(降序)
      // };
      this.dateDown = !this.dateDown;
      // console.log(this.dateDown)
      this.currentFiled = "rgt";
      if (!this.dateDown) {
        // down
        this.currentSort = -1;
        this.getUsers(this.page, "rgt", -1);
      } else {
        this.currentSort = 1;
        this.getUsers(this.page, "rgt", 1);
      }
    },
    sortByCount() {
      this.countDown = !this.countDown;
      console.log(this.countDown);
      this.currentFiled = "count";
      if (!this.countDown) {
        // down
        this.currentSort = -1;
        this.getUsers(this.page, "count", -1);
      } else {
        this.currentSort = 1;
        this.getUsers(this.page, "count", 1);
      }
    }
  },
  created() {
    this.getUsers(this.page, "rgt", -1);
  }
};
</script>

<style scoped>
.count {
  cursor: pointer;
}
.date {
  cursor: pointer;
}
</style>