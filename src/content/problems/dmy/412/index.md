---
oj: dmy
pid: '412'
title: '[R66D] 刷题计划'
difficulty: 普及/提高-
tags:
  - 动态规划
timeLimit: 1s
memoryLimit: 512m
---

> 数据规模：$1 \le n \le 2000$，$0 \le m \le \lceil \dfrac{n}{2} \rceil$，$1 \le a_i, b_i \le 10^9$。

## 思路

**关键难点**是第三条原则：相邻两道题目的专题不同，而这两道题**不要求在相邻两天**（比如第 1 天和第 3 天刷套路题、第 2 天玩游戏是违规的）。因此只记录「前一天做了什么」是不够的，需要同时记录两件事：

- 最近一次刷题的专题；
- 前一天是否在玩游戏。

设 $dp_{i,j,t,g}$ 表示安排完前 $i$ 天、恰好玩了 $j$ 天游戏时的最大收益，其中：

- $t \in \{0,1,2\}$：最近一次刷题的专题，$0$ 表示套路题，$1$ 表示思维题，$2$ 表示还没刷过题；
- $g \in \{0,1\}$：前一天是否在玩游戏。

初始只有 $dp_{0,0,2,0} = 0$，其余状态为负无穷。考虑第 $i+1$ 天（收益为 $a_{i+1}, b_{i+1}$），从每个合法状态转移：

1. **玩游戏**：仅当前一天没有玩游戏（$g=0$）时才可选，最近刷题专题 $t$ 保持不变：$dp_{i+1,j+1,t,1} \leftarrow dp_{i,j,t,0}$；
2. **刷套路题**：仅当 $t \ne 0$ 时才可选：$dp_{i+1,j,0,0} \leftarrow dp_{i,j,t,g} + a_{i+1}$；
3. **刷思维题**：仅当 $t \ne 1$ 时才可选：$dp_{i+1,j,1,0} \leftarrow dp_{i,j,t,g} + b_{i+1}$。

处理完 $n$ 天后，在所有的 $dp_{n,m,t,g}$ 中取最大值即可。

复杂度：时间 $O(nm)$，空间 $O(nm)$；实现时把「天数」这一维滚掉，空间降到 $O(m)$。

## 仓颉实现

<details>
<summary>查看仓颉实现</summary>

```cangjie
import std.env.*
import std.convert.*

main() {
    let reader = getStdIn()
    let line = reader.readln().getOrThrow().split(" ", removeEmpty: true).map({ p: String => Int64.parse(p) })
    let n = line[0]
    let m = line[1]
    let INF = Int64.Min / 4
    let stateCount = (m + 1) * 6
    var cur = Array<Int64>(stateCount, { _ => INF })
    var nxt = Array<Int64>(stateCount, { _ => INF })
    // dp[j][t][g]：已安排若干天、恰好玩 j 天游戏，t=最近一次刷题专题（0 套路 / 1 思维 / 2 未刷过），g=前一天是否玩游戏
    cur[0 * 6 + 2 * 2 + 0] = 0
    for (i in 0..n) {
        let l = reader.readln().getOrThrow().split(" ", removeEmpty: true).map({ p: String => Int64.parse(p) })
        let a = l[0]
        let b = l[1]
        for (k in 0..stateCount) {
            nxt[k] = INF
        }
        for (j in 0..m + 1) {
            let jj = j * 6
            for (t in 0..3) {
                let base = jj + t * 2
                for (g in 0..2) {
                    let v = cur[base + g]
                    if (v == INF) {
                        continue
                    }
                    // 玩游戏：前一天没有玩游戏才能玩
                    if (g == 0 && j < m) {
                        let to = (j + 1) * 6 + t * 2 + 1
                        if (v > nxt[to]) {
                            nxt[to] = v
                        }
                    }
                    // 刷套路题：最近一次刷题不是套路题
                    if (t != 0) {
                        let to = jj + 0 * 2 + 0
                        let nv = v + a
                        if (nv > nxt[to]) {
                            nxt[to] = nv
                        }
                    }
                    // 刷思维题：最近一次刷题不是思维题
                    if (t != 1) {
                        let to = jj + 1 * 2 + 0
                        let nv = v + b
                        if (nv > nxt[to]) {
                            nxt[to] = nv
                        }
                    }
                }
            }
        }
        let tmp = cur
        cur = nxt
        nxt = tmp
    }
    var ans = INF
    let base = m * 6
    for (t in 0..3) {
        for (g in 0..2) {
            if (cur[base + t * 2 + g] > ans) {
                ans = cur[base + t * 2 + g]
            }
        }
    }
    println(ans)
}
```

</details>

## 要点

- 状态必须同时含「最近一次刷题专题」与「前一天是否玩游戏」两个维度：前者保证刷题序列交替，后者保证游戏不连续，二者缺一不可。
- 滚动数组按 `j * 6 + t * 2 + g` 平铺成一维下标，避免多维数组的分配开销；收益最大约 $2 \times 10^{12}$，需要使用 `Int64`。
- 注意 `for (j in 0..m + 1)` 的边界：`m = 0` 时 `0..0` 是空区间，会漏掉唯一合法的 $j=0$ 层。
