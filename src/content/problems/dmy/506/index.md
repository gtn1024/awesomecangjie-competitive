---
oj: dmy
pid: '506'
title: 卡片翻面
difficulty: 普及−
tags:
  - 线性DP
  - 贪心
timeLimit: 1s
memoryLimit: 256m
---

> 数据规模：$1 \le N \le 100$，$1 \le S \le 10^4$，$1 \le a_i, b_i \le 10^4$。

## 思路

每张卡片必须选一面，记第 $i$ 张卡片两面数字中的较小值为 $mn_i$、较大值为 $mx_i$，差值 $d_i = mx_i - mn_i$。

**把「选面」化成「翻或不翻」。** 令 $base = \sum_{i=1}^{N} mn_i$，即所有卡片都选较小值时的总和。任何一组合法方案的总和都可以写成

$$base + \sum_{i \in F} d_i,$$

其中 $F$ 是最终选了较大值（翻了面）的卡片集合。于是问题等价于：在 $d_1, \dots, d_N$ 中选一个子集，使其和恰好等于 $need = S - base$。若 $need < 0$ 或 $need > \sum d_i$，直接输出 `No`。

**后缀可达性 DP。** 记 $can[i][t]$ 表示「只用排序后的第 $i$ 到第 $N-1$ 张卡片（下标从 $0$ 开始），能否凑出和 $t$」。边界为 $can[N][0] = \text{true}$，转移为

$$can[i][t] \Rightarrow can[i+1][t + mn_i],\quad can[i][t] \Rightarrow can[i+1][t + mx_i],$$

下标超过 $S$ 的位置不必记录（凑过头的和不可能再被减回来）。$can[0][S]$ 为真即存在方案。

**正序贪心构造字典序最小的方案。** 从第 $0$ 张卡片开始逐张决定：此时前 $i$ 张已确定的和为 $cur$，剩余需要凑的和为 $R = S - cur$。先尝试选正面 `H`，若剩余卡片还能凑出 $R - mn_i$（即 $can[i+1][R - mn_i]$ 为真）就选 `H`，否则选 `T`。

**为什么这样贪心一定成功。** 维护不变量「$R$ 属于后缀卡片可达的和集合」。已知 $R$ 可由后缀凑出，取出一个合法子集：若它不含第 $i$ 张卡片，则 $R - mn_i$ 仍可由第 $i+1$ 张起的卡片凑出，选 `H` 合法；若它含第 $i$ 张卡片，则 $R - mx_i$ 可由后面的卡片凑出，选 `T` 合法。也就是说 `H` 与 `T` 至少有一个可行，贪心不会走进死路。而在每个位置都优先选 `H` 的那一组解，就是在给定卡片顺序下字典序最小的方案。

## 复杂度

时间 $O(NS)$，额外空间 $O(NS)$。

## 仓颉实现

<details>
<summary>查看仓颉实现</summary>

```cangjie
import std.env.*
import std.convert.*
import std.sort.*

main() {
    let reader = getStdIn()
    let head = reader.readln().getOrThrow().split(" ", removeEmpty: true).map({ p: String => Int64.parse(p) })
    let n = head[0]
    let s = head[1]
    let keys = Array<Int64>(n, { _ => 0 })
    for (i in 0..n) {
        let line = reader.readln().getOrThrow().split(" ", removeEmpty: true).map({ p: String => Int64.parse(p) })
        let x = line[0]
        let y = line[1]
        let p = if (x <= y) { x } else { y }
        let q = if (x <= y) { y } else { x }
        keys[i] = p * 100000 + q
    }
    sort(keys)
    let lo = Array<Int64>(n, { _ => 0 })
    let hi = Array<Int64>(n, { _ => 0 })
    for (i in 0..n) {
        lo[i] = keys[i] / 100000
        hi[i] = keys[i] % 100000
    }
    let m = s + 1
    let can = Array<Array<Bool>>(n + 1, { _ => Array<Bool>(m, { _ => false }) })
    can[n][0] = true
    var i = n - 1
    while (i >= 0) {
        for (t in 0..m) {
            if (can[i + 1][t]) {
                let p = t + lo[i]
                if (p < m) {
                    can[i][p] = true
                }
                let q = t + hi[i]
                if (q < m) {
                    can[i][q] = true
                }
            }
        }
        i -= 1
    }
    if (!can[0][s]) {
        println("No")
    } else {
        let sb = StringBuilder()
        var cur: Int64 = 0
        for (k in 0..n) {
            let rem = s - cur - lo[k]
            if (rem >= 0 && can[k + 1][rem]) {
                cur += lo[k]
                sb.append("H")
            } else {
                cur += hi[k]
                sb.append("T")
            }
        }
        println("Yes")
        println(sb.toString())
    }
}
```

</details>
