<template>
	<el-form ref="form" :model="form" :rules="rules" label-width="80px" @submit.prevent="onSubmit" style="margin:20px;width:60%;min-width:600px;">
		<el-form-item label="姓名" prop="dc_name">
			<el-input v-model="form.dc_name"></el-input>
		</el-form-item>
    <el-form-item label="电子邮件" prop="email">
			<el-input v-model="form.email"></el-input>
		</el-form-item>
    <el-form-item label="电话" prop="dc_phone">
			<el-input v-model="form.dc_phone"></el-input>
		</el-form-item>
    <el-form-item label="密码" prop="pwd">
			<el-input v-model="form.pwd"></el-input>
		</el-form-item>
    <el-form-item label="性别" prop="gender">
			<el-radio-group v-model="form.gender">
				<el-radio :label="1">男</el-radio>
				<el-radio :label="0">女</el-radio>
			</el-radio-group>
    </el-form-item>
		<el-form-item label="头像">
			<el-upload
				class="avatar-uploader"
				action="http://192.168.2.108:4449/auth/uploadavt"
        :with-credentials="true"
				:show-file-list="false"
				:on-success="handleAvatarSuccess"
				:before-upload="beforeAvatarUpload">
				<img v-if="imageUrl" :src="imageUrl" class="avatar">
				<i v-else class="el-icon-plus avatar-uploader-icon"></i>
			</el-upload>
		</el-form-item>
		<el-form-item label="简介">
			<el-input type="textarea" v-model="form.intro"></el-input>
		</el-form-item>
		<el-form-item class="btn">
			<el-button type="primary" @click.native="onSubmit" :loading="Loading">保存修改</el-button>
		</el-form-item>
	</el-form>
</template>

<script>
import { httpGet, httpPost } from "../../api/api";
export default {
  data() {
    return {
      rules: {
        dc_name: [{ required: true, message: "请输入姓名", trigger: "blur" }],
        dc_phone: [
          {
            required: true,
            pattern: /^1\d{10}$/,
            message: "手机号格式不正确",
            trigger: "blur"
          }
        ]
      },
      form: {
        dc_name: "",
        email: "",
        dc_phone: "",
        gender: "",
        intro: "",
        pwd: ""
      },
      imageUrl: "",
      Loading: false
    };
  },
  methods: {
    getUser() {
      console.log(1);
      httpGet("/auth/getselfinfo")
        .then(res => {
          console.log(12, res);
          this.imageUrl = res.data.dc_avatar;
          this.form.dc_name = res.data.dc_name;
          this.form.email = res.data.email;
          this.form.dc_phone = res.data.dc_phone;
          this.form.gender = res.data.gender;
          this.form.intro = res.data.intro;
        })
        .catch(err => {
          console.log(err);
        });
    },
    onSubmit() {
      console.log(this.form);
      this.Loading = true;
      httpPost("/auth/updselfinfo", this.form)
        .then(res => {
          console.log(123, res);
          this.Loading = false;
          if (res.code == 200) {
            this.$message({
              message: res.msg+',重新登录才可以看到某些修改',
              type: "success"
            });
            this.getUser();
          } else {
            this.$message({
              message: res.msg,
              type: "warning"
            });
          }
        })
        .catch(err => {
          this.Loading = false;
          console.log(err);
        });
    },
    handleAvatarSuccess(res, file) {
      console.log(file);
      this.imageUrl = URL.createObjectURL(file.raw);
      console.log(this.imageUrl);
      this.getUser();
    },
    beforeAvatarUpload(file) {
      console.log(file);
      const isJPG = file.type === "image/jpeg";
      const isLt2M = file.size / 1024 / 1024 < 2;

      if (!isJPG) {
        this.$message.error("上传头像图片只能是 JPG 格式!");
      }
      if (!isLt2M) {
        this.$message.error("上传头像图片大小不能超过 2MB!");
      }
      return isJPG && isLt2M;
    }
  },
  created() {
    this.getUser();
  }
};
</script>
<style lang="scss" scoped>
.el-form-item {
  .avatar-uploader {
    border: 1px dashed #d9d9d9 !important;
    width: 178px;
    height: 178px;
  }
  .avatar-uploader-icon {
    font-size: 28px;
    color: #8c939d;
    width: 178px;
    height: 178px;
    line-height: 178px;
    text-align: center;
  }
  .avatar {
    width: 178px;
    height: 178px;
    display: block;
  }
  .el-button--primary {
    display: block;
    margin: 0 auto;
  }
}
</style>
