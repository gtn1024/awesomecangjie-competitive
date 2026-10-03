---
oj: dmy
pid: '100'
title: '[R17D]数字跳跃'
difficulty: 提高
tags:
  - 动态规划
timeLimit: 1s
memoryLimit: 512m
---

## 题目

定义跳跃操作：对数字 $x$ 进行参数为 $y$ 的跳跃操作，会将 $x$ 变为 $2y-x$。给定 $n$ 个跳跃操作，编号 $i$ 的参数为 $a_i$。初始 $x=0$，你可以选择一些（可以选 $0$ 个）操作，按编号从小到大的顺序依次执行，求最终 $x$ 的最大值。

> 对于 $100\%$ 的数据，$1\le n\le 10^5$，$-10^9\le a_i\le 10^9$。

## 思路

设选出的操作参数按顺序为 $b_1,b_2,\dots,b_t$，并记执行到第 $j$ 步后的值为 $x_j$（$x_0=0$）。根据操作定义 $x_j=2b_j-x_{j-1}$。

引入交替和 $S_j=x_j/2$，即 $S_0=0$，且

$$
S_j = b_j - S_{j-1}.
$$

于是 $b_1,b_2,\dots,b_t$ 展开后

$$
S_t = b_t - b_{t-1} + b_{t-2} - \cdots + (-1)^{t-1}b_1,
$$

而最终 $x=2S_t$。问题等价于：从原数组中按原顺序选一个子序列，最大化其交替和 $S_t$。

**关键观察**：第 $j$ 次选择的变换是 $S \mapsto b_j - S$，这是一个关于 $b_j$ 的反射。若记「当前已选若干项后，所有可能得到的 $S$ 值集合」为 $V$，那么再选一项 $b_j$ 后，新集合为 $V\cup\{b_j-S\mid S\in V\}$。

反射保持区间结构，因此 $V$ 始终是一个以某个实数为中心、对称翻转得到的集合。**只要维护 $V$ 中的最大值 $\text{maxS}$ 和最小值 $\text{minS}$ 即可**：

- 不选 $a_i$：集合不变；
- 选 $a_i$：每个元素变为 $a_i-S$，最大值变为 $a_i-\text{minS}$，最小值变为 $a_i-\text{maxS}$。

于是转移为

$$
\begin{aligned}
\text{newMaxS} &= \max(\text{maxS},\ a_i-\text{minS}),\\
\text{newMinS} &= \min(\text{minS},\ a_i-\text{maxS}).
\end{aligned}
$$

初始时只选了空子序列，$S=0$，故 $\text{maxS}=\text{minS}=0$。最终答案为 $2\times\text{maxS}$。

注意 $\text{maxS}$ 的绝对值不超过 $n\cdot\max|a_i|\le 10^{14}$，用 `Int64` 完全不会溢出。

## 复杂度

- 时间复杂度：$O(n)$，每个元素一次常数时间转移。
- 空间复杂度：$O(n)$ 存储输入数组（也可边读边转移优化到 $O(1)$ 额外空间）。

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

    var maxS: Int64 = 0
    var minS: Int64 = 0
    for (i in 0..n) {
        let v = a[i]
        let nmax = if (maxS > v - minS) { maxS } else { v - minS }
        let nmin = if (minS < v - maxS) { minS } else { v - maxS }
        maxS = nmax
        minS = nmin
    }
    println((2 * maxS).toString())
}
```

</details>
