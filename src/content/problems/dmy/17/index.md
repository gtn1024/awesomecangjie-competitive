---
oj: dmy
pid: '17'
title: '[R3E] 学习计划'
difficulty: 提高
tags:
  - 动态规划
  - 树形 DP
timeLimit: 1s
memoryLimit: 512m
---

> 数据规模：$1 \le m \le n \le 5000$，$1 \le a_i \le 10^9$，$0 \le p_i < i$。

## 思路

前置关系构成一棵树（$p_i=0$ 的节点直接挂在虚根 $0$ 下），「学 $i$ 必须先学 $p_i$」意味着选了子树中任意节点就必须选它的祖先。

树形背包：$dp[x][j]$ 表示以 $x$ 为根的子树中 **恰好选 $j$ 个节点**（$x$ 必选）的最大价值和，边界 $dp[x][1] = a_x$。合并子节点 $y$ 时做 01 背包：

$$dp[x][s+b] = \max(dp[x][s+b],\ dp[x][s] + dp[y][b])$$

$s$ 从大到小枚举避免同一子树被重复使用。答案即 $dp[0][m+1]$（虚根计一个）。

由于 $p_i < i$，父节点编号总小于子节点，按编号从 $n$ 到 $0$ 逆序处理即可保证子树先合并完毕，无需递归。

复杂度：时间 $O(n^2)$（子树大小合并），空间 $O(nm)$。

## 仓颉实现

<details>
<summary>查看仓颉实现</summary>

```cangjie
import std.env.*
import std.convert.*
import std.collection.*

main() {
    let reader = getStdIn()
    let nm = reader.readln().getOrThrow().split(" ", removeEmpty: true).map({ p => Int64.parse(p) })
    let n = nm[0]
    let m = nm[1]
    let nn = n
    let mm = m
    // 价值（下标 0 为虚根）
    var a = Array<Int64>(nn + 1, { _ => 0 })
    let av = reader.readln().getOrThrow().split(" ", removeEmpty: true).map({ p => Int64.parse(p) })
    for (i in 1..=nn) {
        a[i] = av[i - 1]
    }
    // 前置 p_i，建子节点表
    var children = Array<ArrayList<Int64>>(nn + 1, { _ => ArrayList<Int64>() })
    let pv = reader.readln().getOrThrow().split(" ", removeEmpty: true).map({ p => Int64.parse(p) })
    for (i in 1..=nn) {
        children[pv[i - 1]].add(i)
    }
    // dp[i][j]：以 i 为根的子树（已合并部分）选 j 个知识点的最大价值
    let w = mm + 2
    var dp = Array<Array<Int64>>(nn + 1, { _ => Array<Int64>(w, { _ => -1 }) })
    for (i in 0..=nn) {
        dp[i][1] = a[i]
    }
    var siz = Array<Int64>(nn + 1, { _ => 1 })
    var x = nn
    while (x >= 0) {
        let kids = children[x]
        var i: Int64 = 0
        while (i < kids.size) {
            let y = kids[i]
            // 合并子树 y 到 x（01 背包，从大到小）
            let sy = siz[y]
            var s = siz[x]
            if (s >= w) {
                s = w - 1
            }
            while (s >= 1) {
                if (dp[x][s] >= 0) {
                    let bmax = if (sy < w) { sy } else { w - 1 }
                    for (b in 1..=bmax) {
                        if (dp[y][b] < 0) {
                            continue
                        }
                        let ns = s + b
                        if (ns >= w) {
                            break
                        }
                        let nd = dp[x][s] + dp[y][b]
                        if (nd > dp[x][ns]) {
                            dp[x][ns] = nd
                        }
                    }
                }
                s -= 1
            }
            siz[x] += sy
            i += 1
        }
        x -= 1
    }
    println(dp[0][mm + 1])
}
```

</details>

要点：

- `dp` 第二维只需到 $m+1$，合并时 $s$ 与 $b$ 的上界都要截到该范围，防止下标越界。
- 价值可达 $5 \times 10^{12}$，用 `Int64`；不可行状态用 $-1$ 标记。
- 由于 $p_i < i$，逆序编号处理天然满足「子节点先于父节点」的后序顺序，避免递归。
