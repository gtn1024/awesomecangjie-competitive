---
oj: dmy
pid: '505'
title: 回家的路
difficulty: 入门
tags:
  - 线性DP
timeLimit: 1s
memoryLimit: 256m
---

> 数据规模：$2 \le n \le 100$，$1 \le d \le n$，`s` 为长度 $n$ 的 01 串，首尾字符均为 `1`。

## 思路

**定义状态：** $dp_i$ 表示从位置 1 跳到位置 $i$ 所需的最少跳跃次数。$dp_1 = 0$；若位置 $i$ 不能落脚（`s` 的第 $i$ 个字符为 `0`），则 $dp_i = +\infty$。

**转移：** 要跳到位置 $i$，上一落脚点 $j$ 必须满足 $\max(1, i-d) \le j < i$，且 $dp_j$ 可达（位置 $j$ 能落脚）。于是

$$dp_i = \begin{cases} 1 + \min\limits_{\max(1,i-d) \le j < i} dp_j, & s_i = \texttt{1} \\[2mm] +\infty, & s_i = \texttt{0} \end{cases}$$

**按 $i$ 从小到大递推**即可：所有可用的 $j$ 都小于 $i$，处理 $i$ 时它们都已算好。跳跃次数与位置无关地取最小值，因此这种「贪心地从可达前驱里挑最优」的线性 DP 是正确的。

最后答案就是 $dp_n$；若 $dp_n$ 仍为 $+\infty$，说明位置 $n$ 不可达，输出 $-1$。

## 复杂度

时间 $O(nd)$，额外空间 $O(n)$。本题 $n \le 100$，最少跳跃次数一定不超过 $n$，用一个远大于 $n$ 的数（如 $10^6$）代表无穷大即可。

## 仓颉实现

<details>
<summary>查看仓颉实现</summary>

```cangjie
import std.env.*
import std.convert.*

main() {
    let reader = getStdIn()
    let first = reader.readln().getOrThrow().split(" ", removeEmpty: true)
    let n = Int64.parse(first[0])
    let d = Int64.parse(first[1])
    let s = reader.readln().getOrThrow()
    let INF: Int64 = 1000000
    let nn = n
    let dp = Array<Int64>(nn + 1, { _ => INF })
    dp[1] = 0
    var i: Int64 = 2
    while (i <= n) {
        if (s[i - 1] == 49) {
            var j = i - d
            if (j < 1) {
                j = 1
            }
            var best = INF
            while (j < i) {
                if (dp[j] + 1 < best) {
                    best = dp[j] + 1
                }
                j += 1
            }
            dp[i] = best
        }
        i += 1
    }
    if (dp[n] >= INF) {
        println(-1)
    } else {
        println(dp[n])
    }
}
```

</details>
