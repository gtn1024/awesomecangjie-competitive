---
oj: dmy
pid: '96'
title: '[R16F] 知识点学习3'
difficulty: 提高
tags:
  - 树
  - 拓扑排序计数
  - 树状数组
  - 逆元
  - 字典序计数
timeLimit: 1s
memoryLimit: 512m
---

> 数据规模：$1 \le n \le 4 \times 10^5$，$0 \le p_i < i$，$1 \le A_i \le n$，保证 $A$ 是一个合法的学习方案。答案对 $998244353$ 取模。

## 思路

前置关系构成以 $0$ 为虚拟根的森林（$p_i$ 是 $i$ 的父节点）。合法学习方案就是这棵森林的拓扑序。本题求的是 **字典序严格小于给定方案 $A$** 的合法拓扑序个数，是 [知识点学习2](../59/index.md) 的进阶版。

**树形拓扑序计数。** 设 $sz[u]$ 为 $u$ 的子树大小。单棵以 $u$ 为根的子树，其拓扑序数为

$$dp[u] = \frac{(sz[u] - 1)!}{\prod_{c} sz[c]!} \prod_{c} dp[c],$$

其中 $c$ 取遍 $u$ 的儿子。这是因为 $u$ 必须排在子树首位，剩下 $sz[u]-1$ 个位置由各儿子子树任意交织，方案数为多重排列数 $\frac{(sz[u]-1)!}{\prod sz[c]!}$，再乘上各子树内部的方案数。由于 $p_i < i$，儿子下标恒大于父亲，只需从 $n$ 到 $1$ 倒序处理即可累出所有 $sz$ 和 $dp$，无需递归或显式建树遍历。

**字典序拆点。** 按字典序计数的经典做法是枚举“首次变小”的位置。维护当前可立即学习的节点集合 $S$（即尚未排完的森林的所有树根），初始 $S$ 为 $p_i=0$ 的所有节点。逐位 $i=1,2,\dots,n$ 处理：前 $i-1$ 位严格跟随 $A$，在第 $i$ 位选一个 **属于 $S$ 且编号小于 $A_i$** 的节点 $v$，此后剩余 $n-i$ 个位置随意排，对应方案全部计入答案。

关键在于计算“第 $i$ 位选了某个 $v \in S$ 后剩余位置的总方案数”。定义

$$base = \frac{(n - i + 1)!}{\prod_{r \in S} sz[r]!} \prod_{r \in S} dp[r],$$

即把 $S$ 中所有子树混合排列的总方案数。若强制第 $i$ 位选 $v$，则 $v$ 作为树根的限制被剥离，它的儿子升格为新的根，剩余森林的根集合变为 $(S \setminus \{v\}) \cup \text{children}(v)$。把这一步的方案数展开并利用 $dp[v]$ 的定义反复化简（分子分母配凑 $sz[v]!$ 与 $\prod sz[c]!$），最终得到极为简洁的结果：

$$\text{第 } i \text{ 位选 } v \text{ 的方案数} = \frac{base}{n - i + 1} \times sz[v].$$

于是第 $i$ 位贡献的总方案数为

$$\frac{base}{n - i + 1} \times \sum_{\substack{v \in S \\ v < A_i}} sz[v].$$

**维护。** 用树状数组按下标存 $sz[v]$：节点加入 $S$ 时在对应位置加 $sz[v]$，离开时减 $sz[v]$，于是 $\sum_{v < A_i} sz[v]$ 是一次前缀查询。而 $base$ 在“跟随 $A$ 选定 $A_i$”时的递推为

$$base \leftarrow base \times sz[A_i] \times (n - i + 1)^{-1} \pmod{MOD}$$

（把 $A_i$ 从根集合剥离，剩余位置数减一）。除法用线性预处理 $1 \sim n$ 的逆元即可 $O(1)$ 完成。

总复杂度 $O(n \log n)$。

## 仓颉实现

<details>
<summary>查看仓颉实现</summary>

