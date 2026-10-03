---
oj: dmy
pid: '107'
title: '[R18E]重新粉刷'
difficulty: 提高
tags:
  - 动态规划
timeLimit: 1.5s
memoryLimit: 512m
---

> 对于 $100\%$ 的数据，$1\leq n\leq 3000$，$1\leq a_i\leq n$。

## 思路

先考察最优解中被粉刷的墙壁颜色有什么限制。

**引理**：一定存在一个最优解，使得每块被粉刷的墙壁颜色都属于 $\{1,2,3\}$。

证明：假设某块墙壁 $i$ 被粉刷成了颜色 $x\geq 4$。设它左右邻居的最终颜色分别为 $u,v$（没有邻居则忽略该约束），取 $y$ 为不等于 $u,v$ 的最小正整数，则 $y\in\{1,2,3\}$ 且 $y<x$。把墙壁 $i$ 的颜色从 $x$ 改为 $y$：

- 花费从 $a_i+x$ 降为 $a_i+y$，严格减少；
- 墙壁 $i$ 与左右邻居的颜色关系：原本不同的仍然不同，原本相同的会变成不同，因此「相邻颜色不同」的对数不减。

这与最优性矛盾。故结论成立。

于是每块墙壁的最终颜色至多有 4 种选择：保留原色 $a_i$（花费 0），或粉刷成颜色 1、2、3（花费分别为 $a_i+1$、$a_i+2$、$a_i+3$）。若该颜色恰等于 $a_i$，粉刷与保留等价，只保留花费为 0 的那一项即可。

**动态规划**：设 $dp[i][j][c]$ 表示前 $i$ 块墙壁中恰好有 $j$ 对相邻墙壁颜色不同，且第 $i$ 块墙壁的最终颜色为 $c$ 的最小花费。对第 $i+1$ 块枚举其颜色 $c'$：

- 若 $c=c'$：相邻颜色相同，$j$ 不变；
- 若 $c\ne c'$：相邻颜色不同，$j$ 加一。

转移代价为第 $i+1$ 块取颜色 $c'$ 的粉刷花费（保留为 0）。每块墙壁的颜色候选至多 4 个，对每个 $j$ 维护「颜色不同」前两优（最小花费及其颜色、颜色不同的次小花费），就能对每个 $c'$ 在 O(1) 内得到「上一块颜色不等于 $c'$ 的最小花费」。

题目要求**至少** $k$ 对相邻不同：对「恰好 $j$ 对」的结果做后缀最小值，即 $\text{ans}_k=\min_{j\geq k}dp[n][j][\cdot]$。

## 复杂度

- 时间：$O(n^2)$（状态数为 $\sum_{i=1}^{n}i$，每个状态至多 4 种颜色、O(1) 转移）。
- 空间：$O(n)$（滚动数组，每层 $n\times 4$）。

## 仓颉实现

<details>
<summary>查看仓颉实现</summary>

