---
oj: dmy
pid: '467'
title: '[R75E] 网络重启'
difficulty: 提高+
tags:
  - 图论
  - Kruskal 重构树
  - 并查集
  - 贪心
timeLimit: 2s
memoryLimit: 256m
---

> 数据规模：$1 \le n \le 2 \times 10^5$，$n - 1 \le m \le \min(2 \times 10^5,\ n(n-1)/2)$，$1 \le a_i \le 10^9$，输入图连通且没有重边。

## 思路

**第一步：启动过程是单调的。** 每次操作都会让功率总和严格增大，因此从 $s$ 出发时，当前集合 $S$ 能启动的候选中继站集合只增不减。于是「从 $s$ 出发能启动全部」等价于：不断把所有「与 $S$ 相邻且 $a_v \le \sum_{u \in S} a_u$」的中继站加入，看闭包能否覆盖全部点。这个闭包是唯一确定的，但逐个起点模拟是 $O(nm)$ 的。

**第二步：把连通块的合并写成 Kruskal 过程。** 给每条边 $(u,v)$ 赋权 $w(u,v) = \max(a_u, a_v)$，按 $w$ 从小到大做 Kruskal。每次合并两个连通块时新建一个**Kruskal 重构树**节点 $z$：两个儿子分别是两块当前的代表，$\mathrm{sum}_z$ 为两块内 $a$ 的总和，$\mathrm{level}_z = w$ 为这次合并所用边的权重。重构树有两条关键性质：

- 节点 $z$ 的子树，恰好是 Kruskal 处理到该次合并时形成的那个连通块；
- 因为边权是递增处理的，若 $u, v$ 分属节点 $z$ 的两个儿子子树，则它们之间任意一条边的权重都不小于 $\mathrm{level}_z$；否则这条边会更早被处理，两块早就合并了。特别地，从 $z$ 的某个儿子子树出发、连向外部的每条边，权重都至少是 $\mathrm{level}_z$。

**第三步：起点合法的充要条件。** 叶子 $x$ 是合法起点，当且仅当从根到 $x$ 的路径上，对每个内部节点 $p$（记 $y$ 为该路径上 $p$ 的儿子）都有

$$\mathrm{sum}_y \ge \mathrm{level}_p$$

**必要性：**设 $x$ 能启动全部点。取路径上任一内部节点 $p$，$y$ 为路径上 $p$ 的儿子，$y'$ 为另一个儿子。考察启动 $y$ 之外第一个点 $v'$ 的时刻：此前已启动的点全在 $y$ 内，而 $v'$ 是某条从 $y$ 连向外部的边的端点，该边权重不小于 $\mathrm{level}_p$。设这条边的另一个端点为 $u' \in y$，则 $a_{u'} \le \mathrm{sum}_y$ 且 $a_{v'} \le \mathrm{sum}_y$，于是 $\mathrm{level}_p \le \max(a_{u'}, a_{v'}) \le \mathrm{sum}_y$。

**充分性：**先证明一个引理。设 $y'$ 是重构树中一棵子树，若已经启动了 $y'$ 中某个点 $t$，且当前功率 $P$ 不小于 $y'$ 内所有节点的 $\mathrm{level}$ 的最大值，则能启动 $y'$ 的全部点。对从 $t$ 到 $y'$ 的路径自下而上归纳：设 $q$ 为该路径上的内部节点，其儿子 $c$（包含 $t$）已被完整启动，则 $c$ 与兄弟 $c'$ 之间的合并边权重恰为 $\mathrm{level}_q \le P$，其中在 $c'$ 一侧的端点 $v$ 满足 $a_v \le \mathrm{level}_q \le P$，可以被启动；接着把引理递归地用在子树 $c'$ 上（功率只会增大，仍然不小于 $c'$ 内的所有 $\mathrm{level}$）即可。

