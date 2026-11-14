---
oj: dmy
pid: '555'
title: '抛硬币奖励'
difficulty: 提高
tags:
  - 线性 DP
timeLimit: 1s
memoryLimit: 256m
---

> 数据规模：$1 \le M \le N \le 5000$，$1 \le X_i, Y_j \le 10^9$，$1 \le C_j \le N$，所有 $C_j$ 互不相同。

## 思路

**状态。** 硬币的正反面可以任意选择，所以每一步都是一个决策。由于每一次的收益只取决于「这一次选了正面还是反面」以及「选完之后计数器变成多少」，而计数器在反面时会立刻归零，真正影响未来的信息只有当前计数器的值：

$$dp[c] = \text{已经抛完前若干次、计数器恰为 } c \text{ 时的最大累计收益}.$$

初始时还没抛掷，$dp[0] = 0$，其余状态都不可达。

**转移。** 设当前要抛第 $i$ 次（$1 \le i \le N$），从状态 $c$ 出发：

- 选反面：计数器归零，本次不得钱，转移到计数器 $0$，即 $newdp[0] = \max_c dp[c]$；
- 选正面：计数器变成 $c+1$，本次得到 $X_i$，并且计数器一旦等于某个 $C_j$ 就额外得到 $Y_j$，即

$$newdp[c+1] = dp[c] + X_i + bonus[c+1],$$

其中 $bonus[c] = Y_j$（当 $c = C_j$ 时），否则为 $0$。

这里的关键是「计数器变为 $C_j$」只发生在正面让计数从 $C_j-1$ 涨到 $C_j$ 的那一刻：计数每次正面只加 $1$，所以同一段连续正面里 $C_j$ 至多被跨过一次，不会重复计奖；而一旦出现反面归零，之后再次连续正面又会重新经过 $C_j$，可以再次得奖——这正好由「归零后从 $dp[0]$ 重新出发」自然刻画，不需要额外记录哪几种奖励已经领过。

**为什么只用最大值就够。** 从同一个状态出发，未来能拿到的钱只由当前计数决定，与到达它的具体过程无关；而收益是累加的，所以对每个计数只需保留收益最大的那个前驱。归零那一步把所有状态压到 $dp[0]$，同样取最大值即可。

**边界与实现细节。**

- 计数器最多涨到 $i$，所以第 $i$ 次只需遍历 $c = 0 \ldots i-1$，用滚动数组在 $O(N)$ 空间内完成；交换两个数组即可，不必清空被换下来的旧值（每一轮都会把所有会被读到的下标重写一遍）。
- $C_j \le N$，用一个长度为 $N+1$ 的 `bonus` 数组把奖励预置好，避免每轮查找。
- 不可达状态置为一个极小值（如 $-10^{18}$）。它的转移结果最多再加 $N \cdot 2 \cdot 10^9 = 10^{13}$，仍远小于 $0$，不会与真实收益混淆，也不会在 64 位整数内下溢。
- 答案取所有计数上的最大值，而不是 $dp[0]$：最后一次抛掷可能是正面，计数器不必回到 $0$。

以样例 1 为例，三次都选正面时依次到达计数 $1,2,3$，收益为 $1+2+3$ 再加上 $C_1=1$ 的 $4$ 与 $C_2=2$ 的 $5$，共 $15$。

## 复杂度

时间 $O(N^2)$（第 $i$ 轮遍历 $i$ 个状态，合计约 $N^2/2$ 次转移），空间 $O(N)$。

## 仓颉实现

用两个长度为 $N+1$ 的数组滚动，每一轮把旧行换成新行，转移时只遍历 $c = 0 \ldots i-1$，同时顺便求出归零状态需要的最大值。

<details>
<summary>查看仓颉实现</summary>

```cangjie
import std.env.*
import std.convert.*

main() {
    let first = getStdIn().readln().getOrThrow().split(" ", removeEmpty: true).map({ p: String => Int64.parse(p) })
    let n = first[0]
    let m = first[1]
    let x = getStdIn().readln().getOrThrow().split(" ", removeEmpty: true).map({ p: String => Int64.parse(p) })
    let bonus = Array<Int64>(n + 2, { _ => 0 })
    for (_ in 0..m) {
        let line = getStdIn().readln().getOrThrow().split(" ", removeEmpty: true).map({ p: String => Int64.parse(p) })
        bonus[line[0]] = line[1]
    }
    let NEG: Int64 = -1000000000000000000
    var dp = Array<Int64>(n + 2, { _ => NEG })
    var ndp = Array<Int64>(n + 2, { _ => NEG })
    dp[0] = 0
    for (i in 0..n) {
        var best = NEG
        for (c in 0..=i) {
            if (dp[c] > best) {
                best = dp[c]
            }
        }
        ndp[0] = best
        for (c in 0..=i) {
            ndp[c + 1] = dp[c] + x[i] + bonus[c + 1]
        }
        let tmp = dp
        dp = ndp
        ndp = tmp
    }
    var ans = NEG
    for (c in 0..=n) {
        if (dp[c] > ans) {
            ans = dp[c]
        }
    }
    println(ans)
}
```

</details>
