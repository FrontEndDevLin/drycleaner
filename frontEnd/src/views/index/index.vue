<template>
    <section class="chart-container">
        <el-row>
            <el-col :span="12">
                <div id="chartColumn" style="width:100%; height:400px;"></div>
            </el-col>
            <el-col :span="12">
                <div id="chartLine" style="width:100%; height:400px;"></div>
            </el-col>
            <el-col :span="12">
                <div id="chartPie" style="width:100%; height:400px;"></div>
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
    getData() {
      httpGet("/statist/getstatist")
        .then(res => {
          console.log(res);
          if (res.code == 200) {
            // 今日统计销售前六名
            this.columnXData = [];
            this.columnYData = [];
            for (let i = 0; i < res.data.top6Sell.length; i++) {
              this.columnXData.push(res.data.top6Sell[i].title);
              this.columnYData.push(res.data.top6Sell[i].count);
            }
            // console.log(this.columnXData);
            // console.log(this.columnYData);
            this.drawColumnChart();

            // 店铺前三
            this.lineTime = [];
            this.lineStore = [];
            this.lineStoreData1 = [];
            this.lineStoreData2 = [];
            this.lineStoreData3 = [];
            var num = 0;
            for (let i in res.data.top3Store) {
              num++;
              // console.log(res.data.top3Store[i]);
              this.lineStore.push(res.data.top3Store[i].storeName);
              var arr = [];
              var arr2 = [];
              for (let n in res.data.top3Store[i].data) {
                arr.push(res.data.top3Store[i].data[n]);
                arr2.push(n.slice(5, 10));
              }
              //   console.log(arr)
              //   console.log(arr2)
              if (num == 1) {
                this.lineStoreData1.push(arr);
                this.lineTime.push(arr2);
              } else if (num == 2) {
                this.lineStoreData2.push(arr);
              } else if (num == 3) {
                this.lineStoreData3.push(arr);
              }
            }
            // console.log(111,this.lineTime[0]);
            // console.log(this.lineStoreData1[0]);
            // console.log(this.lineStoreData2[0]);
            // console.log(this.lineStoreData3[0]);
            this.drawLineChart();

            this.chartPieName=[];
            this.chartPieNum=[];
            var arr3=[];
            for(var i=0;i<res.data.top5Staff.length;i++){
                var tmp = res.data.top5Staff[i];
                var acpter = tmp.accepter;
                var cnt = tmp.count;
                this.chartPieName.push(acpter)
                this.chartPieNum.push(cnt)
                arr3.push({name:acpter,value:cnt})
            }
            // console.log(arr3);
            this.chartPieData = arr3;
            // console.log(11,this.chartPieData)
            // console.log(1,this.chartPieName)
            // console.log(2,this.chartPieNum)
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
        title: { text: "今日统计销售前六名" },
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
    this.getData();
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
/*.chart div {
        height: 400px;
        float: left;
    }*/

.el-col {
  padding: 30px 20px;
}
</style>