于是对叶子 $x$ 沿路径自下而上归纳：$x$ 能启动它所在的子块 $y$。由条件 $\mathrm{sum}_y \ge \mathrm{level}_p$，把 $y$ 与兄弟 $y'$ 连起来的那条合并边（其权重为 $\mathrm{level}_p$）在 $y'$ 一侧的端点 $v$ 满足 $a_v \le \mathrm{level}_p \le \mathrm{sum}_y$，故 $v$ 可以被启动；而 $y'$ 内所有节点的 $\mathrm{level}$ 都不超过 $\mathrm{level}_p$，由引理可启动 $y'$ 的全部点。一直归纳到重构树根，$x$ 就能启动整张图。

判断时只需自顶向下把「合法」标记沿重构树传播：根的标记为真，节点 $y$ 的标记为真当且仅当父节点 $p$ 的标记为真且 $\mathrm{sum}_y \ge \mathrm{level}_p$。最后统计标记为真的叶子数量即可。

## 复杂度

时间 $O(m \log m + m \alpha(n))$，空间 $O(n + m)$。

## 仓颉实现

```cangjie
import std.env.*
import std.convert.*
import std.sort.*

func findRoot(p: Array<Int64>, start: Int64): Int64 {
    var x = start
    var r = x
    while (p[r] != r) {
        r = p[r]
    }
    while (p[x] != x) {
        let y = p[x]
        p[x] = r
        x = y
    }
    return r
}

main() {
    let reader = getStdIn()
    let nm = reader.readln().getOrThrow().split(" ", removeEmpty: true).map({ p: String => Int64.parse(p) })
    let n = nm[0]
    let m = nm[1]
    let a = reader.readln().getOrThrow().split(" ", removeEmpty: true).map({ p: String => Int64.parse(p) })

    // 每条边按 max(a_u, a_v) 排序；键低位存放边编号，权重上限 1e9 < 2^30，编号 < 2^18
    let pw: Int64 = 262144
    let mask = pw - 1
    let eu = Array<Int64>(m, { _ => 0 })
    let ev = Array<Int64>(m, { _ => 0 })
    let keys = Array<Int64>(m, { _ => 0 })
    for (i in 0..m) {
        let uv = reader.readln().getOrThrow().split(" ", removeEmpty: true).map({ p: String => Int64.parse(p) })
        let u = uv[0] - 1
        let v = uv[1] - 1
        eu[i] = u
        ev[i] = v
        let w = if (a[u] > a[v]) {
            a[u]
        } else {
            a[v]
        }
        keys[i] = w * pw + i
    }
    sort(keys)

    let size = 2 * n
    let p = Array<Int64>(size, { i: Int64 => i })
    let sm = Array<Int64>(size, { _ => 0 })
    let lv = Array<Int64>(size, { _ => 0 })
    let lch = Array<Int64>(size, { _ => -1 })
    let rch = Array<Int64>(size, { _ => -1 })
    for (i in 0..n) {
        sm[i] = a[i]
    }

    var tot = n
    var used: Int64 = 0
    for (k in keys) {
        let idx = k & mask
        let x = findRoot(p, eu[idx])
        let y = findRoot(p, ev[idx])
        if (x == y) {
            continue
        }
        let z = tot
        tot += 1
        lv[z] = k / pw
        sm[z] = sm[x] + sm[y]
        lch[z] = x
        rch[z] = y
        p[x] = z
        p[y] = z
        p[z] = z
        used += 1
        if (used == n - 1) {
            break
        }
    }

    let root = findRoot(p, 0)
    let good = Array<Bool>(size, { _ => false })
    let stk = Array<Int64>(size, { _ => 0 })
    var sp: Int64 = 0
    good[root] = true
    stk[sp] = root
    sp += 1
    var answer: Int64 = 0
    while (sp > 0) {
        sp -= 1
        let x = stk[sp]
        if (x < n) {
            if (good[x]) {
                answer += 1
            }
            continue
        }
        let c0 = lch[x]
        let c1 = rch[x]
        let g = good[x]
        good[c0] = g && (sm[c0] >= lv[x])
        good[c1] = g && (sm[c1] >= lv[x])
        stk[sp] = c0
        sp += 1
        stk[sp] = c1
        sp += 1
    }
    println(answer)
}
```
