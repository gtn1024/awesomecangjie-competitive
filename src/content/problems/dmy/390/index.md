---
oj: dmy
pid: '390'
title: '[R62F] 因数'
difficulty: 普及+/提高
tags:
  - 矩阵快速幂
  - 质因数分解
timeLimit: 1s
memoryLimit: 512m
---

> 数据规模：$1 \le a, b \le 10^5$，$1 \le n \le 10^{14}$。

## 思路

$f_n$ 始终是 $a!$ 与 $b!$ 的乘积，因此可以写成

$$
f_n = (a!)^{x_n} \cdot (b!)^{y_n}
$$

由递推式 $f_n = f_{n-1} \cdot f_{n-2}$ 可知指数 $x_n$、$y_n$ 满足同样的斐波那契式递推：

$$
x_n = x_{n-1} + x_{n-2}, \quad y_n = y_{n-1} + y_{n-2}
$$

初始值为 $(x_1, x_2) = (1, 0)$、$(y_1, y_2) = (0, 1)$。由于 $n$ 高达 $10^{14}$，用**矩阵快速幂**在 $O(\log n)$ 时间内求出 $x_n$、$y_n$（转移矩阵为 $\begin{bmatrix}0 & 1 \\ 1 & 1\end{bmatrix}$）。

接下来求 $f_n$ 的因子个数。将 $f_n$ 分解质因数 $f_n = \prod_p p^{c_p}$，则正因子个数为

$$
d(f_n) = \prod_p (c_p + 1)
$$

质数 $p$ 在 $m!$ 中的指数由勒让德公式给出：

$$
v_p(m!) = \sum_{k \ge 1} \left\lfloor \frac{m}{p^k} \right\rfloor
$$

于是先筛出 $\max(a, b)$ 范围内的所有质数，对每个质数 $p$ 计算 $v_p(a!)$ 与 $v_p(b!)$，得到

$$
d(f_n) = \prod_p \left( v_p(a!) \cdot x_n + v_p(b!) \cdot y_n + 1 \right) \bmod 998244353
$$

$x_n$、$y_n$ 在矩阵快速幂中直接对 $998244353$ 取模，由模运算的分配律，最终答案不变。

## 复杂度

筛法 $O(N \log \log N)$（$N = \max(a, b) \le 10^5$），矩阵快速幂 $O(\log n)$，对每个质数累加指数共 $O(\pi(N) \log N)$ 次除法，总复杂度 $O(N \log \log N + \log n)$。

## 仓颉实现

```cangjie
import std.convert.*
import std.env.*

let MOD: Int64 = 998244353

// 2x2 矩阵乘法，按行存储 [a00, a01, a10, a11]
func matMul(x: Array<Int64>, y: Array<Int64>): Array<Int64> {
    let r = Array<Int64>(4, { _ => 0 })
    r[0] = (x[0] * y[0] + x[1] * y[2]) % MOD
    r[1] = (x[0] * y[1] + x[1] * y[3]) % MOD
    r[2] = (x[2] * y[0] + x[3] * y[2]) % MOD
    r[3] = (x[2] * y[1] + x[3] * y[3]) % MOD
    return r
}

// 计算转移矩阵 [[0,1],[1,1]] 的 e 次幂
func matPow(e: Int64): Array<Int64> {
    var res: Array<Int64> = [1, 0, 0, 1]
    var base: Array<Int64> = [0, 1, 1, 1]
    var k = e
    while (k > 0) {
        if (k % 2 == 1) {
            res = matMul(res, base)
        }
        base = matMul(base, base)
        k = k / 2
    }
    return res
}

main() {
    let reader = getStdIn()
    let inp = reader.readln().getOrThrow().split(" ", removeEmpty: true).map({ p: String => Int64.parse(p) })
    let a = inp[0]
    let b = inp[1]
    let n = inp[2]

    // f_n = (a!)^x * (b!)^y，x、y 满足斐波那契式递推，用矩阵快速幂求第 n 项
    let m = matPow(n - 1)
    let x = m[0]
    let y = m[2]

    // 埃氏筛筛出 max(a, b) 内的质数
    let lim = if (a > b) { a } else { b }
    let isPrime = Array<Bool>(lim + 1, { _ => true })
    isPrime[0] = false
    if (lim >= 1) {
        isPrime[1] = false
    }
    var i: Int64 = 2
    while (i * i <= lim) {
        if (isPrime[i]) {
            var j = i * i
            while (j <= lim) {
                isPrime[j] = false
                j += i
            }
        }
        i += 1
    }

    var ans: Int64 = 1
    for (p in 2..(lim + 1)) {
        if (!isPrime[p]) {
            continue
        }
        // v_p(a!) 与 v_p(b!)
        var va: Int64 = 0
        var t = a
        while (t >= p) {
            t = t / p
            va += t
        }
        var vb: Int64 = 0
        t = b
        while (t >= p) {
            t = t / p
            vb += t
        }
        // 因子数 = prod_p (va * x + vb * y + 1)
        ans = ans * ((va * x + vb * y + 1) % MOD) % MOD
    }
    println(ans)
}
```
