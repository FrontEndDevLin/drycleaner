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
			<el-table-column type="id" width="10">
			</el-table-column>
			<el-table-column type="index" width="60">
			</el-table-column>
			<el-table-column prop="newName" label="员工名称" width="120">
			</el-table-column>
			<el-table-column prop="avatar" label="头像" width="100">
        <template slot-scope="scope">
          <img class="owner-avatar" :src="scope.row.avatar" alt="">
        </template>
			</el-table-column>
			<el-table-column prop="newPhone" label="电话" min-width="120">
			</el-table-column>
			<el-table-column prop="gender" label="性别" min-width="80">
        <template slot-scope="scope">
					<span>{{scope.row.gender==2?'女':scope.row.gender==1?'男':'未知'}}</span>
				</template>
			</el-table-column>
			<el-table-column prop="salary" label="工资" min-width="120">
			</el-table-column>
			<el-table-column prop="storename" label="所属店铺" width="120">
			</el-table-column>
			<el-table-column prop="time" label="入职日期" min-width="120">
        <template slot-scope="scope">
          <span>{{new Date(parseInt(scope.row.time)).toLocaleString().replace(/:\d{1,2}$/,' ')}}</span>
        </template>
			</el-table-column>
			<el-table-column label="操作" width="180">
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
				<el-form-item label="员工名称" prop="name">
					<el-input v-model="editForm.newName" auto-complete="off"></el-input>
				</el-form-item>
				<el-form-item label="电话">
					<el-input v-model="editForm.newPhone"></el-input>
				</el-form-item>
				<el-form-item label="工资">
					<el-input v-model="editForm.salary"></el-input>
				</el-form-item>
				<el-form-item label="性别">
          <el-radio-group v-model="editForm.gender">
						<el-radio class="radio" :label="1">男</el-radio>
						<el-radio class="radio" :label="2">女</el-radio>
					</el-radio-group>
				</el-form-item>
				<el-form-item label="身份">
          <el-radio-group v-model="editForm.ident">
						<el-radio class="radio" :label="'manager'">店长</el-radio>
						<el-radio class="radio" :label="'staff'">普通员工</el-radio>
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
			<el-form :model="addForm" label-width="120px" :rules="addFormRules" ref="addForm">
				<el-form-item label="员工名称" prop="name">
					<el-input v-model="addForm.name" auto-complete="off"></el-input>
				</el-form-item>
				<el-form-item label="员工电话" prop="newPhone">
					<el-input v-model="addForm.phone" auto-complete="off"></el-input>
				</el-form-item>
				<el-form-item label="员工密码" prop="pwd">
					<el-input v-model="addForm.pwd" auto-complete="off"></el-input>
				</el-form-item>
				<el-form-item label="性别">
          <el-radio-group v-model="addForm.gender">
						<el-radio class="radio" :label="1">男</el-radio>
						<el-radio class="radio" :label="2">女</el-radio>
					</el-radio-group>
				</el-form-item>
				<el-form-item label="所属店铺编号" prop="storeId">
					<el-select v-model="addForm.storeId" placeholder="请选择">
            <el-option
              v-for="(item,index) in shop"
              :key="index"
              :label="item.name"
              :value="item.id">
            </el-option>
          </el-select>
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
        newName: [{ required: true, message: "请输入姓名", trigger: "blur" }],
        newnewPhone: [
          {
            required: true,
            pattern: /^1\d{10}$/,
            message: "手机号格式不正确",
            trigger: "blur"
          }
        ],
        gender: [{ required: true, message: "请选择性别", trigger: "blur" }],
        salary: [{ required: true, message: "请输入工资", trigger: "blur" }],
        ident: [{ required: true, message: "请选择身份", trigger: "blur" }]
      },
      //编辑界面数据
      editForm: {
        id: 0,
        newName: "",
        newnewPhone: 1,
        gender: "",
        salary: "",
        ident: "manager"
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
        ],
        pwd: [{ required: true, message: "请输入密码", trigger: "blur" }],
        storeId: [
          { required: true, message: "请输入可选店铺编号", trigger: "blur" }
        ]
      },
      //新增界面数据
      addForm: {
        name: "",
        phone: "",
        pwd: "",
        storeId: "",
        ident: "manager",
        gender: 1
      },
      canaddstaff: false,
      shop: []
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
      httpGet("/staff/getmanagerlist", param)
        .then(res => {
          this.listLoading = false;
          if (res.code == 200) {
            console.log("owner", res);
            this.total = res.data.managerCount;
            // console.log('total',this.total)
            this.users = [];
            for (let i = 0; i < res.data.items.length; i++) {
              this.users.push({
                id: res.data.items[i].id,
                newName: res.data.items[i].name,
                time: res.data.items[i].rgt,
                gender: res.data.items[i].gender,
                newPhone: res.data.items[i].phone,
                salary: res.data.items[i].salary,
                storename: res.data.items[i].storename,
                avatar: res.data.items[i].avatar,
                ident: "manager"
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
        .then(res => {
          this.listLoading = true;
          let para = { id: row.id };
          httpPost("/staff/delmanager", para).then(res => {
            console.log("del", res);
            this.listLoading = false;
            if (res.code == 200) {
              this.$message({
                message: res.msg,
                type: "success"
              });
              this.getUsers(ths.page);
            } else {
              this.$message({
                message: res.msg,
                type: "warning"
              });
            }
          });
        })
        .catch(err => {
          console.log(err);
          this.listLoading = false;
        });
    },
    //显示编辑界面
    handleEdit: function(index, row) {
      this.editFormVisible = true;
      this.editForm = Object.assign({}, row);
      console.log(this.editForm);
    },
    //显示新增界面
    handleAdd: function() {
      httpGet("/staff/canaddstaff", { ident: "manager" })
        .then(res => {
          // console.log(res)
          this.addLoading = false;
          if (res.code == 200) {
            this.addFormVisible = true;
            this.shop = [];
            for (let i = 0; i < res.data.length; i++) {
              this.shop.push({
                name: res.data[i].name,
                id: res.data[i]._id.toString()
              });
            }
          } else {
            this.$message({
              message: res.msg,
              type: "warning"
            });
          }
        })
        .catch(err => {
          this.addLoading = false;
          console.log(err);
        });
    },
    //编辑
    editSubmit() {
      this.$refs.editForm.validate(valid => {
        if (valid) {
          this.$confirm("确认提交吗？", "提示", {}).then(() => {
            this.editLoading = true;
            let para = Object.assign({}, this.editForm);
            console.log(para);
            httpPost("/staff/editmanager", para).then(res => {
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
      this.$refs.addForm.validate(valid => {
        if (valid) {
          this.$confirm("确认提交吗？", "提示", {}).then(() => {
            this.addLoading = true;
            // console.log('addForm staff',this.addForm)
            httpPost("/staff/addstaff", this.addForm)
              .then(res => {
                console.log(" staff", res);
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