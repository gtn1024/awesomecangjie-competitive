---
oj: dmy
pid: '495'
title: 青蛙跳石头 2
difficulty: 普及−
tags:
  - 线性DP
timeLimit: 1s
memoryLimit: 256m
---

> 数据规模：$2 \le N \le 10^5$，$1 \le K \le 100$，$0 \le h_i \le 10^4$。

## 思路

设 $f_i$ 表示跳到第 $i$ 块石头所需的最少体力，则 $f_1 = 0$，转移为

$$f_i = \min_{i-K \le j < i} \left( f_j + |h_i - h_j| \right).$$

从 $j$ 一步跳到 $i$ 的代价就是 $|h_i - h_j|$，而所有能一步到达 $i$ 的前驱 $j$ 构成一个长度为 $K$ 的滑动窗口，对窗口内每个 $j$ 取最小值即可。最终答案为 $f_N$。

实现上按 $i = 2 \ldots N$ 顺序递推，内层枚举 $j$ 从 $\max(1, i-K)$ 到 $i-1$。注意 $f_j$ 在算 $f_i$ 时已经确定，直接顺序 DP 即可，不需要额外的数据结构：窗口内的候选只有 $K$ 个，暴力枚举就是最优做法。

## 复杂度

时间 $O(NK)$，额外空间 $O(N)$。$NK \le 10^7$，1s 时限内余量充足。

## 仓颉实现

<details>
<summary>查看仓颉实现</summary>

```cangjie
import std.env.*
import std.convert.*

main() {
    let reader = getStdIn()
    let nk = reader.readln().getOrThrow().split(" ", removeEmpty: true).map({ p: String => Int64.parse(p) })
    let n = nk[0]
    let k = nk[1]
    let h = reader.readln().getOrThrow().split(" ", removeEmpty: true).map({ p: String => Int64.parse(p) })
    let INF: Int64 = 1 << 60
    var dp = Array<Int64>(n, { _ => INF })
    dp[0] = 0
    var i: Int64 = 1
    while (i < n) {
        var j: Int64 = i - k
        if (j < 0) {
            j = 0
        }
        var best: Int64 = INF
        while (j < i) {
            let d = h[i] - h[j]
            let cost = dp[j] + (if (d < 0) {
                -d
            } else {
                d
            })
            if (cost < best) {
                best = cost
            }
            j += 1
        }
        dp[i] = best
        i += 1
    }
    println(dp[n - 1])
}
```

</details>
