---
oj: dmy
pid: '213'
title: '[R35D]合并数组'
difficulty: 提高
tags:
  - 动态规划
timeLimit: 1s
memoryLimit: 512m
---

> 对于 $40\%$ 的数据，$1 \leq n, m \leq 10$。
>
> 对于 $100\%$ 的数据，$1 \leq n, m \leq 2000$，$1 \leq a_i, b_i, c_i \leq 10^6$。

## 思路

合并后 $d$ 的每个位置 $i+j$ 处，要么放 $a$ 的下一个元素，要么放 $b$ 的下一个元素，且各自内部相对顺序不变。这正是经典的「双串合并」DP。

设 $\text{dp}[i][j]$ 表示使用 $a$ 的前 $i$ 个元素、$b$ 的前 $j$ 个元素合并成 $d$ 的前 $i+j$ 个元素时，能获得的最大价值。最终答案为 $\text{dp}[n][m]$。

对于状态 $\text{dp}[i][j]$，第 $i+j$ 个位置（下标 $i+j-1$）来自两种可能：

- 来自 $a$ 的第 $i$ 个元素：$\text{dp}[i][j] = \text{dp}[i-1][j] + a_i \times c_{i+j}$
- 来自 $b$ 的第 $j$ 个元素：$\text{dp}[i][j] = \text{dp}[i][j-1] + b_j \times c_{i+j}$

取两者最大值。边界为 $\text{dp}[0][0] = 0$，以及 $\text{dp}[i][0]$（全部来自 $a$）、$\text{dp}[0][j]$（全部来自 $b$）按相同方式递推。

由于每个元素 $a_i, b_i, c_i \geq 1$，转移是正向累加，不会出现负贡献，无需担心状态不可达。

## 复杂度

- 时间复杂度：$O(nm)$，状态数 $(n+1)(m+1)$，每个状态 $O(1)$ 转移。
- 空间复杂度：$O(nm)$，用于存放二维 DP 表。$n, m \leq 2000$ 时约 $4 \times 10^6$ 个 Int64，可接受。

## 仓颉实现

```cangjie
import std.env.*
import std.convert.*

main(): Int64 {
    let reader = getStdIn()
    let line1 = reader.readln().getOrThrow().split(" ", removeEmpty: true)
    let n = Int64.parse(line1[0])
    let m = Int64.parse(line1[1])

    let a = reader.readln().getOrThrow().split(" ", removeEmpty: true).map({ p: String => Int64.parse(p) })
    let b = reader.readln().getOrThrow().split(" ", removeEmpty: true).map({ p: String => Int64.parse(p) })
    let c = reader.readln().getOrThrow().split(" ", removeEmpty: true).map({ p: String => Int64.parse(p) })

    let nn = n
    let mm = m

    // dp[i][j] = max value using a[0..i), b[0..j) merged into d[0..i+j)
    // 所有元素 a,b,c >= 1，所以 i,j 都 >= 1 时一定可达（至少全用 a 或全用 b 路径）。
    // 初始化 0 即可，因为每一步都加上正贡献，dp 单调；用 -1 哨兵标记不可达也可，但这里转移会从边界填满。
    let NEG: Int64 = -1000000000000000
    var dp = Array<Array<Int64>>(nn + 1, { _ =>
        Array<Int64>(mm + 1, { _ => NEG })
    })

    dp[0][0] = 0
    var i = 1
    while (i <= nn) {
        dp[i][0] = dp[i - 1][0] + a[i - 1] * c[i - 1]
        i = i + 1
    }
    var j = 1
    while (j <= mm) {
        dp[0][j] = dp[0][j - 1] + b[j - 1] * c[j - 1]
        j = j + 1
    }
    i = 1
    while (i <= nn) {
        j = 1
        while (j <= mm) {
            let pos = i + j - 1
            let v1 = dp[i - 1][j] + a[i - 1] * c[pos]
            let v2 = dp[i][j - 1] + b[j - 1] * c[pos]
            var best = v1
            if (v2 > best) {
                best = v2
            }
            dp[i][j] = best
            j = j + 1
        }
        i = i + 1
    }

    println(dp[nn][mm])
    return 0
}
```
