---
oj: dmy
pid: '496'
title: 假期计划
difficulty: 入门
tags:
  - 线性DP
timeLimit: 1s
memoryLimit: 256m
---

> 数据规模：$1 \le N \le 10^5$，$0 \le a_i, b_i, c_i \le 10^4$。

## 思路

**状态设计**：$dp_j$ 表示「当前这一天以活动 $j$ 结尾」能获得的最大快乐值（下标 $j \in \{0, 1, 2\}$ 分别对应 A、B、C）。

**转移**：由于相邻两天不能选同一活动，第 $i$ 天选 $j$ 时，前一天只能选另外两项，取其中的最大值转移：

$$dp_j = \max(dp_k)_{k \ne j} + v_{i,j}$$

初始 $dp_0 = dp_1 = dp_2 = 0$，等价于第 $0$ 天（假期前）不产生任何快乐值，从第 $1$ 天起任意活动都可以接在前面。每天只用上一行的值，可以用滚动变量把空间压到 $O(1)$。

答案为 $\max(dp_0, dp_1, dp_2)$。

## 复杂度

时间 $O(N)$，额外空间 $O(1)$。

## 仓颉实现

<details>
<summary>查看仓颉实现</summary>

```cangjie
import std.env.*
import std.convert.*

main() {
    let reader = getStdIn()
    let n = Int64.parse(reader.readln().getOrThrow())
    var da: Int64 = 0
    var db: Int64 = 0
    var dc: Int64 = 0
    var i: Int64 = 0
    while (i < n) {
        let a = reader.readln().getOrThrow().split(" ", removeEmpty: true).map({ p: String => Int64.parse(p) })
        let na = max(db, dc) + a[0]
        let nb = max(da, dc) + a[1]
        let nc = max(da, db) + a[2]
        da = na
        db = nb
        dc = nc
        i += 1
    }
    println(max(da, max(db, dc)))
}
```

</details>
