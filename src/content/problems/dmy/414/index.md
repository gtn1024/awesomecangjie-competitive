---
oj: dmy
pid: '414'
title: '[R66F] 集训'
difficulty: 普及+/提高
tags:
  - 线段树
  - 组合数学
timeLimit: 6s
memoryLimit: 512m
---

> 数据规模：$1 \le n, q \le 1.5 \times 10^5$，$1 \le k \le 8$，$1 \le y \le 10^9$，$1 \le a_i \le 10^9$。

## 思路

若第 $i$ 个专题有 $a_i$ 道题，从其中选 $k$ 道的方案数为 $\binom{a_i}{k}$。一次集训只能选一个专题，所以查询 `2 l r k` 的答案就是

$$
\sum_{i=l}^{r} \binom{a_i}{k}
$$

问题转化为：维护序列 $a$ 的区间加，并查询区间内组合数之和，其中 $k \le 8$。

记 $K = 8$。在线段树的每个结点维护 $K + 1$ 个值：

$$
S_j = \sum_{i \in \text{结点区间}} \binom{a_i}{j} \quad (0 \le j \le K)
$$

由于 $\binom{x}{0} = 1$，$S_0$ 恰好是该结点覆盖的区间长度。合并两个儿子时，把对应的 $S_j$ 分别相加即可；查询区间 $[l, r]$ 的 `2` 号操作时，返回查询覆盖到的结点 $S_k$ 之和。

难点在于区间加。当 $a_i$ 变为 $a_i + y$ 时，由范德蒙德卷积：

$$
\binom{a_i + y}{j} = \sum_{t=0}^{j} \binom{a_i}{t} \binom{y}{j-t}
$$

对整个结点区间求和，得到更新后的维护值：

$$
S'_j = \sum_{t=0}^{j} S_t \cdot \binom{y}{j-t}
$$

所以对一个被完整覆盖的结点，先求出 $c_d = \binom{y}{d} \ (0 \le d \le K)$，再花 $O(K^2)$ 的时间完成整个 $S$ 的更新。计算 $S'_j$ 时每一项都依赖修改前的 $S_t$，因此必须先把旧的 $S$ 复制一份再转移。下传懒标记时，对两个儿子各执行一次同样的更新即可。

组合数取模的小技巧：因为 $k \le 8 < 998244353$，$\binom{x}{j}$ 是 $x$ 的 $j$ 次多项式且分母 $j!$ 与模数互质，所以把 $x$ 先对 $998244353$ 取模再代入计算即可，这也保证了 $a_i$ 和 $y$ 累加后仍能正确取模。

复杂度：每次修改与查询均为 $O(K^2 \log n)$，空间 $O(nK)$。

## 仓颉实现

<details>
<summary>查看仓颉实现</summary>

