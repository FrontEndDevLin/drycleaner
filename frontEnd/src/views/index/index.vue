<template>
    <section class="chart-container">
        <el-row>
            <el-col :span="12" class="box">
                <div class="cav" id="chartColumn" style="width:100%; height:400px;"></div>
                <span class="date">
                  <el-date-picker @change="change1" type="date" placeholder="选择日期" v-model="top6CommDay" style="width: 100%;"></el-date-picker>
                </span>
            </el-col>
            <el-col :span="12" class="box">
                <div class="cav" id="chartLine" style="width:100%; height:400px;"></div>
                <span class="date sec">
                  <el-date-picker @change="change2" type="date" placeholder="选择日期" v-model="top3StoreDay" style="width: 100%;"></el-date-picker>
                </span>
            </el-col>
            <el-col :span="12" class="box">
                <div class="cav" id="chartPie" style="width:100%; height:400px;"></div>
                <span class="date third">
                  <el-date-picker @change="change3" type="date" placeholder="选择日期" v-model="top5StaffDay" style="width: 100%;"></el-date-picker>
                </span>
            </el-col>
        </el-row>
    </section>
</template>

<script>
import echarts from "echarts";
import { httpGet } from "../../api/api";

export default {
  data() {
    return {
      chartColumn: null,
      columnXData: [],
      columnYData: [],
      chartBar: null,
      chartLine: null,
      lineTime: [],
      lineStore: [],
      lineStoreData1: [],
      lineStoreData2: [],
      lineStoreData3: [],
      chartPie: null,
      chartPieName:[],
      chartPieNum:[],
      chartPieData:[],
      top6CommDay:'',
      top5StaffDay:'',
      top3StoreDay:''
    };
  },

  methods: {
    unique(arr) {
      var arr2 = arr.sort();

      var res = [arr2[0]];

      for (var i = 1; i < arr2.length; i++) {
        if (arr2[i] !== res[res.length - 1]) {
          res.push(arr2[i]);
        }
      }

      return res;
    },
    change1(){
      // console.log(this.top6CommDay)
      this.top6CommDay = new Date(this.top6CommDay).toLocaleDateString();
      // console.log(new Date(this.top6CommDay).toLocaleDateString())
      this.getCol(this.top6CommDay);
    },
    change2(){
      this.top3StoreDay = new Date(this.top3StoreDay).toLocaleDateString();
      console.log(new Date(this.top3StoreDay).toLocaleDateString())
      this.getLine(this.top3StoreDay);
    },
    change3(){
      this.top5StaffDay = new Date(this.top5StaffDay).toLocaleDateString();
      // console.log(new Date(this.top5StaffDay).toLocaleDateString())
      this.getPie(this.top5StaffDay);
    },
    getCol(select) {
      httpGet("/statist/gettop6comm",{top6CommDay:select})
        .then(res => {
          console.log('col',res);
          if (res.code == 200) {
            // 今日统计销售前六名
            this.columnXData = [];
            this.columnYData = [];
            for (let i = 0; i < res.data.length; i++) {
              this.columnXData.push(res.data[i].title);
              this.columnYData.push(res.data[i].count);
            }
            this.drawColumnChart();
          } else {
            this.$massage({
              message: res.msg,
              type: "warning"
            });
          }
        })
        .catch(err => {});
    },
    getLine(select) {
      httpGet("/statist/gettop3store",{top3StoreDay:select})
        .then(res => {
          console.log('3',res);
          if (res.code == 200) {            
            // 店铺前三
            this.lineTime = [];
            this.lineStore = [];
            this.lineStoreData1 = [];
            this.lineStoreData2 = [];
            this.lineStoreData3 = [];
            var num = 0;
            for (let i in res.data) {
              num++;
              this.lineStore.push(res.data[i].storeName);
              var arr = [];
              var arr2 = [];
              for (let n in res.data[i].data) {
                arr.push(res.data[i].data[n]);
                arr2.push(n.slice(5, 10));
              }
              if (num == 1) {
                this.lineStoreData1.push(arr);
                this.lineTime.push(arr2);
              } else if (num == 2) {
                this.lineStoreData2.push(arr);
              } else if (num == 3) {
                this.lineStoreData3.push(arr);
              }
            }
            this.drawLineChart();
          } else {
            this.$massage({
              message: res.msg,
              type: "warning"
            });
          }
        })
        .catch(err => {});
    },
    getPie(select) {
      httpGet("/statist/gettop5staff",{top5StaffDay:select})
        .then(res => {
          console.log('5',res);
          if (res.code == 200) {            

            this.chartPieName=[];
            this.chartPieNum=[];
            var arr3=[];
            for(var i=0;i<res.data.length;i++){
                var tmp = res.data[i];
                var acpter = tmp.accepter;
                var cnt = tmp.count;
                this.chartPieName.push(acpter)
                this.chartPieNum.push(cnt)
                arr3.push({name:acpter,value:cnt})
            }
            this.chartPieData = arr3;
            this.drawPieChart();
          } else {
            this.$massage({
              message: res.msg,
              type: "warning"
            });
          }
        })
        .catch(err => {});
    },
    drawColumnChart() {
      this.chartColumn = echarts.init(document.getElementById("chartColumn"));
      this.chartColumn.setOption({
        title: { text: "商品销售前六名" },
        tooltip: {},
        xAxis: {
          data: this.columnXData //["衬衫", "羊毛衫", "雪纺衫", "裤子", "高跟鞋", "袜子"]
        },
        yAxis: {},
        series: [
          {
            name: "销量",
            type: "bar",
            data: this.columnYData //[5, 20, 36, 10, 10, 20]
          }
        ]
      });
    },
    drawBarChart() {
      this.chartBar = echarts.init(document.getElementById("chartBar"));
      this.chartBar.setOption({
        title: {
          text: "Bar Chart",
          subtext: "数据来自网络"
        },
        tooltip: {
          trigger: "axis",
          axisPointer: {
            type: "shadow"
          }
        },
        legend: {
          data: ["2011年", "2012年"]
        },
        grid: {
          left: "3%",
          right: "4%",
          bottom: "3%",
          containLabel: true
        },
        xAxis: {
          type: "value",
          boundaryGap: [0, 0.01]
        },
        yAxis: {
          type: "category",
          data: ["巴西", "印尼", "美国", "印度", "中国", "世界人口(万)"]
        },
        series: [
          {
            name: "2011年",
            type: "bar",
            data: [18203, 23489, 29034, 104970, 131744, 630230]
          },
          {
            name: "2012年",
            type: "bar",
            data: [19325, 23438, 31000, 121594, 134141, 681807]
          }
        ]
      });
    },
    drawLineChart() {
      this.chartLine = echarts.init(document.getElementById("chartLine"));
      this.chartLine.setOption({
        title: {
          text: "店铺前三"
        },
        tooltip: {
          trigger: "axis"
        },
        legend: {
          data: this.lineStore
        },
        grid: {
          left: "3%",
          right: "4%",
          bottom: "3%",
          containLabel: true
        },
        xAxis: {
          type: "category",
          boundaryGap: false,
          data: this.lineTime[0]
        },
        yAxis: {
          type: "value"
        },
        series: [
          {
            name: this.lineStore[0],
            type: "line",
            // stack: "总量",
            data: this.lineStoreData1[0]
          },
          {
            name: this.lineStore[1],
            type: "line",
            // stack: "总量",
            data: this.lineStoreData2[0]
          },
          {
            name: this.lineStore[2],
            type: "line",
            // stack: "总量",
            data: this.lineStoreData3[0]
          }
        ]
      });
    },
    drawPieChart() {
      this.chartPie = echarts.init(document.getElementById("chartPie"));
      this.chartPie.setOption({
        title: {
          text: "销售之星(前五)",
          x: "center"
        },
        tooltip: {
          trigger: "item",
          formatter: "{a} <br/>{b} : {c} ({d}%)"
        },
        legend: {
          orient: "vertical",
          left: "left",
          data: this.chartPieName
        },
        series: [
          {
            name: "访问来源",
            type: "pie",
            radius: "55%",
            center: ["50%", "60%"],
            data:this.chartPieData,
            itemStyle: {
              emphasis: {
                shadowBlur: 10,
                shadowOffsetX: 0,
                shadowColor: "rgba(0, 0, 0, 0.5)"
              }
            }
          }
        ]
      });
    }
  },
  created() {
    this.getCol(this.top6CommDay);
    this.getLine(this.top3StoreDay);
    this.getPie(this.top5StaffDay);
  },
  mounted: function() {
  },
  updated: function() {
  }
};
</script>

<style scoped>
.chart-container {
  width: 100%;
  float: left;
}
.cav{
  margin-top: 20px;
}
.date{
  position: absolute;
  /* top: 25px;
  left: 180px; */
  top: 10px;
  left: 24px;
}
.third{
  /* left: 325px;
      top: 61px; */
}
.sec{
  /* left:600px; */
}
.box{
  position: relative;
}
.el-col {
  padding: 30px 20px;
}
</style>
