---
oj: dmy
pid: '301'
title: '[R48F]分配权值'
difficulty: 提高
tags:
  - 矩阵快速幂
  - 图论
timeLimit: 1s
memoryLimit: 512m
---

## 题目

给定一个包含 $n$ 个点、$m$ 条边的简单无向图，每个点 $i$ 初始权值为 $a_i$。每一秒，每个点 $u$ 把自己当前的权值 $W_u$ 平均分给它的所有邻居（度数为 $d_u$ 时每个邻居收到 $W_u/d_u$）。求 $k$ 秒后每个点权值对 $998244353$ 取模的结果，分数 $p/q$ 输出 $p\cdot q^{P-2}\bmod P$。

> 对于 $100\%$ 的数据，$2\le n\le 50$，$n-1\le m\le \tfrac{n(n-1)}{2}$，$1\le k\le 10^{18}$，$0\le a_i<998244353$，图无自环且每个点度数至少为 $1$。

## 思路

这是一步到位的线性变换。设某一时刻的权值列向量为 $W$，考察一秒后点 $i$ 的权值：

$$
W'_i=\sum_{j\in N(i)}\frac{W_j}{d_j}.
$$

因此 $W'=T\cdot W$，其中转移矩阵 $T$ 的定义为

$$
T_{i,j}=\begin{cases}\dfrac{1}{d_j}, & i\in N(j)\\[2pt]0, & \text{otherwise}\end{cases}
$$

（注意分母是 $d_j$，即发出方的度数）。$k$ 秒后的权值即为 $T^k\cdot a$。

由于 $k$ 高达 $10^{18}$，但 $n\le 50$，矩阵规模极小，直接用 **矩阵快速幂** 即可：每一步做 $n\times n$ 矩阵乘法，共 $O(\log k)$ 次。所有元素在模 $998244353$ 意义下运算，$1/d_j$ 用费马小定理 $d_j^{P-2}\bmod P$ 求逆元。

一个小优化是跳过 $a_{ik}=0$ 的乘法项，对稀疏的转移矩阵有效；不过 $n=50$ 时即便朴素实现也完全足够。

## 复杂度

- 时间复杂度：$O(n^3\log k)$，其中 $n\le 50$。
- 空间复杂度：$O(n^2)$。

## 仓颉实现

```cangjie
import std.env.*
import std.convert.*

const MOD: Int64 = 998244353

// 矩阵乘法 a*b (n*n)，元素模 MOD
func matmul(a: Array<Array<Int64>>, b: Array<Array<Int64>>, n: Int64): Array<Array<Int64>> {
    var c = Array<Array<Int64>>(n, { _ => Array<Int64>(n, { _ => 0 }) })
    for (i in 0..n) {
        for (k in 0..n) {
            var aik = a[i][k]
            if (aik == 0) {
                continue
            }
            for (j in 0..n) {
                c[i][j] = (c[i][j] + aik * b[k][j]) % MOD
            }
        }
    }
    return c
}

// 矩阵快速幂 a^e（n*n），单位矩阵
func matpow(a: Array<Array<Int64>>, e0: Int64, n: Int64): Array<Array<Int64>> {
    var result = Array<Array<Int64>>(n, { i =>
        Array<Int64>(n, { j =>
            var x: Int64 = 0
            if (i == j) {
                x = 1
            }
            x
        })
    })
    var base = a
    var e = e0
    while (e > 0) {
        if ((e & 1) == 1) {
            result = matmul(result, base, n)
        }
        base = matmul(base, base, n)
        e = e / 2
    }
    return result
}

func modpow(base0: Int64, exp0: Int64): Int64 {
    var base = base0 % MOD
    var exp = exp0
    var res: Int64 = 1
    while (exp > 0) {
        if ((exp & 1) == 1) {
            res = (res * base) % MOD
        }
        base = (base * base) % MOD
        exp = exp / 2
    }
    return res
}

main() {
    let reader = getStdIn()
    let header = reader.readln().getOrThrow().split(" ", removeEmpty: true).map({ p: String => Int64.parse(p) })
    let n = header[0]
    let m = header[1]
    let k = header[2]
    let a = reader.readln().getOrThrow().split(" ", removeEmpty: true).map({ p: String => Int64.parse(p) })

    let nn = n

    var eu = Array<Int64>(m, { _ => 0 })
    var ev = Array<Int64>(m, { _ => 0 })
    var deg = Array<Int64>(nn, { _ => 0 })
    var mi: Int64 = 0
    while (mi < m) {
        let line = reader.readln().getOrThrow().split(" ", removeEmpty: true).map({ p: String => Int64.parse(p) })
        let u = line[0] - 1
        let v = line[1] - 1
        eu[mi] = u
        ev[mi] = v
        deg[u] += 1
        deg[v] += 1
        mi += 1
    }

    // 转移矩阵 T：T[i][j] = 1/d_j if 边(i,j)，表示一秒后 j 的权值流向 i 的比例
    var T = Array<Array<Int64>>(nn, { _ => Array<Int64>(nn, { _ => 0 }) })
    for (idx in 0..m) {
        let u = eu[idx]
        let v = ev[idx]
        let inv = modpow(deg[u], MOD - 2)
        T[v][u] = (T[v][u] + inv) % MOD
        let inv2 = modpow(deg[v], MOD - 2)
        T[u][v] = (T[u][v] + inv2) % MOD
    }

    let Tk = matpow(T, k, nn)

    // 结果向量 r = Tk * a，算出每个答案直接输出
    for (i in 0..nn) {
        var sum: Int64 = 0
        for (j in 0..nn) {
            sum = (sum + Tk[i][j] * a[j]) % MOD
        }
        print(sum)
        if (i + 1 < nn) {
            print(" ")
        }
    }
    println()
}
```
