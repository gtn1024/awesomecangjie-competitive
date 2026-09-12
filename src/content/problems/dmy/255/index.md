---
oj: dmy
pid: '255'
title: '[R41F]幸运'
difficulty: 提高
tags:
  - 组合数学
  - 斯特林数
  - 生成函数
timeLimit: 1.5s
memoryLimit: 512m
---

> 数据规模：$1 \le n \le 10^5$，$0 \le d \le 20$，$T \le 4 \times 10^4$。

## 思路

先看 $K$ 的分布：恰好有 $k$ 个前缀最小值（左到右最小值的个数）的 $n$ 元排列数，等于第一类无符号斯特林数 $c(n, k)$。这是因为经典的生成函数

$$x(x+1)\cdots(x+n-1) = \sum_{k=1}^{n} c(n, k)\, x^k$$

（也可以用递推 $c(n,k) = c(n-1,k-1) + (n-1)\,c(n-1,k)$ 从「最后一个数是否是新的前缀最小值」推导）。

于是答案为 $\sum_k k^d \, c(n, k)$，直接求斯特林数表需要 $O(n \cdot d)$ 再对每组询问做 $O(n)$ 求和，无法接受 $T$ 组询问。需要利用 $d$ 很小这个关键条件。

把 $k^d$ 用第二类斯特林数展开成下降幂：

$$k^d = \sum_{j=0}^{d} S_2(d, j)\, k^{\underline{j}}, \quad k^{\underline{j}} = k(k-1)\cdots(k-j+1)$$

而 $\sum_k k^{\underline{j}} c(n,k)$ 正好是多项式 $P_n(x) = \prod_{i=0}^{n-1}(x+i)$ 在 $x=1$ 处的 $j$ 阶导数值 $P_n^{(j)}(1)$（因为 $\sum_k c(n,k) k^{\underline{j}} x^{k-j}$ 就是 $P_n$ 的 $j$ 阶导数）。记

$$A_j(n) = P_n^{(j)}(1) = \sum_k k^{\underline{j}}\, c(n,k)$$

由 $P_{n+1}(x) = (x+n) P_n(x)$ 和莱布尼茨求导法则，得到递推：

$$A_j(n+1) = (n+1)\, A_j(n) + j\, A_{j-1}(n)$$

边界 $A_0(1) = A_1(1) = 1$，$j \ge 2$ 时 $A_j(1) = 0$。注意 $A_0(n) = P_n(1) = n!$，正好对应 $d = 0$ 时答案为 $n!$。

预处理出所有 $A_j(n)$（$0 \le j \le 20$，$1 \le n \le 10^5$）后，每组询问直接计算：

$$\sum_{j=0}^{d} S_2(d, j)\, A_j(n) \bmod 998244353$$

## 复杂度

预处理 $O(n \cdot d) = 10^5 \times 21$，单组询问 $O(d)$，总复杂度 $O(n \cdot d + T \cdot d)$，空间 $O(n \cdot d)$。

## 仓颉实现

```cangjie
import std.convert.*
import std.env.*

let MOD: Int64 = 998244353
let DMAX: Int64 = 20
let NMAX: Int64 = 100000
let STRIDE: Int64 = NMAX + 1

// A[j * STRIDE + n] = P_n 的 j 阶导数在 x = 1 处的值，
// 其中 P_n(x) = x(x+1)...(x+n-1) = sum_k c(n,k) * x^k（c(n,k) 为第一类无符号斯特林数）
var A = Array<Int64>((DMAX + 1) * STRIDE, { _ => 0 })
// S2[i * (DMAX + 1) + j]：第二类斯特林数
var S2 = Array<Int64>((DMAX + 1) * (DMAX + 1), { _ => 0 })

func solve() {
    let reader = getStdIn()
    let line = reader.readln().getOrThrow().split(" ", removeEmpty: true).map({ p: String => Int64.parse(p) })
    let n = line[0]
    let d = line[1]
    var ans: Int64 = 0
    var j: Int64 = 0
    while (j <= d) {
        ans = (ans + S2[d * (DMAX + 1) + j] * A[j * STRIDE + n]) % MOD
        j += 1
    }
    println(ans)
}

main() {
    // 第二类斯特林数：i^d = sum_j S2(d, j) * i^(j)
    S2[0] = 1
    var i: Int64 = 1
    while (i <= DMAX) {
        var j: Int64 = 1
        while (j <= i) {
            S2[i * (DMAX + 1) + j] =
                (S2[(i - 1) * (DMAX + 1) + (j - 1)] + j * S2[(i - 1) * (DMAX + 1) + j]) % MOD
            j += 1
        }
        i += 1
    }
    // A[j][n+1] = (n+1) * A[j][n] + j * A[j-1][n]，边界 A[0][1] = A[1][1] = 1
    A[0 * STRIDE + 1] = 1
    A[1 * STRIDE + 1] = 1
    var n: Int64 = 1
    while (n < NMAX) {
        var j: Int64 = 0
        while (j <= DMAX) {
            var v = (n + 1) * A[j * STRIDE + n]
            if (j >= 1) {
                v += j * A[(j - 1) * STRIDE + n]
            }
            A[j * STRIDE + (n + 1)] = v % MOD
            j += 1
        }
        n += 1
    }
    let reader = getStdIn()
    let t = Int64.parse(reader.readln().getOrThrow())
    var cnt: Int64 = 0
    while (cnt < t) {
        solve()
        cnt += 1
    }
}
```