```cangjie
import std.convert.*
import std.env.*

main(): Int64 {
    let reader = getStdIn()
    let n = Int64.parse(reader.readln().getOrThrow())
    let a = reader.readln().getOrThrow().split(" ", removeEmpty: true).map({ p: String => Int64.parse(p) })
    if (n <= 1) {
        println("")
        return 0
    }
    let INF: Int64 = 1000000000000000000

    // 每个位置至多 4 个槽位：粉刷颜色 1、2、3（若等于 a[i] 则合并到保留）与保留色 a[i]
    // cv[i][s] 槽位颜色值，pc[i][s] 粉刷代价（保留为 0），cnt[i] 槽位数
    var cv = Array<Array<Int64>>(n, { _ => Array<Int64>(4, { _ => 0 }) })
    var pc = Array<Array<Int64>>(n, { _ => Array<Int64>(4, { _ => INF }) })
    var cnt = Array<Int64>(n, { _ => 0 })
    var i: Int64 = 0
    while (i < n) {
        let ai = a[i]
        var t: Int64 = 0
        var c: Int64 = 1
        while (c <= 3) {
            if (c != ai) {
                cv[i][t] = c
                pc[i][t] = ai + c
                t += 1
            }
            c += 1
        }
        cv[i][t] = ai
        pc[i][t] = 0
        cnt[i] = t + 1
        i += 1
    }

    // 预处理 sameIdx[pos][s2]：位置 pos-1 中颜色与 pos 槽位 s2 相同的槽位下标，无则 -1
    var sameIdx = Array<Array<Int64>>(n, { _ => Array<Int64>(4, { _ => -1 }) })
    var pos: Int64 = 1
    while (pos < n) {
        var s2: Int64 = 0
        while (s2 < cnt[pos]) {
            let c2 = cv[pos][s2]
            var s1: Int64 = 0
            while (s1 < cnt[pos - 1]) {
                if (cv[pos - 1][s1] == c2) {
                    sameIdx[pos][s2] = s1
                }
                s1 += 1
            }
            s2 += 1
        }
        pos += 1
    }

    // cur[j][s]：前 pos 块、j 对相邻不同、最后一块颜色为槽位 s 的最小代价
    var cur = Array<Array<Int64>>(n, { _ => Array<Int64>(4, { _ => INF }) })
    var s: Int64 = 0
    while (s < cnt[0]) {
        cur[0][s] = pc[0][s]
        s += 1
    }
    pos = 1
    while (pos < n) {
        let nxt = Array<Array<Int64>>(n, { _ => Array<Int64>(4, { _ => INF }) })
        let cOld = cnt[pos - 1]
        let cNew = cnt[pos]
        var j: Int64 = 0
        while (j < pos) {
            // 源槽位的前二优（代价最小与颜色不同次小）
            var b1: Int64 = INF
            var b1c: Int64 = -1
            var b2: Int64 = INF
            var s1: Int64 = 0
            while (s1 < cOld) {
                let v = cur[j][s1]
                if (v < b1) {
                    if (b1 < INF) {
                        b2 = b1
                    }
                    b1 = v
                    b1c = cv[pos - 1][s1]
                } else if (v < b2 && cv[pos - 1][s1] != b1c) {
                    b2 = v
                }
                s1 += 1
            }
            var s2: Int64 = 0
            while (s2 < cNew) {
                let c2 = cv[pos][s2]
                let p2 = pc[pos][s2]
                // 颜色不同：j+1
                let best = if (c2 != b1c) { b1 } else { b2 }
                if (best < INF) {
                    let v = best + p2
                    if (v < nxt[j + 1][s2]) {
                        nxt[j + 1][s2] = v
                    }
                }
                // 颜色相同：j 不变
                let si = sameIdx[pos][s2]
                if (si >= 0) {
                    let v = cur[j][si] + p2
                    if (v < nxt[j][s2]) {
                        nxt[j][s2] = v
                    }
                }
                s2 += 1
            }
            j += 1
        }
        cur = nxt
        pos += 1
    }

    // exact[j]：恰好 j 对不同相邻的最小代价
    var exact = Array<Int64>(n, { _ => INF })
    var j: Int64 = 0
    while (j < n) {
        var best: Int64 = INF
        var s: Int64 = 0
        while (s < cnt[n - 1]) {
            if (cur[j][s] < best) {
                best = cur[j][s]
            }
            s += 1
        }
        exact[j] = best
        j += 1
    }
    // 后缀最小：ans[k] = min_{j>=k} exact[j]（至少 k 对）
    var suff = Array<Int64>(n, { _ => INF })
    var bestSoFar: Int64 = INF
    j = n - 1
    while (j >= 1) {
        if (exact[j] < bestSoFar) {
            bestSoFar = exact[j]
        }
        suff[j] = bestSoFar
        j -= 1
    }
    var k: Int64 = 1
    while (k <= n - 1) {
        if (k > 1) {
            print(" ")
        }
        print(suff[k])
        k += 1
    }
    println()
    return 0
}
```

</details>
