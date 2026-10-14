---
oj: dmy
pid: '498'
title: 篮球训练
difficulty: 普及−
tags:
  - 线性DP
  - 动态规划
timeLimit: 1s
memoryLimit: 256m
---

> 数据规模：$1 \le N \le 10^5$，每个分数均为不超过 $10^5$ 的非负整数。

## 思路

「不能有公共边」在 $2\times N$ 的表格上只对应两类限制：同一列的上下两格相邻，以及相邻两列中同一行的两格相邻。

**按列从左到右决策，每一列只有 3 种状态**：

- $0$：这一列一个都不选；
- $1$：只选上格；
- $2$：只选下格。

上下两格同时选是违法的（它们共边），所以状态只有这 3 种。

**状态之间的转移由「相邻列的同一行不能同时被选」决定**：若第 $i$ 列选了上格，第 $i+1$ 列就不能选上格；下格同理。状态 $0$ 不与任何状态冲突。

设 $dp[i][s]$ 表示只考虑前 $i$ 列、且第 $i$ 列状态为 $s$ 时的最大分数，$a_i$、$b_i$ 分别为第 $i$ 列的上下分数，则

$$
\begin{aligned}
dp[i][0] &= \max\bigl(dp[i-1][0],\ dp[i-1][1],\ dp[i-1][2]\bigr),\\
dp[i][1] &= a_i + \max\bigl(dp[i-1][0],\ dp[i-1][2]\bigr),\\
dp[i][2] &= b_i + \max\bigl(dp[i-1][0],\ dp[i-1][1]\bigr).
\end{aligned}
$$

边界上把第 $1$ 列之前看作一个什么都不选的虚拟列，即 3 个初值全为 $0$；由于分数非负，这样初始化不会漏掉任何合法方案。最终答案为 $\max(dp[N][0], dp[N][1], dp[N][2])$。

转移只依赖上一列的 3 个值，因此用 3 个变量滚动即可，无需存下整张表。

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
    let a = reader.readln().getOrThrow().split(" ", removeEmpty: true).map({ p: String => Int64.parse(p) })
    let b = reader.readln().getOrThrow().split(" ", removeEmpty: true).map({ p: String => Int64.parse(p) })
    var none: Int64 = 0
    var top: Int64 = 0
    var bot: Int64 = 0
    var i: Int64 = 0
    while (i < n) {
        let pn = max(none, max(top, bot))
        let pt = a[i] + max(none, bot)
        let pb = b[i] + max(none, top)
        none = pn
        top = pt
        bot = pb
        i += 1
    }
    println(max(none, max(top, bot)))
}
```

</details>
