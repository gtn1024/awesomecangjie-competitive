---
oj: dmy
pid: '495'
title: 青蛙跳石头 2
difficulty: 入门
tags:
  - 线性DP
timeLimit: 1s
memoryLimit: 256m
---

> 数据规模：$2 \le N \le 10^5$，$1 \le K \le 100$，$0 \le h_i \le 10^4$。

## 思路

设 $dp[i]$ 表示青蛙到达第 $i$ 块石头的最少体力，$dp[1] = 0$。

**考虑最后一次跳跃**：青蛙从第 $j$ 块石头跳到第 $i$ 块石头，必须满足 $i - K \le j \le i - 1$，代价为 $dp[j] + |h_i - h_j|$。于是转移方程为

$$dp[i] = \min_{\max(1,\, i-K) \le j \le i-1} \bigl( dp[j] + |h_i - h_j| \bigr).$$

答案即 $dp[N]$。

由于 $K \le 100$，每个状态只需检查至多 $100$ 个前驱，直接枚举个数即可，无需单调队列等优化。注意代价与下标无关（只与高度差有关），所以窗口就是「下标距离不超过 $K$」的连续区间，逐个取最小值即为最优。

## 复杂度

时间 $O(NK) \approx 10^7$ 次运算，空间 $O(N)$。

## 仓颉实现

<details>
<summary>查看仓颉实现</summary>

```cangjie
import std.env.*
import std.convert.*
import std.math.*

main() {
    let reader = getStdIn()
    let nk = reader.readln().getOrThrow().split(" ", removeEmpty: true).map({ p: String => Int64.parse(p) })
    let n = nk[0]
    let k = nk[1]
    let h = reader.readln().getOrThrow().split(" ", removeEmpty: true).map({ p: String => Int64.parse(p) })
    let nn = n
    let kk = k
    var dp = Array<Int64>(nn, { _ => 0 })
    var i: Int64 = 1
    while (i < nn) {
        var best: Int64 = Int64.Max
        var j: Int64 = if (i - kk > 0) { i - kk } else { 0 }
        while (j < i) {
            let c = dp[j] + abs(h[i] - h[j])
            if (c < best) {
                best = c
            }
            j += 1
        }
        dp[i] = best
        i += 1
    }
    println(dp[nn - 1])
}
```

</details>
