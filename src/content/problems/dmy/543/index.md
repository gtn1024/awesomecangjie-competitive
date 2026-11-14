---
oj: dmy
pid: '543'
title: '昂贵的旅途'
difficulty: 提高
tags:
  - 换根 DP
timeLimit: 1s
memoryLimit: 256m
---

> 数据规模：$2 \le n \le 2\times 10^5$，$1 \le C_i \le 10^9$，$1 \le D_i \le 10^9$，输入的道路构成一棵树。

## 思路

要求的是 $ans_i=\max_{j\ne i}\big(\operatorname{dist}(i,j)+D_j\big)$。对每个起点都重新做一次遍历是 $O(n^2)$ 的，需要把「子树内」与「子树外」分开预处理，再拼起来。

**固定根，把答案拆成两部分。** 以 $1$ 为根。对每个点 $u$ 定义

$$f_u=\max_{v\in \text{subtree}(u)}\big(\operatorname{dist}(u,v)+D_v\big),$$

即终点落在 $u$ 的子树内（含 $v=u$）时的最大值。第一遍 DFS 自底向上求出：

$$f_u=\max\Big(D_u,\ \max_{v\text{ 是 }u\text{ 的儿子}}\big(f_v+C(u,v)\big)\Big).$$

这是因为从 $u$ 走到子树内的点必然先经过某个儿子 $v$，之后再走 $u\to v$ 那一步的代价是 $C(u,v)$。

**换根求子树外的答案。** 再定义

$$g_u=\max_{v\notin \text{subtree}(u)}\big(\operatorname{dist}(u,v)+D_v\big),$$

即终点在 $u$ 子树外时的最大值，根节点没有这样的点，取 $-\infty$。对 $u$ 的儿子 $v$，从 $v$ 出发到子树外的点必须经过 $u$，于是那一侧的候选只有三类：$u$ 本身的 $D_u$；$u$ 子树外的 $g_u$；$u$ 的其它儿子 $w$ 的子树。第三类里 $v$ 到 $w$ 子树内某点的最优值就是 $C(u,v)+\big(f_w+C(u,w)\big)$。因此

$$g_v=C(u,v)+\max\Big(g_u,\ D_u,\ \max_{w\text{ 是 }u\text{ 的儿子},\ w\ne v}\big(f_w+C(u,w)\big)\Big).$$

$g$ 由父推子，按 DFS 序自上而下计算即可。

**$O(1)$ 取出「其它儿子」的最优值。** 对每个 $u$ 预处理两个值：$f_w+C(u,w)$ 在所有儿子中的最大值 $b_1$（并记下取到它的儿子 $id$）与次大值 $b_2$。当 $v\ne id$ 时「其它儿子」的最优值就是 $b_1$，当 $v=id$ 时退化为 $b_2$（没有其它儿子时 $b_2=-\infty$）。每个点只扫一遍儿子就能求出，于是转移是 $O(1)$ 的，不需要前后缀数组。

**合并出答案，并处理 $j\ne i$。** 以 $u$ 为起点时，终点如果在某个儿子 $v$ 的子树内，最优值是 $C(u,v)+f_v$，这些情况的最大值正好是 $b_1(u)$；终点在子树外时最优值正好是 $g_u$。两者取最大，就把除 $u$ 以外的所有点都覆盖了：

$$ans_u=\max\big(g_u,\ b_1(u)\big).$$

其中 $g_1=-\infty$（根没有子树外）、叶子的 $b_1=-\infty$（没有儿子），这些位置只是表示对应那一侧为空，取另一侧的有限值即可。

因为 $u$ 自己只参与了 $D_u$（分别被收进 $f_u$ 和 $g_v$ 的转移里），从不单独成为候选，所以选出的终点天然满足 $j\ne u$，不需要额外排除。$n\ge 2$ 时每个点至少有一个邻居，答案不会是 $-\infty$。

**实现细节。** $n$ 达到 $2\times 10^5$，边权累加上限约 $2\times 10^{14}$，必须用 64 位整数；递归会爆栈，所以用显式栈（数组模拟队列）求出一个父先于子的遍历序，逆序扫一遍算 $f$、正序扫一遍算 $g$；$-\infty$ 取 $-2^{62}$，加上边权也不会溢出。

## 复杂度

每个点、每条边只被常数次访问，时间 $O(n)$；存储前向星与各点状态数组，空间 $O(n)$。

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

func mx(a: Int64, b: Int64): Int64 {
    if (a > b) { a } else { b }
}

main() {
    gdata = getStdIn().readToEnd().getOrThrow().toArray()
    let n = nextInt()
    let m = n - 1
    let NEG: Int64 = -4611686018427387904

    let head = Array<Int64>(n + 1, { _ => -1 })
    let to = Array<Int64>(2 * m, { _ => 0 })
    let nxt = Array<Int64>(2 * m, { _ => 0 })
    let wt = Array<Int64>(2 * m, { _ => 0 })

    var ec: Int64 = 0
    for (_ in 0..m) {
        let a = nextInt()
        let b = nextInt()
        let c = nextInt()
        to[ec] = b
        wt[ec] = c
        nxt[ec] = head[a]
        head[a] = ec
        ec += 1
        to[ec] = a
        wt[ec] = c
        nxt[ec] = head[b]
        head[b] = ec
        ec += 1
    }

    let d = Array<Int64>(n + 1, { _ => 0 })
    for (i in 1..=n) {
        d[i] = nextInt()
    }

    let par = Array<Int64>(n + 1, { _ => 0 })
    let order = Array<Int64>(n, { _ => 0 })
    var cnt: Int64 = 1
    order[0] = 1
    par[1] = 0
    var qi: Int64 = 0
    while (qi < cnt) {
        let u = order[qi]
        qi += 1
        var e = head[u]
        while (e != -1) {
            let v = to[e]
            if (v != par[u]) {
                par[v] = u
                order[cnt] = v
                cnt += 1
            }
            e = nxt[e]
        }
    }

    let f = Array<Int64>(n + 1, { _ => 0 })
    let b1 = Array<Int64>(n + 1, { _ => NEG })
    let b2 = Array<Int64>(n + 1, { _ => NEG })
    let b1id = Array<Int64>(n + 1, { _ => 0 })

    var i = n - 1
    while (i >= 0) {
        let u = order[i]
        var best: Int64 = NEG
        var sec: Int64 = NEG
        var bid: Int64 = 0
        var e = head[u]
        while (e != -1) {
            let v = to[e]
            if (par[v] == u) {
                let val = f[v] + wt[e]
                if (val > best) {
                    sec = best
                    best = val
                    bid = v
                } else if (val > sec) {
                    sec = val
                }
            }
            e = nxt[e]
        }
        b1[u] = best
        b2[u] = sec
        b1id[u] = bid
        f[u] = mx(d[u], best)
        i -= 1
    }

    let g = Array<Int64>(n + 1, { _ => NEG })
    var j: Int64 = 0
    while (j < n) {
        let u = order[j]
        let base = mx(g[u], d[u])
        var e = head[u]
        while (e != -1) {
            let v = to[e]
            if (par[v] == u) {
                let other = if (b1id[u] == v) { b2[u] } else { b1[u] }
                g[v] = wt[e] + mx(base, other)
            }
            e = nxt[e]
        }
        j += 1
    }

    for (u in 1..=n) {
        println(mx(g[u], b1[u]))
    }
}
```

</details>