```cangjie
import std.convert.*
import std.env.*
import std.collection.*

let MOD: Int64 = 998244353

func powMod(base: Int64, exp: Int64): Int64 {
    var b = base % MOD
    var e = exp
    var r: Int64 = 1
    while (e > 0) {
        if ((e & 1) == 1) {
            r = r * b % MOD
        }
        b = b * b % MOD
        e = e >> 1
    }
    return r
}

main(): Int64 {
    let reader = getStdIn()
    let n = Int64.parse(reader.readln().getOrThrow())
    let p = reader.readln().getOrThrow().split(" ", removeEmpty: true).map({ x => Int64.parse(x) })
    let A = reader.readln().getOrThrow().split(" ", removeEmpty: true).map({ x => Int64.parse(x) })

    // children of each node (1-indexed); p_i in [0,n-1], 0 = virtual root
    let children = Array<ArrayList<Int64>>(n + 1, { _ => ArrayList<Int64>() })
    var i = 1
    while (i <= n) {
        children[p[i - 1]].add(i)
        i += 1
    }

    // factorials
    let fact = Array<Int64>(n + 1, { _ => 1 })
    var k = 2
    while (k <= n) {
        fact[k] = fact[k - 1] * k % MOD
        k += 1
    }

    // dp[u], sz[u], denom[u] (product of fact[sz[c]] over children c).
    // Since p_i < i, children have larger index than parent: process u = n..1.
    let sz = Array<Int64>(n + 1, { _ => 1 })
    let dp = Array<Int64>(n + 1, { _ => 1 })
    let denom = Array<Int64>(n + 1, { _ => 1 })
    var u = n
    while (u >= 1) {
        dp[u] = dp[u] * fact[sz[u] - 1] % MOD * powMod(denom[u], MOD - 2) % MOD
        let par = p[u - 1]
        if (par != 0) {
            sz[par] += sz[u]
            dp[par] = dp[par] * dp[u] % MOD
            denom[par] = denom[par] * fact[sz[u]] % MOD
        }
        u -= 1
    }

    // Linear inverse table for 1..n (used to divide by `remain` = n-pos in [1,n]).
    let invTab = Array<Int64>(n + 1, { _ => 0 })
    invTab[1] = 1
    var j = 2
    while (j <= n) {
        let jj = j
        invTab[jj] = (MOD - (MOD / jj)) * invTab[MOD % jj] % MOD
        j += 1
    }

    // BIT over node indices 1..n storing sz[v] of currently-available roots.
    let bit = Array<Int64>(n + 2, { _ => 0 })
    func bitUpdate(idx0: Int64, val: Int64) {
        var idx = idx0
        while (idx <= n) {
            bit[idx] += val
            idx += idx & (-idx)
        }
    }
    func bitQuery(idx0: Int64): Int64 {
        var s: Int64 = 0
        var idx = idx0
        while (idx > 0) {
            s += bit[idx]
            idx -= idx & (-idx)
        }
        return s
    }

    // Initialize S = all roots (children of 0).
    // base = n! * prod(dp[r]) / prod(sz[r]!)  over roots r in S.
    var base: Int64 = fact[n]
    for (r in children[0]) {
        bitUpdate(r, sz[r])
        base = base * dp[r] % MOD * powMod(fact[sz[r]], MOD - 2) % MOD
    }

    var ans: Int64 = 0
    var pos = 0
    while (pos < n) {
        let ai = A[pos]
        let remain = n - pos
        let sumLess = bitQuery(ai - 1)
        if (sumLess > 0) {
            let term = base * (sumLess % MOD) % MOD * invTab[remain] % MOD
            ans = (ans + term) % MOD
        }
        // Commit A[pos] = ai as the chosen node at this position.
        bitUpdate(ai, -sz[ai])
        for (c in children[ai]) {
            bitUpdate(c, sz[c])
        }
        // base <- base * sz[ai] / remain  (mod MOD)
        base = base * (sz[ai] % MOD) % MOD * invTab[remain] % MOD
        pos += 1
    }

    println(ans % MOD)
    return 0
}
```

</details>

## 要点

- 树的拓扑序数 $dp[u] = \frac{(sz[u]-1)!}{\prod sz[c]!}\prod dp[c]$，是 [知识点学习2](../59/index.md) 中 $n!/\prod sz[v]$ 结论的递归版本。
- 字典序计数通用套路：逐位枚举“首次变小”的位置，前缀严格相等、本位取更小值、后续任意排。
- 本题最关键的一步化简：第 $i$ 位强制选 $v$ 的方案数被归约成 $\frac{base}{n-i+1}\cdot sz[v]$，使得对 $v < A_i$ 求和只需树状数组维护 $\sum sz[v]$，无需对每个 $v$ 单独算子树方案。
- $p_i < i$ 保证儿子下标大于父亲，所有 $sz$、$dp$ 可用 $u=n \dots 1$ 倒序一轮累出，免去建树与 DFS。
- 除法统一在线性逆元表里查，避免循环里反复调用快速幂拖慢常数。
