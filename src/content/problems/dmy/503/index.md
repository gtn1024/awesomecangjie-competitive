---
oj: dmy
pid: '503'
title: 数字消除游戏
difficulty: 普及−
tags:
  - 线性DP
timeLimit: 1s
memoryLimit: 256m
---

> 数据规模：$1 \le n \le 10^5$，$1 \le a_i \le 10^5$。

## 思路

**操作的顺序与元素的原始位置都无关，只与「哪些数值出现了多少次」有关。** 记 $cnt_v$ 为数值 $v$ 的出现次数，那么一旦决定选择 $v$，这一次操作的收益就固定为

$$w_v = v \times cnt_v,$$

因为题面描述的是「获得 $x$ 分，并移除**所有**数值为 $x$ 的整数」——注意样例中 5 个数 $1,2,2,3,3$，第二次选择 3 时得到的是 $6$ 分而不是 $3$ 分，可见得分是 $x$ 乘以该数值的个数。

**关键转化：问题等价于在数值轴 $1 \sim V$ 上选出一些互不相邻（不差 1）的数值，使它们的 $w$ 之和最大。** 两个方向都成立：

- 必要性：选择 $x$ 会把所有 $x-1$ 与 $x+1$ 一并移除，而每次操作必须选「仍然存在的整数」，所以 $x-1$、$x+1$ 之后都不可能再被选择。于是被选中的数值集合中不存在相差 1 的两个数。
- 充分性：反过来，任取一个不含相邻数值的集合 $S$，按任意顺序把 $S$ 中的数值依次选完即可。选择 $x$ 时被销毁的只有 $x-1$、$x$、$x+1$，而 $x-1, x+1 \notin S$（无相邻性），$S$ 中其余数值的副本一个都没被动过，因此这样一定能把 $S$ 完整地选完，得分为 $\sum_{x \in S} w_x$。

   至于既不在 $S$ 中、又不与任何被选数值相邻的那些数值，它们会一直留在场上，但题目只要求最大化得分，允许随时停止操作，所以它们不影响答案。

这就是「打家劫舍」式的线性 DP。设 $f_v$ 表示只考虑数值 $1 \sim v$、且**不选** $v$ 时能得到的最大得分，$g_v$ 表示**选** $v$ 时的最大得分：

$$g_v = f_{v-1} + w_v, \qquad f_v = \max(f_{v-1},\ g_{v-1}).$$

含义是：选 $v$ 就绝不能选 $v-1$，只能接在「$1 \sim v-1$ 且不选 $v-1$」的最优解后面；不选 $v$ 则 $v-1$ 选与不选都行。

答案是 $\max(f_V, g_V)$，其中 $V = 10^5$（为了书写方便循环到 $10^5+1$ 也无妨，多出来的那一列 $w = 0$，不改变答案）。转移只依赖上一列的两个值，用两个变量滚动即可，无需 $O(V)$ 的 DP 数组。

数值范围保证 $a_i \ge 1$，所以选择 1 时只会移除 1 和 2，不存在数值 0 需要处理。

单个 $w_v$ 可达 $10^5 \times 10^5 = 10^{10}$，总和同量级，超过 32 位整数范围，需要用 64 位整数累加。

## 复杂度

时间 $O(n + V)$，额外空间 $O(V)$（存 $1 \sim V$ 的出现次数），$V = 10^5$。

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
    let m: Int64 = 100002
    let cnt = Array<Int64>(m, { _ => 0 })
    for (x in a) {
        cnt[x] += 1
    }
    var dp0: Int64 = 0
    var dp1: Int64 = 0
    var v: Int64 = 1
    while (v < m) {
        let take = dp0 + v * cnt[v]
        let skip = dp0
        if (dp1 > skip) {
            dp0 = dp1
        } else {
            dp0 = skip
        }
        dp1 = take
        v += 1
    }
    if (dp0 > dp1) {
        println(dp0)
    } else {
        println(dp1)
    }
}
```

</details>
