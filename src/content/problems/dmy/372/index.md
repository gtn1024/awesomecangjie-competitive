---
oj: dmy
pid: '372'
title: '[R59G] 拓扑排序'
difficulty: 普及+/提高
tags:
  - 树形 DP
  - 数学
timeLimit: 1s
memoryLimit: 512m
---

> 数据规模：$2 \le n \le 5000$，$1 \le f_i < i$。

## 思路

**拓扑序计数公式。** 对一棵有根树，设 $sz_v$ 为节点 $v$ 的子树大小，则整棵树的拓扑序数量为

$$
\frac{n!}{\prod_v sz_v}
$$

理由：在随机排列中，$v$ 恰好排在其子树所有节点最前面的概率为 $1 / sz_v$，且这些事件相互独立。对森林（若干棵树），把各连通块的拓扑序与块间位置的组合相乘，同样得到 $n! / \prod_v sz_v$。

因此答案为

$$
\sum_S F(T_S) = n! \cdot \sum_S \prod_v \mathrm{inv}(sz_v(S)) \bmod 998244353
$$

其中 $sz_v(S)$ 是方案 $S$ 下 $v$ 在其连通块内的子树大小。注意 $sz_v$ 只依赖于 $v$ 的子树内部的边，所以可以自底向上树形 DP。

**树形背包。** 设 $dp[v][k]$ 为：只考虑子树 $v$ 内部的边的全部方案中，满足 $sz_v = k$ 的方案的 $\prod_{u \in sub(v) \setminus \{v\}} \mathrm{inv}(sz_u)$ 之和。把 $v$ 自身的因子 $\mathrm{inv}(sz_v)$ 留到最后再乘，可以避免转移时把因子 $\mathrm{inv}(i)$ 换成 $\mathrm{inv}(i + j)$ 的麻烦。

初始 $dp[v][1] = 1$。合并儿子 $c$ 时，记 $g_c = \sum_j dp[c][j] \cdot \mathrm{inv}(j)$：

- **删边** $(v, c)$：$sz_v$ 不变，子树 $c$ 的所有贡献整体乘上 $g_c$；
- **保边** $(v, c)$：$sz_v$ 累加 $j$，同时补上 $c$ 自身的因子 $\mathrm{inv}(j)$，即做卷积 $dp'[k + j] += dp[v][k] \cdot dp[c][j] \cdot \mathrm{inv}(j)$。

所有儿子合并完后，$dp[v]$ 即完整。最后 $f_1 = \sum_k dp[1][k] \cdot \mathrm{inv}(k)$，答案为 $n! \cdot f_1$。

由于 $f_i < i$，节点编号从大到小处理即是自底向上的顺序；处理到 $v$ 时其所有儿子（编号更大）的 $dp$ 都已并入 $v$ 父亲的累计数组，合并完成后立即释放儿子数组，空间保持 $O(n)$。

## 复杂度

时间 $O(n^2)$（合并卷积总规模为树上背包的上界），空间 $O(n)$。

## 仓颉实现

```cangjie
import std.env.*
import std.convert.*

const MOD: Int64 = 998244353

func power(a: Int64, b: Int64): Int64 {
    var res: Int64 = 1
    var base = a % MOD
    var e = b
    while (e > 0) {
        if (e % 2 == 1) {
            res = res * base % MOD
        }
        base = base * base % MOD
        e = e / 2
    }
    return res
}

main(): Int64 {
    let reader = getStdIn()
    let n = Int64.parse(reader.readln().getOrThrow().split(" ", removeEmpty: true)[0])
    let nn = n
    let f = reader.readln().getOrThrow().split(" ", removeEmpty: true).map({ p: String => Int64.parse(p) })

    // 逆元 inv[1..n]
    let inv = Array<Int64>(nn + 1, { _ => 0 })
    for (i in 1..nn + 1) {
        inv[i] = power(i, MOD - 2)
    }

    // acc[v][k]：子树 v 内的边的方案中，sz_v = k 的方案的
    // ∏_{u ∈ sub(v) \ {v}} inv(sz_u) 之和；acc[v][0] 不使用
    let acc = Array<Array<Int64>>(nn + 1, { _ => Array<Int64>(2, { _ => 0 }) })
    for (i in 1..nn + 1) {
        acc[i][1] = 1
    }

    // f_i < i，编号从大到小处理，处理到 v 时其所有儿子（编号更大）已并入
    var i = nn
    while (i >= 1) {
        let cur = acc[i]
        if (i >= 2) {
            // g = Σ_j acc[i][j] * inv(j)，删边分支的整体因子
            var g: Int64 = 0
            for (j in 1..cur.size) {
                g = (g + cur[j] * inv[j]) % MOD
            }
            let parent = f[i - 2]
            let old = acc[parent]
            let oldSz = old.size - 1
            let curSz = cur.size - 1
            let ndp = Array<Int64>(oldSz + curSz + 1, { _ => 0 })
            // 删边 (parent, i)：sz 不变，乘 g
            for (k in 1..old.size) {
                ndp[k] = old[k] * g % MOD
            }
            // 保边 (parent, i)：sz 累加 j，且补上 inv(j) 因子
            for (k in 1..old.size) {
                for (j in 1..cur.size) {
                    ndp[k + j] = (ndp[k + j] + old[k] * cur[j] % MOD * inv[j]) % MOD
                }
            }
            acc[parent] = ndp
            acc[i] = Array<Int64>(2, { _ => 0 })
        }
        i -= 1
    }

    // f1 = Σ_k acc[1][k] * inv(k)，答案 = n! * f1
    var f1: Int64 = 0
    let root = acc[1]
    for (k in 1..root.size) {
        f1 = (f1 + root[k] * inv[k]) % MOD
    }
    var fact: Int64 = 1
    for (x in 2..nn + 1) {
        fact = fact * x % MOD
    }
    println(fact * f1 % MOD)
    return 0
}
```

要点：

- $dp$ 定义中不含 $v$ 自身的 $\mathrm{inv}(sz_v)$ 因子，根节点汇总时再统一乘上，转移更简洁。
- 保边合并是卷积，所有合并的总规模为 $O(n^2)$，$n = 5000$ 时可轻松通过。
