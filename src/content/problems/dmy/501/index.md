---
oj: dmy
pid: '501'
title: 带权选数
difficulty: 普及−
tags:
  - 线性DP
timeLimit: 1s
memoryLimit: 256m
---

> 数据规模：$1 \le M \le N \le 2000$，$-10^9 \le a_i \le 10^9$。

## 思路

按原相对顺序恰好选 $M$ 个数，第 $j$ 个被选中的数贡献 $j \times a_i$，是经典的线性 DP。

设 $dp[j]$ 表示处理完当前前缀、共选了 $j$ 个数时的最大总分。扫描到 $a_i$ 时有两种决策：

- 不选 $a_i$：$dp[j]$ 保持不变；
- 选 $a_i$：它成为第 $j$ 个被选中的数，由 $dp[j-1]$ 转移，得到 $dp[j-1] + j \times a_i$。

转移方程为 $dp[j] = \max(dp[j],\ dp[j-1] + j \times a_i)$。**内层让 $j$ 从 $M$ 倒序枚举到 $1$**，这样 $dp[j-1]$ 仍是上一轮的值，一维数组即可完成滚动更新，无需记录位置维度。

由于 $a_i$ 可以为负，初值把 $dp[1..M]$ 全部置为 $-\infty$（取 $-4 \times 10^{18}$，加上转移量 $j \times a_i$ 也不会溢出），只有 $dp[0] = 0$。因为 $M \le N$，合法方案必然存在，最终答案即 $dp[M]$。

## 复杂度

时间 $O(N \times M)$，额外空间 $O(M)$。答案最大约为 $\sum_{j=1}^{M} j \times 10^9 \approx 2 \times 10^{15}$，`Int64` 足够容纳。

## 仓颉实现

<details>
<summary>查看仓颉实现</summary>

```cangjie
import std.env.*
import std.convert.*

main() {
    let reader = getStdIn()
    let nm = reader.readln().getOrThrow().split(" ", removeEmpty: true).map({ p: String => Int64.parse(p) })
    let n = nm[0]
    let m = nm[1]
    let a = reader.readln().getOrThrow().split(" ", removeEmpty: true).map({ p: String => Int64.parse(p) })
    let NEG: Int64 = -4000000000000000000
    let dp = Array<Int64>(m + 1, { _ => NEG })
    dp[0] = 0
    var i: Int64 = 0
    while (i < n) {
        var j = m
        while (j >= 1) {
            let cand = dp[j - 1] + j * a[i]
            if (cand > dp[j]) {
                dp[j] = cand
            }
            j -= 1
        }
        i += 1
    }
    println(dp[m])
}
```

</details>
