---
oj: dmy
pid: '152'
title: '[R25E]生成树'
difficulty: 提高
tags:
  - 最小生成树
  - 离线查询
timeLimit: 1s
memoryLimit: 256m
---

## 题目

给定 $n$ 个顶点的无向完全图，一开始所有边权均为 $X$。有 $m$ 条可选操作，第 $i$ 条可以把边 $(u_i,v_i)$ 的权值改为 $w_i$（也可以不执行）。有 $Q$ 次独立询问，每次给定 $x$，求把 $X$ 设为 $x$ 时该完全图最小生成树（MST）的总权值。

> 对于 $100\%$ 的数据，$1\le n,m\le 5\times 10^5$，$1\le Q\le 10^5$，$1\le x_i,w_i\le 10^9$。

## 思路

**操作效果**：MST 总权值关于每条边的权值是单调不减的，所以最优策略很直接——对同一条边有多条操作时取最小的 $w_i$，当 $w_i < X$ 就执行、否则不执行。因此每条被操作覆盖的边 $(u,v)$ 的权值等价于 $\min(X, w)$，其中 $w$ 是该边所有操作中的最小值；其余边的权值恒为 $X$。

**固定 $X$ 时的 MST**：权值严格小于 $X$ 的边恰好是那些 $w < X$ 的特殊边。Kruskal 会先按权值升序处理这些边，再处理所有权值为 $X$ 的边。若把全部特殊边按 $w$ 升序跑一遍 Kruskal，得到的森林 $F$ 中，恰是「$w < X$ 的前缀」这些边会在真实图里被优先选中——这是 Kruskal 的前缀稳定性：排序后前若干条边的决策与只取前若干条边跑 Kruskal 一致。

于是设 $F$ 的边权升序为 $w_1\le w_2\le\dots\le w_k$（$k\le n-1$），前缀和 $S_t=\sum_{i=1}^{t}w_i$。对询问 $x$，令 $t$ 为满足 $w_i < x$ 的边数，则前 $t$ 条边被选中，剩余 $(n-1-t)$ 条边从完全图里补全生成树，每条权值都是 $x$，所以

$$
\text{ans}(x) = S_t + (n-1-t)\cdot x.
$$

**实现**：把每条操作打包成单个整数 `(w << 20) | i`（$w\le 10^9<2^{30}$，$m\le 5\times10^5<2^{20}$，打包值不超过 $2^{50}$，`Int64` 放得下），按打包值升序排序即按 $w$ 升序，再配合 DSU 跑 Kruskal，把选中的 $w$ 依次存入数组。每条询问在选中边数组上二分求出 $t$ 即可。

## 复杂度

- 时间复杂度：$O(m\log m+Q\log n)$（排序、Kruskal、每条询问二分）。
- 空间复杂度：$O(n+m)$。

## 仓颉实现

```cangjie
import std.env.*
import std.convert.*

var buf: Array<Byte> = Array<Byte>(1, { _ => 0 })
var pos: Int64 = 0

func nextInt(): Int64 {
    let sz = buf.size
    var p = pos
    while (p < sz && Int64(buf[p]) <= 32) { p = p + 1 }
    var v: Int64 = 0
    while (p < sz) {
        let c = Int64(buf[p])
        if (c < 48 || c > 57) { break }
        v = v * 10 + (c - 48)
        p = p + 1
    }
    pos = p
    return v
}

func siftDown(a: Array<Int64>, start: Int64, end: Int64): Unit {
    var root = start
    while (true) {
        let child = root * 2 + 1
        if (child > end) { break }
        var swap = root
        if (a[swap] < a[child]) { swap = child }
        if (child + 1 <= end && a[swap] < a[child + 1]) { swap = child + 1 }
        if (swap == root) { break }
        let tmp = a[root]
        a[root] = a[swap]
        a[swap] = tmp
        root = swap
    }
}

func heapSort(a: Array<Int64>): Unit {
    let n = a.size
    var i = n / 2 - 1
    while (i >= 0) {
        siftDown(a, i, n - 1)
        i = i - 1
    }
    var end = n - 1
    while (end > 0) {
        let tmp = a[0]
        a[0] = a[end]
        a[end] = tmp
        end = end - 1
        siftDown(a, 0, end)
    }
}

func find(par: Array<Int64>, x: Int64): Int64 {
    var r = x
    while (par[r] != r) { r = par[r] }
    var c = x
    while (par[c] != c) {
        let nxt = par[c]
        par[c] = r
        c = nxt
    }
    return r
}

main(): Int64 {
    let reader = getStdIn()
    let chunk = Array<Byte>(1 << 20, { _ => 0 })
    var arr = Array<Byte>(1 << 20, { _ => 0 })
    var len: Int64 = 0
    while (true) {
        let got = reader.read(chunk)
        if (got == 0) { break }
        if (len + got > arr.size) {
            var cap = arr.size
            while (cap < len + got) { cap = cap * 2 }
            let nb = Array<Byte>(cap, { _ => 0 })
            for (i in 0..len) { nb[i] = arr[i] }
            arr = nb
        }
        for (i in 0..got) { arr[len + i] = chunk[i] }
        len = len + got
    }
    buf = arr
    let n = nextInt()
    let m = nextInt()
    let u = Array<Int64>(m, { _ => 0 })
    let v = Array<Int64>(m, { _ => 0 })
    let key = Array<Int64>(m, { _ => 0 })
    for (i in 0..m) {
        let a = nextInt()
        let b = nextInt()
        let w = nextInt()
        u[i] = a
        v[i] = b
        key[i] = (w << 20) | i
    }
    heapSort(key)
    let par = Array<Int64>(n + 1, { _ => 0 })
    let sz = Array<Int64>(n + 1, { _ => 1 })
    for (i in 1..=n) { par[i] = i }
    let chosen = Array<Int64>(n, { _ => 0 })
    var cnt: Int64 = 0
    for (i in 0..m) {
        let w = key[i] >> 20
        let idx = key[i] & 1048575
        let a = u[idx]
        let b = v[idx]
        let ra = find(par, a)
        let rb = find(par, b)
        if (ra != rb) {
            if (sz[ra] < sz[rb]) {
                par[ra] = rb
                sz[rb] = sz[rb] + sz[ra]
            } else {
                par[rb] = ra
                sz[ra] = sz[ra] + sz[rb]
            }
            chosen[cnt] = w
            cnt = cnt + 1
            if (cnt == n - 1) { break }
        }
    }
    let pref = Array<Int64>(cnt + 1, { _ => 0 })
    for (i in 1..=cnt) { pref[i] = pref[i - 1] + chosen[i - 1] }
    let q = nextInt()
    for (_ in 0..q) {
        let x = nextInt()
        var lo: Int64 = 0
        var hi: Int64 = cnt
        while (lo < hi) {
            let mid = (lo + hi) / 2
            if (chosen[mid] < x) { lo = mid + 1 } else { hi = mid }
        }
        println(pref[lo] + (n - 1 - lo) * x)
    }
    return 0
}
```
