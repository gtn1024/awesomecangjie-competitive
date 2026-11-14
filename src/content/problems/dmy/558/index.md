---
oj: dmy
pid: '558'
title: 自助餐
difficulty: 提高
tags:
  - 背包 DP
timeLimit: 1s
memoryLimit: 256m
---

> 数据规模：$2 \le N \le 3000$，$1 \le T \le 3000$，$1 \le A_i, B_i \le 3000$。

## 思路

**把「顺序」压缩成一个约束。** 题意是：第 $k$ 道料理在吃完前 $k-1$ 道之后才点，也就是在时刻 $\sum_{j<k} A_{p_j}$ 点餐，而第 $k$ 道（$k\ge 2$）必须在 $T-0.5$ 之前点出。所有 $A_i$ 都是整数，所以点餐时刻也是整数，「$\le T-0.5$」与「$\le T-1$」等价。

于是选出一个子集 $S$、把某种顺序 $p_1,\dots,p_{|S|}$ 排好，合法当且仅当

$$\sum_{j<|S|} A_{p_j} \le T-1 .$$

最后一道料理的耗时 $A_{p_{|S|}}$ 完全不参与这个限制——它可以在停止点餐后继续吃完。

**最后一道放最耗时的那道。** 限制式等价于 $\sum_{i\in S} A_i - A_{p_{|S|}} \le T-1$，也就是给子集里的一道料理「免单」一个 $A_i$。要想让式子最容易被满足，免单的应当是 $A_i$ 最大的那道；而把它排在最后，其余料理的顺序可以任取（前缀和不超过总和，恒满足不超过 $\sum_{i\in S}A_i - A_{\max}$）。所以

$$S \text{ 可行} \iff \sum_{i\in S} A_i - \max_{i\in S} A_i \le T-1 .$$

**带标记的 0/1 背包。** 问题变成：从 $N$ 道料理里挑一个子集，其中至多一道不计入容量（这道就是最后吃的），在容量 $T-1$ 下最大化 $\sum B_i$。用两个数组区分「免单机会是否已经用掉」：

- $dp_0[t]$：从已处理的料理中选了若干道、**没有**用掉免单机会、耗时和恰为 $t$ 的最大美味度；
- $dp_1[t]$：同样但**已经**用掉免单机会、其余料理（不含被免单的那道）耗时和恰为 $t$ 的最大美味度。

处理第 $i$ 道料理时（$t$ 倒序枚举保证每道只用一次）：

$$dp_1[t]=\max\begin{cases}dp_1[t] & \text{不选}\\ dp_0[t]+B_i & \text{让 } i \text{ 免单，不占时间}\\ dp_0[t-A_i]+B_i & \text{让 } i \text{ 免单，前面没人用过}\\ dp_1[t-A_i]+B_i & \text{前面已有人免单，} i \text{ 正常占时间}\end{cases}$$

$$dp_0[t]=\max\bigl(dp_0[t],\ dp_0[t-A_i]+B_i\bigr)$$

注意 $dp_0[t-A_i]+B_i$ 与 $dp_1[t-A_i]+B_i$ 都直接沿用旧值：因为 $t$ 倒序枚举，$t-A_i<t$ 处的值此时仍是本轮处理 $i$ 之前的值。同一个 $t$ 上先算 $dp_1[t]$ 再算 $dp_0[t]$，这样 $dp_1$ 用到的是旧的 $dp_0[t]$。

**答案与边界。** 答案取 $\max_{0\le t\le T-1} dp_1[t]$，$t$ 超过 $T-1$ 的状态直接截断不存。$T=1$ 时只有 $t=0$ 一格，退化为「只能吃一道」，$dp_1[0]=\max B_i$，正确；$A_i>T-1$ 的料理只能走免单那一支，也自动被 $dp_1[0]$ 收下。初始 $dp_0[0]=0$，其余位置与整个 $dp_1$ 置为极小值，表示不可达，避免「不可达状态 $+B_i$」被误当成合法解。

## 复杂度

时间 $O(NT)$，空间 $O(T)$。

## 仓颉实现

<details>
<summary>查看仓颉实现</summary>

```cangjie
import std.env.*
import std.convert.*

main() {
    let reader = getStdIn()
    let first = reader.readln().getOrThrow().split(" ", removeEmpty: true).map({ p: String => Int64.parse(p) })
    let n = first[0]
    let t = first[1]
    let lim = t - 1
    let neg: Int64 = -1000000000000000
    let nn = n
    let limv = lim
    var dp0 = Array<Int64>(limv + 1, { _ => neg })
    var dp1 = Array<Int64>(limv + 1, { _ => neg })
    dp0[0] = 0
    for (_ in 0..nn) {
        let ab = reader.readln().getOrThrow().split(" ", removeEmpty: true).map({ p: String => Int64.parse(p) })
        let a = ab[0]
        let b = ab[1]
        var j = limv
        while (j >= 0) {
            var best = dp1[j]
            let v0 = dp0[j] + b
            if (v0 > best) {
                best = v0
            }
            if (j >= a) {
                let v1 = dp0[j - a] + b
                if (v1 > best) {
                    best = v1
                }
                let v2 = dp1[j - a] + b
                if (v2 > best) {
                    best = v2
                }
            }
            dp1[j] = best
            if (j >= a) {
                let w = dp0[j - a] + b
                if (w > dp0[j]) {
                    dp0[j] = w
                }
            }
            j -= 1
        }
    }
    var ans: Int64 = 0
    for (j in 0..=limv) {
        if (dp1[j] > ans) {
            ans = dp1[j]
        }
    }
    println(ans)
}
```

</details>
