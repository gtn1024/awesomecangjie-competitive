---
oj: dmy
pid: '262'
title: '[R42G] 逆序对'
difficulty: 提高+
tags:
  - 生成函数
  - 组合数学
  - 欧拉五边形数定理
timeLimit: 1s
memoryLimit: 512m
---

> 数据规模：$n \le 10^{18}$，$m \le \min(\frac{n(n-1)}{2}, 5000)$，答案对 $998244353$ 取模。

## 思路

逆序对数量的生成函数是经典的：长度为 $n$ 的排列按逆序对数计数的生成函数为

$$\prod_{i=1}^{n} (1 + x + \cdots + x^{i-1}) = \prod_{i=1}^{n} \frac{1 - x^i}{1 - x} = (1 - x)^{-n} \prod_{i=1}^{n} (1 - x^i)$$

因此答案就是 $[x^m]\,(1 - x)^{-n} \prod_{i=1}^{n}(1 - x^i)$。

记 $c_r = [x^r](1 - x)^{-n} = \binom{n + r - 1}{r}$，可以用递推 $c_r = c_{r-1} \cdot \frac{n + r - 1}{r}$ 在 $O(m)$ 内求出（模逆元预处理 $1..m$）。剩下的问题是展开有限乘积 $\prod_{i=1}^{n}(1 - x^i)$ 截断到 $x^m$。

**当 $n \ge m$ 时**：截断到 $x^m$ 后，有限乘积与无穷乘积 $\prod_{i \ge 1}(1 - x^i)$ 一致（因子 $i > m$ 不影响 $\le m$ 次的系数）。由**欧拉五边形数定理**：

$$\prod_{i \ge 1}(1 - x^i) = \sum_{k=-\infty}^{+\infty} (-1)^k x^{k(3k-1)/2}$$

即非零项只出现在五边形数 $\frac{k(3k \pm 1)}{2}$ 处，系数为 $(-1)^k$。于是

$$ans = c_m + \sum_{k \ge 1} (-1)^k \left(c_{m - k(3k-1)/2} + c_{m - k(3k+1)/2}\right)$$

其中下标为负的项视为 $0$。$k$ 只需枚举到 $\frac{k(3k-1)}{2} \le m$，即 $O(\sqrt m)$ 个。

**当 $n < m$ 时**：有限乘积缺少因子 $i = n+1..m$，不能用五边形数定理。此时直接 DP 展开：$g = \prod_{i=1}^{n}(1 - x^i)$，初始 $g_0 = 1$，乘上因子 $(1 - x^i)$ 即从高次向低次做 $g_d \leftarrow g_d - g_{d-i}$（$d$ 从 $m$ 递减到 $i$，避免复用新值）。最后答案 $ans = \sum_{r=0}^{m} g_r \cdot c_{m-r}$。

## 复杂度

当 $n \ge m$ 时为 $O(m)$；当 $n < m$ 时为 $O(nm) \le O(m^2)$（此时 $n < m \le 5000$）。空间均为 $O(m)$。

## 仓颉实现

```cangjie
import std.convert.*
import std.env.*

let MOD: Int64 = 998244353

main(): Int64 {
    let reader = getStdIn()
    let input = reader.readln().getOrThrow().split(" ", removeEmpty: true).map({ p: String => Int64.parse(p) })
    let n = input[0]
    let m = input[1]

    // 模逆元 inv[1..m]
    let inv = Array<Int64>(m + 1, { _ => 0 })
    if (m >= 1) {
        inv[1] = 1
    }
    var i: Int64 = 2
    while (i <= m) {
        inv[i] = (MOD - (MOD / i) * inv[MOD % i] % MOD) % MOD
        i += 1
    }

    // choose[r] = C(n + r - 1, r)，即 (1 - x)^(-n) 的 x^r 系数
    let nMod = n % MOD
    let choose = Array<Int64>(m + 1, { _ => 0 })
    choose[0] = 1
    i = 1
    while (i <= m) {
        choose[i] = choose[i - 1] * ((nMod + i - 1) % MOD) % MOD * inv[i] % MOD
        i += 1
    }

    var answer: Int64 = 0
    if (n >= m) {
        // 逆序对生成函数为 ∏_{i=1}^n (1 - x^i) / (1 - x)^n。
        // n >= m 时乘积截断到 x^m 与无穷乘积一致，用欧拉五边形数定理展开。
        answer = choose[m]
        var k: Int64 = 1
        while (true) {
            let first = k * (3 * k - 1) / 2
            if (first > m) {
                break
            }
            let positive = (k & 1) == 0
            let t1 = choose[m - first]
            if (positive) {
                answer = (answer + t1) % MOD
            } else {
                answer = (answer - t1 + MOD) % MOD
            }
            let second = k * (3 * k + 1) / 2
            if (second <= m) {
                let t2 = choose[m - second]
                if (positive) {
                    answer = (answer + t2) % MOD
                } else {
                    answer = (answer - t2 + MOD) % MOD
                }
            }
            k += 1
        }
    } else {
        // n < m：先求有限乘积 g = ∏_{i=1}^n (1 - x^i) 截断到 x^m，
        // 再与 (1 - x)^(-n) 的系数做点积。
        var g = Array<Int64>(m + 1, { _ => 0 })
        g[0] = 1
        var i2: Int64 = 1
        while (i2 <= n) {
            var d: Int64 = m
            while (d >= i2) {
                var v = g[d] - g[d - i2]
                if (v < 0) {
                    v += MOD
                }
                g[d] = v
                d -= 1
            }
            i2 += 1
        }
        var r: Int64 = 0
        while (r <= m) {
            answer = (answer + g[r] * choose[m - r]) % MOD
            r += 1
        }
    }

    println(answer)
    return 0
}
```
