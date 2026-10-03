---
oj: dmy
pid: '179'
title: '[R29F] 好树'
difficulty: 提高
tags:
  - 树形 DP
  - 前缀和
timeLimit: 2s
memoryLimit: 512m
---

> 数据规模：$n \le 2000$，$1 \le d_i \le n$，$2 \le P \le 10^9$。

## 思路

对每个节点 $u$ 与每个可能取值 $x \in [1, n]$ 做树形 DP。记 $A_u = x$ 时：

- $f_u(x)$：$u$ 的子树内合法赋值方案数；
- $g_u(x)$：所有合法方案中，子树节点权值和的总和；
- $h_u(x)$：所有合法方案中，子树节点权值和的**平方**的总和。

三者均对 $P$ 取模。先求后序遍历，自底向上合并。节点 $u$ 固定取值 $x$ 时，初始只有 $u$ 自己的贡献：$cnt = 1$，$sum = x$，$sq = x^2$。对每个儿子 $v$，边约束 $|A_u - A_v| \le d_u + d_v$ 给出 $v$ 的可取区间 $[\max(1, x - d_u - d_v),\ \min(n, x + d_u + d_v)]$。对 $f_v, g_v, h_v$ 预处理前缀和，即可 $O(1)$ 求出区间上的：

$$C = \sum_y f_v(y),\quad S = \sum_y g_v(y),\quad Q = \sum_y h_v(y)$$

把子树 $v$ 挂到 $u$ 上时，新权和等于原权和加上子树权和，于是：

$$cnt' = cnt \cdot C,\quad sum' = sum \cdot C + cnt \cdot S,\quad sq' = sq \cdot C + 2 \cdot sum \cdot S + cnt \cdot Q$$

（$sq'$ 由 $(T + T_v)^2 = T^2 + 2TT_v + T_v^2$ 对方案逐项求和得到。）

最后答案即 $\sum_x h_{root}(x) \bmod P$，因为 $(\sum_u A_u)^2$ 恰好就是整棵树的权值和平方。

## 复杂度

每个节点对每个取值做常数次区间查询，而所有节点的儿子数之和为 $n - 1$，故总时间复杂度 $O(n^2)$，空间复杂度 $O(n^2)$，$n \le 2000$ 时完全可行。

## 仓颉实现

<details>
<summary>查看仓颉实现</summary>

```cangjie
import std.convert.*
import std.collection.*
import std.env.*

main() {
    let reader = getStdIn()
    let first = reader.readln().getOrThrow().split(" ", removeEmpty: true)
    let n = Int64.parse(first[0])
    let P = Int64.parse(first[1])

    let d = reader.readln().getOrThrow().split(" ", removeEmpty: true).map({ p: String => Int64.parse(p) })

    let adj = Array<ArrayList<Int64>>(n, { _ => ArrayList<Int64>() })
    for (_ in 0..(n - 1)) {
        let line = reader.readln().getOrThrow().split(" ", removeEmpty: true)
        let u = Int64.parse(line[0]) - 1
        let v = Int64.parse(line[1]) - 1
        adj[u].add(v)
        adj[v].add(u)
    }

    // 后序遍历顺序：先子后父
    let parent = Array<Int64>(n, { _ => -1 })
    let order = ArrayList<Int64>()
    let st = Array<Int64>(n, { _ => 0 })
    var top: Int64 = 0
    st[top] = 0
    top += 1
    while (top > 0) {
        top -= 1
        let u = st[top]
        order.add(u)
        for (v in adj[u]) {
            if (v != parent[u]) {
                parent[v] = u
                st[top] = v
                top += 1
            }
        }
    }
    let m = order.size
    let post = Array<Int64>(m, { i => order[m - 1 - i] })

    // f/g/h[u][x]：u 取值为 x 时，子树内合法方案数 / 权和 / 权和平方和（对 P 取模）
    let f = Array<Array<Int64>>(n, { _ => Array<Int64>(n + 1, { _ => 0 }) })
    let g = Array<Array<Int64>>(n, { _ => Array<Int64>(n + 1, { _ => 0 }) })
    let h = Array<Array<Int64>>(n, { _ => Array<Int64>(n + 1, { _ => 0 }) })

    var ans: Int64 = 0
    for (i in 0..m) {
        let u = post[i]
        for (x in 1..=n) {
            var cnt: Int64 = 1
            var sm: Int64 = x % P
            var sq: Int64 = (x % P) * (x % P) % P
            for (v in adj[u]) {
                if (v == parent[u]) {
                    continue
                }
                let dd = d[u] + d[v]
                var lo = x - dd
                if (lo < 1) {
                    lo = 1
                }
                var hi = x + dd
                if (hi > n) {
                    hi = n
                }
                let c = (f[v][hi] - f[v][lo - 1] + P) % P
                let s = (g[v][hi] - g[v][lo - 1] + P) % P
                let q = (h[v][hi] - h[v][lo - 1] + P) % P
                let nc = cnt * c % P
                let ns = (sm * c + cnt * s) % P
                let nq = (sq * c + (2 * sm % P) * s + cnt * q) % P
                cnt = nc
                sm = ns
                sq = nq
            }
            f[u][x] = cnt
            g[u][x] = sm
            h[u][x] = sq
            if (u == 0) {
                ans = (ans + sq) % P
            }
        }
        // 原地转前缀和，供父节点区间查询
        for (t in 1..=n) {
            f[u][t] = (f[u][t] + f[u][t - 1]) % P
            g[u][t] = (g[u][t] + g[u][t - 1]) % P
            h[u][t] = (h[u][t] + h[u][t - 1]) % P
        }
    }

    println(ans)
}
```

</details>
