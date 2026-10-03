---
oj: dmy
pid: '233'
title: '[R38E] 乘积背包'
difficulty: 提高
tags:
  - 动态规划
  - 背包
timeLimit: 1s
memoryLimit: 512m
---

> 数据规模：$n \le 2000$，$X \le 10^9$，$1 \le w_i \le X$，$1 \le v_i \le 2000$。

## 思路

背包占用体积是所选物品体积的**乘积**而非求和，这是本题的核心。

先看两个关键观察：

1. **体积为 $1$ 的物品全部必选**：乘以 $1$ 不改变占用体积，而价值 $v_i \ge 1$ 非负，多选只会增加价值，不会违反容量限制。
2. **体积 $\ge 2$ 的物品最多选 $\lfloor \log_2 X \rfloor$ 个**：每选一个，乘积至少翻倍；由于 $X \le 10^9 < 2^{30}$，最多只能选 $29$ 个，价值总和不超过 $29 \times 2000 = 58000$。

于是价值维很小，可以对**价值**做背包：设 $dp[v]$ 为「恰好获得价值 $v$ 所需的最小体积乘积」，不可达记为无穷大，初始 $dp[0] = 1$。对每个体积 $\ge 2$ 的物品 $(w_i, v_i)$，倒序枚举价值 $v$（保证每个物品只用一次），若 $dp[v] \cdot w_i \le X$，则用它更新 $dp[v + v_i]$。转移与 0/1 背包完全相同，只是「容量」维度换成了乘积。

最终答案等于「体积为 $1$ 的物品价值之和」加上「满足 $dp[v] \le X$ 的最大 $v$」。

关于溢出：更新前先保证 $dp[v] \le X$ 才做乘法，此时 $dp[v] \le X \le 10^9$ 且 $w_i \le X \le 10^9$，乘积不超过 $10^{18}$，在 Int64 范围内，安全。

## 复杂度

时间 $O(n \cdot V)$，其中 $V = \min(29 \times 2000, \sum v_i)$ 为价值上界；空间 $O(V)$。

## 仓颉实现

<details>
<summary>查看仓颉实现</summary>

```cangjie
import std.env.*
import std.convert.*
import std.collection.*

main() {
    let reader = getStdIn()
    let first = reader.readln().getOrThrow().split(" ", removeEmpty: true).map({ p: String => Int64.parse(p) })
    let n = first[0]
    let X = first[1]

    // w == 1 的物品价值非负且不增加体积，全部必选
    var base: Int64 = 0
    var items = ArrayList<(Int64, Int64)>()
    var sumV: Int64 = 0
    for (_ in 0..n) {
        let line = reader.readln().getOrThrow().split(" ", removeEmpty: true).map({ p: String => Int64.parse(p) })
        let w = line[0]
        let v = line[1]
        if (w == 1) {
            base += v
        } else {
            items.add((w, v))
            sumV += v
        }
    }

    // 体积 >= 2 的物品最多选 floor(log2 X) 个，故价值上界 = 2000 * maxCnt
    var maxCnt: Int64 = 0
    var pw: Int64 = 1
    while (pw <= X / 2) {
        maxCnt += 1
        pw *= 2
    }
    var VMAX = maxCnt * 2000
    if (sumV < VMAX) {
        VMAX = sumV
    }

    // dp[v] = 达到价值 v 所需的最小体积乘积，INF 表示不可达
    let INF = X + 1
    let dp = Array<Int64>(VMAX + 1, { _ => INF })
    dp[0] = 1
    var reach: Int64 = 0
    for (it in items) {
        let ww = it[0]
        let vv = it[1]
        var v = reach
        while (v >= 0) {
            let cur = dp[v]
            if (cur <= X) {
                let nd = cur * ww
                if (nd <= X) {
                    let nv = v + vv
                    if (nv <= VMAX && nd < dp[nv]) {
                        dp[nv] = nd
                    }
                }
            }
            v -= 1
        }
        reach += vv
        if (reach > VMAX) {
            reach = VMAX
        }
    }

    var best: Int64 = 0
    var v = 0
    while (v <= reach) {
        if (dp[v] <= X && v > best) {
            best = v
        }
        v += 1
    }

    print("${base + best}")
}
```

</details>
