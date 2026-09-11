---
oj: dmy
pid: '254'
title: '[R41E]颜色题'
difficulty: 提高
tags:
  - 并查集
  - 离线
  - 计数
timeLimit: 1s
memoryLimit: 512m
---

> 数据规模：$1 \le n \le 10^5$，$1 \le c_i \le 10$，删边序列是 $1..n-1$ 的排列。

## 思路

设 $N_c$ 为「路径上至少经过一条颜色为 $c$ 的边」的点对数。答案就是

$$\prod_{c=1}^{10} c^{N_c} \bmod 998244353$$

因为同一颜色在一条路径上只贡献一次，点对 $(x,y)$ 的 $f(x,y)$ 对答案的贡献恰好是把路径上出现过的每种颜色各乘一次。

于是问题变成维护每个颜色 $c$ 的 $N_c$。删边是持久的，正难则反，**把删边倒过来看成加边**：初始是没有边的森林（答案为 $1$），按 $x_{n-1}, x_{n-2}, \ldots, x_1$ 的顺序把边加回去。

考虑加回一条边 $(u,v)$（颜色 $c$），它把两个连通块 $A,B$ 合并。新产生的连通点对数为 $P=|A|\times|B|$，这些点对的路径都经过新边。对颜色 $d$ 分两类：

- $d = c$：新边本身就是颜色 $c$，所有 $P$ 个新点对的路径都含颜色 $c$，故 $\Delta N_c = P$。
- $d \ne c$：新点对中路径**不含**颜色 $d$ 的，恰好是「$u$ 侧不含颜色 $d$ 边的点」与「$v$ 侧不含颜色 $d$ 边的点」的配对。若我们维护一个**只含非颜色 $d$ 边的并查集**，那么 $u$ 侧这类点的个数就是该并查集中 $u$ 所在连通块的大小 $s_d(u)$。于是 $\Delta N_d = P - s_d(u)\cdot s_d(v)$。

所以对每个颜色 $d$ 各维护一个并查集（其中只有颜色 $\ne d$ 的边），加边 $(u,v,c)$ 时：

- 对 $d=c$：$\Delta N_d = P$；
- 对 $d\ne c$：在颜色 $d$ 的并查集中合并 $u,v$（合并前大小乘积即不含颜色 $d$ 的新点对数），$\Delta N_d = P - s_d(u)s_d(v)$。

再把答案乘上 $\prod_d d^{\Delta N_d}$ 即可。真实森林也要一个并查集来维护连通块大小 $|A|,|B|$。

## 复杂度

每个颜色一个并查集，总大小 $O(10n)$；每次加边对 $10$ 种颜色各做常数次查询/合并，并做一次快速幂。总时间 $O(10n\alpha(n) + 10n\log MOD)$，空间 $O(10n)$，可以轻松通过 $n=10^5$。

## 仓颉实现

```cangjie
import std.convert.*
import std.env.*

const MOD: Int64 = 998244353

func powmod(a: Int64, e: Int64): Int64 {
    var base = a % MOD
    var exp = e
    var res: Int64 = 1
    while (exp > 0) {
        if ((exp & 1) == 1) {
            res = res * base % MOD
        }
        base = base * base % MOD
        exp >>= 1
    }
    return res
}

// 并查集，数组按 base 偏移存放某一颜色对应的父指针
func find(fa: Array<Int64>, base: Int64, r: Int64): Int64 {
    var cur = r
    while (fa[base + cur] != cur) {
        cur = fa[base + cur]
    }
    var w = r
    while (fa[base + w] != w) {
        let nx = fa[base + w]
        fa[base + w] = cur
        w = nx
    }
    return cur
}

main() {
    let reader = getStdIn()
    let n = Int64.parse(reader.readln().getOrThrow())
    if (n == 1) {
        println("1")
        return
    }
    let eu = Array<Int64>(n, { _ => 0 })
    let ev = Array<Int64>(n, { _ => 0 })
    let ec = Array<Int64>(n, { _ => 0 })
    for (i in 1..n) {
        let p = reader.readln().getOrThrow().split(" ", removeEmpty: true).map({ p: String => Int64.parse(p) })
        eu[i] = p[0]
        ev[i] = p[1]
        ec[i] = p[2]
    }
    let x = reader.readln().getOrThrow().split(" ", removeEmpty: true).map({ p: String => Int64.parse(p) })

    // 真实森林的并查集
    let far = Array<Int64>(n + 1, { _ => 0 })
    let szr = Array<Int64>(n + 1, { _ => 1 })
    // 每种颜色一个并查集：只含非该颜色的边
    let fc = Array<Int64>(11 * (n + 1), { _ => 0 })
    let szc = Array<Int64>(11 * (n + 1), { _ => 1 })
    for (i in 1..(n + 1)) {
        far[i] = i
        for (d in 1..11) {
            fc[d * (n + 1) + i] = i
        }
    }

    let ansArr = Array<Int64>(n, { _ => 1 })
    var ans: Int64 = 1
    var k = n - 2
    while (k >= 0) {
        let e = x[k]
        let u = eu[e]
        let v = ev[e]
        let c = ec[e]
        let ra = find(far, 0, u)
        let rb = find(far, 0, v)
        let P = szr[ra] * szr[rb]
        for (d in 1..11) {
            var dn: Int64 = 0
            if (d == c) {
                dn = P
            } else {
                let base = d * (n + 1)
                let da = find(fc, base, u)
                let db = find(fc, base, v)
                let newPairs = szc[base + da] * szc[base + db]
                if (szc[base + da] < szc[base + db]) {
                    fc[base + da] = db
                    szc[base + db] = szc[base + db] + szc[base + da]
                } else {
                    fc[base + db] = da
                    szc[base + da] = szc[base + da] + szc[base + db]
                }
                dn = P - newPairs
            }
            if (dn > 0) {
                ans = ans * powmod(d, dn) % MOD
            }
        }
        // 真实并查集合并
        if (szr[ra] < szr[rb]) {
            far[ra] = rb
            szr[rb] = szr[rb] + szr[ra]
        } else {
            far[rb] = ra
            szr[ra] = szr[ra] + szr[rb]
        }
        ansArr[k] = ans
        k -= 1
    }

    for (i in 0..n) {
        if (i > 0) {
            print(" ")
        }
        print(ansArr[i])
    }
    println()
}
```