```cangjie
import std.convert.*
import std.env.*

let MOD: Int64 = 998244353
let K: Int64 = 8

// 线段树：seg[node * 9 + j] = 该结点区间内 sum(C(a_i, j))，j = 0..8
var seg = Array<Int64>(1, { _ => 0 })
var lazy = Array<Int64>(1, { _ => 0 })
// apply 时复用的临时数组（递归不重入，可安全复用）
var cbuf = Array<Int64>(9, { _ => 0 })
var obuf = Array<Int64>(9, { _ => 0 })
// inv[i] = i 在模 MOD 下的逆元，i = 1..8
var inv = Array<Int64>(9, { _ => 0 })

func pull(node: Int64): Unit {
    let base = node * 9
    let bl = (node * 2) * 9
    let br = (node * 2 + 1) * 9
    var j: Int64 = 0
    while (j <= K) {
        seg[base + j] = (seg[bl + j] + seg[br + j]) % MOD
        j = j + 1
    }
}

// 对结点整体加 y：利用范德蒙德卷积 C(x+y, j) = sum_{t<=j} C(x, t) * C(y, j-t)
func apply(node: Int64, y: Int64): Unit {
    let base = node * 9
    cbuf[0] = 1
    var d: Int64 = 1
    while (d <= K) {
        cbuf[d] = cbuf[d - 1] * ((y - d + 1 + MOD) % MOD) % MOD * inv[d] % MOD
        d = d + 1
    }
    var t: Int64 = 0
    while (t <= K) {
        obuf[t] = seg[base + t]
        t = t + 1
    }
    var j: Int64 = 0
    while (j <= K) {
        var s: Int64 = 0
        var tt: Int64 = 0
        while (tt <= j) {
            s = (s + obuf[tt] * cbuf[j - tt]) % MOD
            tt = tt + 1
        }
        seg[base + j] = s
        j = j + 1
    }
    lazy[node] = (lazy[node] + y) % MOD
}

func pushdown(node: Int64): Unit {
    if (lazy[node] != 0) {
        apply(node * 2, lazy[node])
        apply(node * 2 + 1, lazy[node])
        lazy[node] = 0
    }
}

func build(node: Int64, l: Int64, r: Int64, a: Array<Int64>): Unit {
    if (l == r) {
        let base = node * 9
        let x = a[l - 1] % MOD
        seg[base] = 1
        var j: Int64 = 1
        while (j <= K) {
            seg[base + j] = seg[base + j - 1] * ((x - j + 1 + MOD) % MOD) % MOD * inv[j] % MOD
            j = j + 1
        }
        return
    }
    let mid = (l + r) / 2
    build(node * 2, l, mid, a)
    build(node * 2 + 1, mid + 1, r, a)
    pull(node)
}

func add(node: Int64, l: Int64, r: Int64, ql: Int64, qr: Int64, y: Int64): Unit {
    if (ql <= l && r <= qr) {
        apply(node, y)
        return
    }
    pushdown(node)
    let mid = (l + r) / 2
    if (ql <= mid) {
        add(node * 2, l, mid, ql, qr, y)
    }
    if (qr > mid) {
        add(node * 2 + 1, mid + 1, r, ql, qr, y)
    }
    pull(node)
}

func query(node: Int64, l: Int64, r: Int64, ql: Int64, qr: Int64, k: Int64): Int64 {
    if (ql <= l && r <= qr) {
        return seg[node * 9 + k]
    }
    pushdown(node)
    let mid = (l + r) / 2
    var ans: Int64 = 0
    if (ql <= mid) {
        ans = (ans + query(node * 2, l, mid, ql, qr, k)) % MOD
    }
    if (qr > mid) {
        ans = (ans + query(node * 2 + 1, mid + 1, r, ql, qr, k)) % MOD
    }
    return ans
}

main() {
    let reader = getStdIn()
    let nm = reader.readln().getOrThrow().split(" ", removeEmpty: true).map({ p: String => Int64.parse(p) })
    let n = nm[0]
    let q = nm[1]
    seg = Array<Int64>(4 * n * 9, { _ => 0 })
    lazy = Array<Int64>(4 * n, { _ => 0 })
    inv[1] = 1
    var i: Int64 = 2
    while (i <= K) {
        inv[i] = (MOD - (MOD / i) * inv[MOD % i] % MOD) % MOD
        i = i + 1
    }
    let a = reader.readln().getOrThrow().split(" ", removeEmpty: true).map({ p: String => Int64.parse(p) })
    build(1, 1, n, a)
    var qi: Int64 = 0
    while (qi < q) {
        let op = reader.readln().getOrThrow().split(" ", removeEmpty: true).map({ p: String => Int64.parse(p) })
        if (op[0] == 1) {
            add(1, 1, n, op[1], op[2], op[3] % MOD)
        } else {
            let ans = query(1, 1, n, op[1], op[2], op[3])
            println(ans)
        }
        qi = qi + 1
    }
}
```

</details>

## 要点

- $S_0$ 恒为区间长度，建树时叶子直接置 $1$，合并时自然累加，无需特判。
- 区间加更新 $S$ 时必须先用旧值复制一份再做卷积，否则新值覆盖旧值会污染后续 $j$ 的计算。
- 组合数递推 $\binom{x}{j} = \binom{x}{j-1} \cdot \dfrac{x - j + 1}{j}$ 中，$x$ 是取模后的值，$x - j + 1$ 可能为负，需加一次模数修正；分母的逆元用线性方法预处理到 $K$ 即可。
- 懒标记只记录 $y$ 对模数取模后的值，因为卷积中只用到 $\binom{y}{d}$，而 $\binom{y}{d}$ 只依赖 $y \bmod MOD$。
