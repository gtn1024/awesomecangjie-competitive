---
oj: dmy
pid: '197'
title: '[R32F]染色游戏2'
difficulty: 提高
tags:
  - 状态压缩 DP
  - 矩阵快速幂
  - 组合计数
timeLimit: 1s
memoryLimit: 512m
---

> 数据规模：$n \le 8$，$m \le 10^9$，$2 \le k \le 10^9$，答案对 $998244353$ 取模。

## 思路

$n$ 很小而 $m$ 很大，自然想到按列做状态压缩 DP，再用矩阵快速幂处理 $m$。

一列只有 $n$ 个格子，用位掩码表示这一列中染成颜色 $1$ 的格子集合。同一列内颜色 $1$ 不能相邻，所以掩码内不能有相邻的 $1$；相邻两列的颜色 $1$ 也不能上下相邻，所以两列掩码按位与必须为 $0$。

若某一列的掩码为 $b$，则其余 $n - \operatorname{popcount}(b)$ 个格子各有 $k - 1$ 种颜色可选，该列的方案权值为

$$w(b) = (k - 1)^{n - \operatorname{popcount}(b)}$$

记 $f_j(b)$ 为前 $j$ 列合法染色、且第 $j$ 列掩码为 $b$ 的方案数，$g_j(b)$ 为这些方案中颜色 $1$ 出现次数之和。转移为：

$$
f_{j+1}(b) = \sum_{a \,\&\, b = 0} f_j(a) \cdot w(b)
$$

$$
g_{j+1}(b) = \sum_{a \,\&\, b = 0} \left(g_j(a) + \operatorname{popcount}(b) \cdot f_j(a)\right) \cdot w(b)
$$

把 $(f, g)$ 拼成一个 $2N$ 维向量（$N$ 为合法掩码数），一次转移就是一次矩阵乘法，用矩阵快速幂 $O(N^3 \log m)$ 求出第 $m$ 步后的向量，答案为 $\sum_b g_m(b)$。

初始状态把「第 $0$ 列之前」视为空掩码 $0$——它与任何掩码都兼容，即 $f_0(0) = 1$，其余为 $0$。

## 复杂度

$n = 8$ 时无相邻 $1$ 的掩码数为 $N = 55$。时间 $O(N^3 \log m)$，空间 $O(N^2)$。

## 仓颉实现

```cangjie
import std.convert.*
import std.collection.*
import std.env.*

const MOD: Int64 = 998244353

func powMod(a: Int64, e: Int64): Int64 {
    var base = a % MOD
    var exp = e
    var res: Int64 = 1
    while (exp > 0) {
        if ((exp & 1) != 0) {
            res = res * base % MOD
        }
        base = base * base % MOD
        exp >>= 1
    }
    return res
}

func popcount(x: Int64): Int64 {
    var c: Int64 = 0
    var t = x
    while (t > 0) {
        if ((t & 1) != 0) {
            c += 1
        }
        t >>= 1
    }
    return c
}

func matVecMul(mat: Array<Array<Int64>>, x: Array<Int64>): Array<Int64> {
    let sz = mat.size
    var res = Array<Int64>(sz, { _ => 0 })
    for (i in 0..sz) {
        var s: Int64 = 0
        let row = mat[i]
        for (j in 0..sz) {
            if (row[j] != 0) {
                s = (s + row[j] * x[j]) % MOD
            }
        }
        res[i] = s
    }
    return res
}

func matMul(a: Array<Array<Int64>>, b: Array<Array<Int64>>): Array<Array<Int64>> {
    let sz = a.size
    var c = Array<Array<Int64>>(sz, { _ => Array<Int64>(sz, { _ => 0 }) })
    for (i in 0..sz) {
        let ai = a[i]
        let ci = c[i]
        for (k in 0..sz) {
            let aik = ai[k]
            if (aik != 0) {
                let bk = b[k]
                for (j in 0..sz) {
                    if (bk[j] != 0) {
                        ci[j] = (ci[j] + aik * bk[j]) % MOD
                    }
                }
            }
        }
    }
    return c
}

func solve() {
    let reader = getStdIn()
    let parts = reader.readln().getOrThrow().split(" ", removeEmpty: true).map({ p: String => Int64.parse(p) })
    let n = parts[0]
    let m = parts[1]
    let k = parts[2]

    // 枚举一列中染成颜色 1 的位置集合（不能有相邻格子），mask 的二进制位即位置
    let maxMask = Int64(1) << n
    var masks = ArrayList<Int64>()
    var idx = HashMap<Int64, Int64>()
    for (mask in 0..maxMask) {
        if ((mask & (mask << 1)) == 0) {
            let id = Int64(masks.size)
            masks.add(mask)
            idx[mask] = id
        }
    }
    let N = masks.size
    let SZ = 2 * N

    let km1 = (k - 1) % MOD
    var w = Array<Int64>(N, { _ => 0 })
    var pc = Array<Int64>(N, { _ => 0 })
    for (i in 0..N) {
        pc[i] = popcount(masks[i])
        w[i] = powMod(km1, n - pc[i])
    }

    // 增广矩阵：状态向量 [f; g]，f 为方案数，g 为颜色 1 出现次数之和
    // 相邻两列 mask a、b 需满足 a & b == 0
    var M = Array<Array<Int64>>(SZ, { _ => Array<Int64>(SZ, { _ => 0 }) })
    for (a in 0..N) {
        for (b in 0..N) {
            if ((masks[a] & masks[b]) == 0) {
                let t = w[b]
                M[b][a] = t
                M[N + b][N + a] = t
                M[N + b][a] = (M[N + b][a] + t * pc[b]) % MOD
            }
        }
    }

    // 初始状态：第 0 列之前视为空 mask（与任何 mask 都兼容）
    var x = Array<Int64>(SZ, { _ => 0 })
    let zid = idx[Int64(0)]
    x[zid] = 1

    var e = m
    while (e > 0) {
        if ((e & 1) != 0) {
            x = matVecMul(M, x)
        }
        M = matMul(M, M)
        e >>= 1
    }

    var ans: Int64 = 0
    for (b in 0..N) {
        ans = (ans + x[N + b]) % MOD
    }
    println(ans)
}

main() {
    solve()
}
```
