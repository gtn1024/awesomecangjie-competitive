---
oj: dmy
pid: '220'
title: '[R36E]出题组2'
difficulty: 提高
tags:
  - 组合数学
  - 指数生成函数
  - 递推
timeLimit: 1s
memoryLimit: 512m
---

> 对于 $100\%$ 的数据，$1 \le T \le 10^5$，$2 \le n \le 10^6$，答案对 $998244353$ 取模。

## 思路

把 $n$ 个**有标号**的人分成若干组，每组大小 $k \in [2, 5]$，且每组内指定一名出题人（$k$ 种选法）。这是典型的带权集合划分计数，用指数生成函数（EGF）处理。

一个大小为 $k$ 的组，在固定的 $k$ 个标号元素上有 $k$ 种指定出题人的方式，因此单组的 EGF 为：

$$B(x) = \frac{x^2}{1!} + \frac{x^3}{2!} + \frac{x^4}{3!} + \frac{x^5}{4!}$$

集合划分的 EGF 是 $\exp(B(x))$，于是答案 $f(n) = n! \cdot [x^n]\exp(B(x))$。

设 $g_n = [x^n]\exp(B(x))$。由 $g' = B' g$ 逐项比对系数可得：

$$n\,g_n = 2g_{n-2} + \frac{3}{2}g_{n-3} + \frac{2}{3}g_{n-4} + \frac{5}{24}g_{n-5}$$

再代回 $f(n) = n!\,g_n$，用下降阶乘消去阶乘，得到 $f$ 的直接递推（对 $n \ge 2$，越界项视为 $0$）：

$$f(n) = 2(n-1)f(n-2) + \frac{3}{2}(n-1)(n-2)f(n-3) + \frac{2}{3}(n-1)(n-2)(n-3)f(n-4) + \frac{5}{24}(n-1)(n-2)(n-3)(n-4)f(n-5)$$

初值 $f(0) = 1$，$f(1) = 0$。验证：$f(2) = 2$、$f(3) = 3$、$f(4) = 16$，与样例一致。

实现时读入全部询问，取最大值 $N$ 一次性递推到 $N$，再逐条回答；系数里的分数用模逆元表示（$998244353$ 为质数），乘法注意随时取模。

## 复杂度

- 时间复杂度：$O(N + T)$，$N$ 为询问中最大的 $n$。
- 空间复杂度：$O(N)$。

## 仓颉实现

```cangjie
import std.convert.*
import std.env.*

const MOD: Int64 = 998244353

// 快速幂，用于求模逆元
func power(a: Int64, e: Int64): Int64 {
    var base = a % MOD
    var exp = e
    var res: Int64 = 1
    while (exp > 0) {
        if (exp % 2 == 1) {
            res = res * base % MOD
        }
        base = base * base % MOD
        exp /= 2
    }
    return res
}

// 模乘：避免中间结果溢出
func mul(a: Int64, b: Int64): Int64 {
    return (a % MOD) * (b % MOD) % MOD
}

func solve(): Unit {
    let reader = getStdIn()
    let t = Int64.parse(reader.readln().getOrThrow())

    let ns = Array<Int64>(t, { _ => 0 })
    var maxN: Int64 = 0
    for (i in 0..t) {
        let x = Int64.parse(reader.readln().getOrThrow())
        ns[i] = x
        if (x > maxN) {
            maxN = x
        }
    }

    // EGF: exp(x^2/1! + x^3/2! + x^4/3! + x^5/4!)，
    // f[n] = 2(n-1)f[n-2] + (3/2)(n-1)(n-2)f[n-3]
    //      + (2/3)(n-1)(n-2)(n-3)f[n-4]
    //      + (5/24)(n-1)(n-2)(n-3)(n-4)f[n-5]
    let c2 = mul(3, power(2, MOD - 2))
    let c3 = mul(2, power(3, MOD - 2))
    let c4 = mul(5, power(24, MOD - 2))

    let f = Array<Int64>(maxN + 1, { _ => 0 })
    f[0] = 1
    // f[1] = 0：一个人无法成组
    var n: Int64 = 2
    while (n <= maxN) {
        let nm1 = n - 1
        var s = mul(mul(2, nm1), f[n - 2])
        if (n >= 3) {
            s = (s + mul(mul(mul(c2, nm1), n - 2), f[n - 3])) % MOD
        }
        if (n >= 4) {
            s = (s + mul(mul(mul(mul(c3, nm1), n - 2), n - 3), f[n - 4])) % MOD
        }
        if (n >= 5) {
            s = (s + mul(mul(mul(mul(mul(c4, nm1), n - 2), n - 3), n - 4), f[n - 5])) % MOD
        }
        f[n] = s
        n += 1
    }

    for (i in 0..t) {
        println(f[ns[i]])
    }
}

main(): Int64 {
    solve()
    return 0
}
```
