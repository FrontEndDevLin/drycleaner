<template>
	<el-form ref="form" :model="form" :rules="rules" label-width="80px" @submit.prevent="onSubmit" style="margin:20px;width:60%;min-width:600px;">
		<el-form-item label="标题" prop="title">
			<el-input v-model="form.title"></el-input>
		</el-form-item>
		<el-form-item label="具体内容" prop="content">
			<el-input type="textarea" v-model="form.content"></el-input>
		</el-form-item>
		<el-form-item label="选择店铺" prop="storeId">
          <el-select v-model="form.storeId" placeholder="请选择" min-width="600px">
            <el-option
              v-for="(item,index) in shop"
              :key="index"
              :label="item.newName"
              :value="item.vid">
            </el-option>
          </el-select>
				</el-form-item>
		<el-form-item>
			<el-button type="primary" @click.native="onSubmit" :loading="Loading">发布</el-button>
		</el-form-item>
	</el-form>
</template>

<script>
import { httpGet } from "../../api/api";
export default {
  data() {
    return {
      form: {
        title: "",
        content: "",
        storeId: "" //number
      },
      rules: {
        title: { required: true, message: "请输入标题", trigger: "blur" },
        content: { required: true, message: "请输入内容", trigger: "blur" },
        storeId: { required: true, message: "请选择店铺", trigger: "blur" }
      },
      Loading: false,
      shop: []
    };
  },
  methods: {
    onSubmit() {
      console.log(this.form);
      this.Loading = true;
      httpGet("/inform/noticeofstore", this.form)
        .then(res => {
          this.Loading = false;
          if (res.code == 200) {
            console.log("res get", res);
            this.$refs["form"].resetFields();
            this.$message({
              message: res.msg,
              type: "success"
            });
          } else {
            this.$message({
              message: res.msg,
              type: "warning"
            });
          }
        })
        .catch(() => {
          this.Loading = false;
          console.log(err);
        });
    },
    getUser() {
      let param = {
        pno: 1, // 当前页码 不传的话默认1
        all: true
      };
      httpGet("/store/getstorelist", param)
        .then(res => {
          this.listLoading = false;
          if (res.code == 200) {
            console.log("shop get", res);
            this.shop = [];
            for (let i = 0; i < res.data.items.length; i++) {
              this.shop.push({
                vid: res.data.items[i]._id,
                newName: res.data.items[i].name
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
    }
  },
  created(){
	  this.getUser()
  }
};
</script>