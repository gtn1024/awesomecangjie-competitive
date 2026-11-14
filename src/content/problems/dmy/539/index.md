---
oj: dmy
pid: '539'
title: '树上区间取值'
difficulty: 提高+
tags:
  - 树形DP
timeLimit: 1s
memoryLimit: 256m
---

> 数据规模：$1 \le T \le 250$，$2 \le n \le 10^5$，$1 \le l_i \le r_i \le 10^9$，$1 \le u,v \le n$，同一输入中 $\sum n \le 2\times 10^5$。

## 思路

**先缩状态：每个节点只需考虑区间端点。** 固定其余节点的取值，节点 $u$ 对总价值的贡献是

$$\sum_{v \in N(u)} |x_u - x_v|,$$

这是关于 $x_u$ 的若干绝对值函数之和，是凸函数。凸函数在闭区间上的最大值一定能在某个端点取到，所以把 $x_u$ 换到 $l_u$ 或 $r_u$ 不会让总价值变小；又因为改 $x_u$ 只影响与 $u$ 相连的边，逐点调整即可得到一个「所有 $x_i$ 都是端点」的最优解。于是每个节点只剩下两种取值。

**状态。** 以 $1$ 为根，$dp[u][0]$ 表示 $x_u=l_u$ 时 $u$ 子树内所有边的最大价值和，$dp[u][1]$ 表示 $x_u=r_u$ 时的对应值。这里只统计子树内部的边，不含 $u$ 到父亲的边。

**转移。** 儿子之间没有直接的相互影响，它们只通过 $x_u$ 耦合，而 $x_u$ 已经在状态里枚举过了，所以每个儿子独立取最优：

$$dp[u][0]=\sum_{v \in \mathrm{son}(u)} \max\bigl(dp[v][0]+|l_u-l_v|,\; dp[v][1]+|l_u-r_v|\bigr),$$

$$dp[u][1]=\sum_{v \in \mathrm{son}(u)} \max\bigl(dp[v][0]+|r_u-l_v|,\; dp[v][1]+|r_u-r_v|\bigr).$$

根没有父节点，答案为 $\max(dp[1][0],dp[1][1])$。

**实现细节。** 链长可达 $10^5$，递归会爆栈，因此用队列从根做一遍 BFS 求出每个点的父节点与访问次序，再按逆序处理，等价于后序遍历。邻接表用 `head` / `to` / `nxt` 三个数组存成链式前向星，避免为每个点单独开动态数组。答案上界约 $2\times10^5\times10^9=2\times10^{14}$，需要 64 位整数。多组数据每组重新分配数组，互不干扰。

输入总量可达 $8\times10^5$ 个整数，而时限只有 1 秒，所以整体一次读入后用字节扫描逐个取整数，比逐行切分更快。

## 复杂度

每组数据时间 $O(n)$（每个点、每条边各处理常数次），空间 $O(n)$（邻接表五个数组加两个 DP 数组）。总计 $O(\sum n)$ 时间与 $O(\max n)$ 空间。

## 仓颉实现

<details>
<summary>查看仓颉实现</summary>

```cangjie
import std.env.*

var gdata = Array<Byte>(0, { _ => 0 })
var gpos: Int64 = 0

func nextInt(): Int64 {
    while (gpos < gdata.size && Int64(gdata[gpos]) <= 32) { gpos += 1 }
    var x: Int64 = 0
    while (gpos < gdata.size && Int64(gdata[gpos]) > 32) {
        x = x * 10 + Int64(gdata[gpos]) - 48
        gpos += 1
    }
    return x
}

func diff(a: Int64, b: Int64): Int64 {
    if (a >= b) {
        return a - b
    }
    return b - a
}

func solve() {
    let n = nextInt()
    let lf = Array<Int64>(n, { _ => 0 })
    let rt = Array<Int64>(n, { _ => 0 })
    for (i in 0..n) {
        lf[i] = nextInt()
        rt[i] = nextInt()
    }
    let m = 2 * (n - 1)
    let head = Array<Int64>(n, { _ => -1 })
    let to = Array<Int64>(m, { _ => 0 })
    let nxt = Array<Int64>(m, { _ => 0 })
    var ec: Int64 = 0
    for (_ in 0..(n - 1)) {
        let u = nextInt() - 1
        let v = nextInt() - 1
        to[ec] = v
        nxt[ec] = head[u]
        head[u] = ec
        ec += 1
        to[ec] = u
        nxt[ec] = head[v]
        head[v] = ec
        ec += 1
    }
    let order = Array<Int64>(n, { _ => 0 })
    let par = Array<Int64>(n, { _ => -1 })
    order[0] = 0
    var qh: Int64 = 0
    var qt: Int64 = 1
    while (qh < qt) {
        let u = order[qh]
        qh += 1
        var e = head[u]
        while (e != -1) {
            let v = to[e]
            if (v != par[u]) {
                par[v] = u
                order[qt] = v
                qt += 1
            }
            e = nxt[e]
        }
    }
    let d0 = Array<Int64>(n, { _ => 0 })
    let d1 = Array<Int64>(n, { _ => 0 })
    var i = n - 1
    while (i >= 0) {
        let u = order[i]
        var s0: Int64 = 0
        var s1: Int64 = 0
        var e = head[u]
        while (e != -1) {
            let v = to[e]
            if (v != par[u]) {
                let a0 = d0[v] + diff(lf[u], lf[v])
                let a1 = d1[v] + diff(lf[u], rt[v])
                if (a0 > a1) {
                    s0 += a0
                } else {
                    s0 += a1
                }
                let b0 = d0[v] + diff(rt[u], lf[v])
                let b1 = d1[v] + diff(rt[u], rt[v])
                if (b0 > b1) {
                    s1 += b0
                } else {
                    s1 += b1
                }
            }
            e = nxt[e]
        }
        d0[u] = s0
        d1[u] = s1
        i -= 1
    }
    if (d0[0] > d1[0]) {
        println(d0[0])
    } else {
        println(d1[0])
    }
}

main() {
    gdata = getStdIn().readToEnd().getOrThrow().toArray()
    let t = nextInt()
    for (_ in 0..t) {
        solve()
    }
}
```

</details>
