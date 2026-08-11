---
oj: dmy
pid: '128'
title: '[R21G]期望排名'
difficulty: 提高+/省选-
tags:
  - 概率
  - 数学期望
  - 离线处理
  - 树状数组
timeLimit: 2s
memoryLimit: 256m
---

## 题目

给定 $n$ 个独立的离散型随机变量，第 $i$ 个变量有 $m_i$ 个两两不同的可能取值 $a_{i,j}$，取值概率为 $p_{i,j}=c_{i,j}/100$。有 $Q$ 次询问 $(l,r,k)$，求仅考虑第 $l$ 到第 $r$ 个变量时，第 $k$ 个变量的取值在这 $r-l+1$ 个取值中的期望排名（排名为排序后的位置序号，从 $1$ 开始），对 $998244353$ 取模。

> 对于 $100\%$ 的数据，$1\le n\le 10^5$，$1\le m_i\le 10$，$1\le Q\le 10^5$，$1\le l\le k\le r\le n$。

## 思路

设 $F_j(t)=P(X_j<t)$。由于各变量相互独立，当 $X_k$ 取到 $a_{k,s}$ 时，它在区间 $[l,r]$ 内的排名等于 $1$ 加上其余变量取值中小于 $a_{k,s}$ 的个数，因此

$$
E=1+\sum_{j\in[l,r],j\ne k}\ \sum_{s=1}^{m_k}p_{k,s}\,F_j(a_{k,s}).
$$

把 $j=k$ 的项补回求和，再减去多算的部分，得到

$$
E=1+\sum_{s=1}^{m_k}p_{k,s}\,S(l,r,a_{k,s})-g(k),
$$

其中 $S(l,r,t)=\sum_{j\in[l,r]}F_j(t)$，而 $g(k)=\sum_{s}p_{k,s}F_k(a_{k,s})$ 是独立副本 $X_k'<X_k$ 的概率，只与 $k$ 有关：读入时对每个变量按取值排序后累加即可（$m_k\le 10$）。

于是每个询问只需回答至多 $m_k$ 个二维询问 $(l,r,t)$：区间 $[l,r]$ 内各变量取值**小于** $t$ 的概率之和。把每个取值看成一个事件（位置 $j$、权值 $c_{j,s}\cdot 100^{-1}$），子询问按阈值 $t$ 递增排序，事件按取值递增排序。由于所有取值两两不同，用树状数组按取值从小到大逐个加入事件，回答阈值为 $t$ 的子询问时树状数组中恰好是所有取值小于 $t$ 的事件，区间和即为 $S(l,r,t)$。本题「严格小于」的边界由「先回答、后插入」的扫描顺序自然保证。

## 复杂度

设 $M=\sum m_i\le 10^6$，子询问总数 $T=\sum_q m_{k_q}\le 10^6$。排序与树状数组操作均为 $O((M+T)\log n)$ 时间，$O(M+T)$ 空间。

## 仓颉实现

