<template>
  <div class="home">
    <div>中国互联近50个交易日</div>
    <div>溢价天数：{{ t1yiCount }}</div>
    <div>总溢价率：{{ allYi }}</div>
    <!-- <div>满仓预计可套：{{ ((allYi * 12) / 27).toFixed(2) }}</div> -->
    <el-table
      :data="tableData"
      style="width: 100%"
      v-loading="isLoading"
      :row-class-name="tableRowClassName"
    >
      <el-table-column prop="id" label="日期" />
      <el-table-column prop="cell.price" label="收盘价" />
      <el-table-column prop="cell.net_value" label="净值" />
      <el-table-column prop="t1Price" label="t-1估值" />
      <el-table-column prop="t1Rate" label="t-1溢价率">
        <template #default="scope"> {{ scope.row.t1Rate }}% </template>
      </el-table-column>
      <el-table-column prop="tRate" label="t日溢价率">
        <template #default="scope">
          {{ scope.row.tRate }}%
        </template></el-table-column
      >
    </el-table>
  </div>
</template>

<script lang="ts">
import { Options, Vue } from "vue-class-component";
import HelloWorld from "@/components/HelloWorld.vue"; // @ is an alias to /src
import axios from "axios";
import qs from "qs";

@Options({
  components: {
    HelloWorld,
  },
})
export default class Home extends Vue {
  allYi = "";
  t1yiCount = 0;
  tableData: any[] = [];
  isLoading = false;
  tableRowClassName(props: any): string {
    return props.row.isRed ? "red-line" : "";
  }
  created(): void {
    this.isLoading = true;
    axios({
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
        proxy: "https://www.jisilu.cn",
      },
      method: "post",
      url:
        "http://95.163.196.100:8881/data/qdii/detail_hists/?___jsl=LST___t=1618977178496",
      data: qs.stringify({
        is_search: 1,
        fund_id: 164906,
        rp: 50,
        page: 2,
      }),
    })
      .then((res) => {
        console.log(res);
        const rows = res.data.rows;
        let allYi = 0;
        let t1yiCount = 0;
        for (let i = 0; i < rows.length; i++) {
          if (rows[i + 1]) {
            const t1Price = rows[i + 1].cell.est_val;
            // t-1溢价率
            const t1Rate = (
              ((rows[i].cell.price - rows[i + 1].cell.est_val) /
                rows[i + 1].cell.est_val) *
              100
            ).toFixed(3);
            // t日溢价率
            const tRate = (
              ((rows[i].cell.price - rows[i].cell.net_value) /
                rows[i].cell.net_value) *
                100 -
              0.16
            ).toFixed(3);
            let isRed = false;
            // t-1溢价>0
            if (rows[i].cell.price > rows[i + 1].cell.est_val) {
              t1yiCount += 1;
              allYi += Number(tRate);
              isRed = true;
            }
            this.tableData.push({
              ...rows[i],
              t1Price,
              t1Rate,
              tRate,
              isRed,
            });
          }
        }
        console.log(this.tableData);
        this.allYi = allYi.toFixed(2);
        this.t1yiCount = t1yiCount;
      })
      .finally(() => {
        this.isLoading = false;
      });
  }
}
</script>
<style>
.home {
  padding: 20px;
}
.red-line {
  background-color: rgb(254, 240, 240) !important;
}
</style>
