---
oj: dmy
pid: '551'
title: '香料配菜'
difficulty: 提高
tags:
  - 单调队列优化 DP
timeLimit: 1s
memoryLimit: 256m
---

> 数据规模：$1 \le W \le 10^4$，$1 \le N \le 500$，$1 \le L_i \le R_i \le W$，$1 \le V_i \le 10^9$。

## 思路

**把实数消耗换成区间和的判定。** 设选中的菜肴集合为 $S$，记 $A=\sum_{i\in S}L_i$，$B=\sum_{i\in S}R_i$。每个 $x_i$ 可以取 $[L_i,R_i]$ 中任意实数，于是所有可能的取值恰好是区间 $[A,B]$（每个维度都能连续变化，加减一个其它变量的连续性不会破坏整体连续性）。所以集合 $S$ 可行当且仅当

$$A \le W \le B.$$

又因为每个 $[L_i,R_i]$ 内部是连续的整数段，把若干个连续整数段相加，能得到 $[A,B]$ 中的每个整数。因此「存在实数解」与「存在每个 $x_i$ 都取整数的解」等价。于是可以只考虑整数重量，题目变成：每件物品的重量可以取 $[L_i,R_i]$ 中任意整数，求总重量恰为 $W$ 时的最大价值。

**朴素 DP。** $dp[w]$ 表示总消耗恰为 $w$ 时能获得的最大价值，$dp[0]=0$，其余初始化为 $-∞$。对第 $i$ 道菜：

$$new[w]=\max\Bigl(dp[w],\ \max_{w-R_i \le k \le w-L_i} dp[k]+V_i\Bigr).$$

第一项是不做这道菜，第二项是做这道菜并把消耗定为 $w-k\in[L_i,R_i]$。答案即 $dp[W]$，仍为 $-∞$ 则输出 $-1$。

**单调队列。** 直接按上式做是 $O(W\cdot (R_i-L_i+1))$，最坏 $O(NW^2)$ 不可接受。注意内层就是一个长度为 $R_i-L_i+1$ 的滑动窗口最大值：$w$ 增大 $1$ 时窗口整体右移一格。用单调队列维护「下标递增、对应 $dp$ 值递减」的候选下标，队首即窗口最大值，摊还每次 $O(1)$。

**实现细节。** 转移必须整体基于上一层（不做第 $i$ 道菜）的 $dp$，否则同一道菜会被重复选取。做法是先把 $dp$ 复制到 $old$，令 $w$ 从 $L_i$ 递增到 $W$：每步先把新进入窗口的 $k=w-L_i$ 压入队尾（弹掉所有不大于它的值），再把 $<w-R_i$ 的下标从队首弹出，然后用队首更新 $dp[w]$。为了让单调性不被破坏，未达状态（值为 $-∞$）直接不压入队列；同时所有可达价值为正，所以最后判 $dp[W]>0$ 即表示有解。累计价值最大约 $500\times10^9=5\times10^{11}$，用 64 位整数即可。

## 复杂度

每道菜的滑动窗口摊还 $O(W)$，时间 $O(NW)$，即 $5\times10^6$ 量级；需存 $dp$、$old$ 与单调队列，空间 $O(W)$。

## 仓颉实现

<details>
<summary>查看仓颉实现</summary>

```cangjie
import std.env.*
import std.convert.*

main() {
    let reader = getStdIn()
    let first = reader.readln().getOrThrow().split(" ", removeEmpty: true).map({ p: String => Int64.parse(p) })
    let W = first[0]
    let n = first[1]
    let NEG: Int64 = -4611686018427387904
    var dp = Array<Int64>(W + 1, { _ => NEG })
    dp[0] = 0
    let old = Array<Int64>(W + 1, { _ => NEG })
    let q = Array<Int64>(W + 2, { _ => 0 })
    for (_ in 0..n) {
        let t = reader.readln().getOrThrow().split(" ", removeEmpty: true).map({ p: String => Int64.parse(p) })
        let L = t[0]
        let R = t[1]
        let V = t[2]
        for (j in 0..=W) {
            old[j] = dp[j]
        }
        var head = 0
        var tail = 0
        var w = L
        while (w <= W) {
            let add = w - L
            if (old[add] > NEG) {
                let vv = old[add]
                while (tail > head && old[q[tail - 1]] <= vv) {
                    tail -= 1
                }
                q[tail] = add
                tail += 1
            }
            let lo = w - R
            while (tail > head && q[head] < lo) {
                head += 1
            }
            if (tail > head) {
                let cand = old[q[head]] + V
                if (cand > dp[w]) {
                    dp[w] = cand
                }
            }
            w += 1
        }
    }
    if (dp[W] > 0) {
        println(dp[W])
    } else {
        println(-1)
    }
}
```

</details>
