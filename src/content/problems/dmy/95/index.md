---
oj: dmy
pid: '95'
title: '[R16E] 数组问题'
difficulty: 普及+/提高
tags:
  - 动态规划
  - 分拆数
  - 预处理
timeLimit: 1s
memoryLimit: 512m
---

> 数据规模：$1 \le T \le 10^5$，$1 \le n \le m \le 8000$。答案对 $998244353$ 取模。

## 思路

合法数组 $a_1 \le a_2 \le \cdots \le a_n$ 且 $\sum a_i = m$，$a_1 \ge 1$。这恰好是 **$m$ 的 $n$ 部分拆数**，即把 $m$ 拆成 $n$ 个正整数之和（不计顺序）的方案数。

设 $dp[i][j]$ 表示把 $j$ 拆成 $i$ 个正整数之和的方案数。按划分中最小值是否为 $1$ 分类：

1. 划分里含至少一个 $1$：去掉一个 $1$，剩下的就是把 $j - 1$ 拆成 $i - 1$ 个正整数，方案数 $dp[i-1][j-1]$；
2. 划分里所有数都大于 $1$：把 $i$ 个数各减 $1$，等价于把 $j - i$ 拆成 $i$ 个正整数，方案数 $dp[i][j-i]$。

于是转移方程为

$$dp[i][j] = dp[i-1][j-1] + dp[i][j-i],$$

边界 $dp[0][0] = 1$，且只有 $j \ge i$ 时状态有意义。注意第二种转移要求 $j - i \ge i$（即 $k = j - i \ge i$，$k$ 为行内下标），否则第二项为 $0$。

由于 $T$ 高达 $10^5$，必须**离线预处理整张表**，查询时 $O(1)$ 查表。预处理时间 $O(nm)$，查询时间 $O(1)$，总复杂度 $O(nm + T)$。

## 仓颉实现

<details>
<summary>查看仓颉实现</summary>

```cangjie
import std.console.*
import std.convert.*

main() {
    let MOD: UInt32 = 998244353
    let MAX: Int64 = 8000
    // dp[i][j] = number of ways to partition j into i positive parts.
    // Only j >= i is meaningful. Use a triangular layout to save memory:
    // for row i, store values for j in [i, MAX] in length (MAX - i + 1),
    // i.e. index k corresponds to j = i + k.
    // MOD < 2^31, so MOD+MOD < 2^32 fits in UInt32 without overflow.
    var dp = Array<Array<UInt32>>(MAX + 1, { _ => Array<UInt32>(0, { _ => UInt32(0) }) })
    // dp[0][0] = 1 (empty partition of 0); all other dp[0][k>0] = 0.
    let row0 = Array<UInt32>(MAX + 1, { _ => UInt32(0) })
    row0[0] = UInt32(1)
    dp[0] = row0
    var i: Int64 = 1
    while (i <= MAX) {
        let len: Int64 = MAX - i + 1
        let row = Array<UInt32>(len, { _ => UInt32(0) })
        var k: Int64 = 0
        while (k < len) {
            // dp[i][j] = dp[i-1][j-1] + dp[i][j-i], where j = i + k.
            // part 1: dp[i-1][j-1] -> previous row index k (since (j-1)-(i-1)=k).
            var v = dp[i - 1][k]
            // part 2: dp[i][j-i] -> current row index k-i, valid only if k-i >= 0.
            if (k >= i) {
                v = v + row[k - i]
                if (v >= MOD) {
                    v = v - MOD
                }
            }
            row[k] = v
            k = k + 1
        }
        dp[i] = row
        i = i + 1
    }
    let reader = Console.stdIn
    let t = Int64(reader.readln().getOrThrow().split(" ", removeEmpty: true).map({ p => Int64.parse(p) })[0])
    var count: Int64 = 0
    while (count < t) {
        count = count + 1
        let parts = reader.readln().getOrThrow().split(" ", removeEmpty: true).map({ p => Int64.parse(p) })
        let n = parts[0]
        let m = parts[1]
        // dp[n][m]: row n index for value m is m - n.
        let ans = Int64(dp[n][m - n])
        println(ans)
    }
}
```

</details>

要点：

- **分拆数递推**：把合法序列重述为「$m$ 拆成 $n$ 个正整数」，立刻得到经典分拆数递推 $dp[i][j] = dp[i-1][j-1] + dp[i][j-i]$，两个加法项分别对应「划分里有一个 $1$」「所有数都减 $1$」两种情形。
- **三角化存储省内存**：只有 $j \ge i$ 时状态非零，第 $i$ 行只存下标 $k = j - i \in [0, MAX-i]$，下标换算 $j = i + k$。完整 $8001 \times 8001$ 的 `Int64` 表约 512MB，三角化后约 3200 万项。
- **用 `UInt32` 存值**：模数 $998244353 < 2^{31}$，两项之和 $< 2^{32}$ 不会溢出，用 `v + row[k-i]` 后比较减模即可。约 3200 万项的 `UInt32` 表约 128MB，实测峰值 160MB，远低于 512MB 上限。逐行只引用「上一行」与「本行左侧」，递推方向天然无依赖冲突。
- **预处理后查询 $O(1)$**：$T$ 达 $10^5$ 时不能每次重算；整张表离线建好后，每问只查 `dp[n][m-n]` 一次。答案算出后直接用 `println` 输出。