```cangjie
import std.env.*
import std.convert.*

func modPow(base: Int64, exp: Int64, mod: Int64): Int64 {
    var b = base % mod
    var e = exp
    var r: Int64 = 1
    while (e > 0) {
        if (e % 2 == 1) {
            r = (r * b) % mod
        }
        b = (b * b) % mod
        e = e / 2
    }
    return r
}

func mergeSort(lo: Int64, hi: Int64, perm: Array<Int64>, tmp: Array<Int64>, key: Array<Int64>): Unit {
    if (hi - lo <= 1) {
        return
    }
    let mid = lo + (hi - lo) / 2
    mergeSort(lo, mid, perm, tmp, key)
    mergeSort(mid, hi, perm, tmp, key)
    var i = lo
    var j = mid
    var t = lo
    while (i < mid && j < hi) {
        if (key[perm[i]] < key[perm[j]]) {
            tmp[t] = perm[i]
            i += 1
        } else {
            tmp[t] = perm[j]
            j += 1
        }
        t += 1
    }
    while (i < mid) {
        tmp[t] = perm[i]
        i += 1
        t += 1
    }
    while (j < hi) {
        tmp[t] = perm[j]
        j += 1
        t += 1
    }
    var u = lo
    while (u < hi) {
        perm[u] = tmp[u]
        u += 1
    }
}

func bitAdd(bit: Array<Int64>, n: Int64, idx: Int64, w: Int64): Unit {
    var x = idx
    while (x <= n) {
        bit[x] = bit[x] + w
        x += x & (-x)
    }
}

func bitSum(bit: Array<Int64>, idx: Int64): Int64 {
    var x = idx
    var s: Int64 = 0
    while (x > 0) {
        s = s + bit[x]
        x -= x & (-x)
    }
    return s
}

main(): Int64 {
    let MOD: Int64 = 998244353
    let inv100 = modPow(100, MOD - 2, MOD)
    let reader = getStdIn()

    let n = Int64.parse(reader.readln().getOrThrow())
    let cap = n * 10

    let valArr = Array<Int64>(cap, { _ => 0 })
    let cArr = Array<Int64>(cap, { _ => 0 })
    let posArr = Array<Int64>(cap, { _ => 0 })
    let mArr = Array<Int64>(n, { _ => 0 })
    let startOf = Array<Int64>(n, { _ => 0 })
    let gArr = Array<Int64>(n, { _ => 0 })

    var total: Int64 = 0
    for (i in 0..n) {
        let line = reader.readln().getOrThrow().split(" ", removeEmpty: true).map({ p: String => Int64.parse(p) })
        let m = line[0]
        mArr[i] = m
        startOf[i] = total
        var ord = Array<Int64>(m, { _ => 0 })
        for (j in 0..m) {
            ord[j] = j
        }
        for (j in 1..m) {
            let vj = line[2 * j + 1]
            var t2 = j
            while (t2 > 0 && line[2 * ord[t2 - 1] + 1] > vj) {
                ord[t2] = ord[t2 - 1]
                t2 -= 1
            }
            ord[t2] = j
        }
        var pref: Int64 = 0
        var gg: Int64 = 0
        for (j in 0..m) {
            let cc = line[2 * ord[j] + 2]
            gg = (gg + cc * pref) % MOD
            pref = pref + cc
        }
        gArr[i] = ((gg % MOD) * inv100 % MOD) * inv100 % MOD
        for (j in 0..m) {
            let id = total + j
            valArr[id] = line[2 * j + 1]
            cArr[id] = line[2 * j + 2]
            posArr[id] = i
        }
        total += m
    }

    let perm = Array<Int64>(cap, { _ => 0 })
    let tmp = Array<Int64>(cap, { _ => 0 })
    for (i in 0..total) {
        perm[i] = i
    }
    mergeSort(0, total, perm, tmp, valArr)
    let rankArr = Array<Int64>(cap, { _ => 0 })
    for (i in 0..total) {
        rankArr[perm[i]] = i
    }

    let Q = Int64.parse(reader.readln().getOrThrow())
    let sc = Q * 10
    let head = Array<Int64>(cap, { _ => -1 })
    let nxt = Array<Int64>(sc, { _ => -1 })
    let lArr = Array<Int64>(sc, { _ => 0 })
    let rArr = Array<Int64>(sc, { _ => 0 })
    let qidArr = Array<Int64>(sc, { _ => 0 })
    let coefArr = Array<Int64>(sc, { _ => 0 })
    let acc = Array<Int64>(Q, { _ => 0 })
    let kArr = Array<Int64>(Q, { _ => 0 })

    var subCount: Int64 = 0
    for (q in 0..Q) {
        let line = reader.readln().getOrThrow().split(" ", removeEmpty: true).map({ p: String => Int64.parse(p) })
        let l = line[0]
        let r = line[1]
        let k0 = line[2] - 1
        kArr[q] = k0
        let m = mArr[k0]
        let st = startOf[k0]
        for (s in 0..m) {
            let id = st + s
            let rk = rankArr[id]
            let t = subCount
            subCount += 1
            nxt[t] = head[rk]
            head[rk] = t
            lArr[t] = l
            rArr[t] = r
            qidArr[t] = q
            coefArr[t] = (cArr[id] * inv100) % MOD
        }
    }

    let bit = Array<Int64>(n + 1, { _ => 0 })
    for (rk in 0..total) {
        var t = head[rk]
        while (t != -1) {
            let ssum = (bitSum(bit, rArr[t]) - bitSum(bit, lArr[t] - 1)) % MOD
            acc[qidArr[t]] = (acc[qidArr[t]] + coefArr[t] * ssum) % MOD
            t = nxt[t]
        }
        let id = perm[rk]
        bitAdd(bit, n, posArr[id] + 1, (cArr[id] * inv100) % MOD)
    }

    var sb = StringBuilder()
    for (q in 0..Q) {
        var ans = (1 + acc[q] - gArr[kArr[q]]) % MOD
        if (ans < 0) {
            ans += MOD
        }
        sb.append(ans)
        sb.append("\n")
    }
    print(sb.toString())
    return 0
}
```
