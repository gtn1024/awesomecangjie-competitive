---
oj: dmy
pid: '202'
title: '[R33E]表达式求和'
difficulty: 提高+
tags:
  - 组合数学
  - 计数
  - 前缀和
timeLimit: 1s
memoryLimit: 512m
---

> 数据规模：$n \le 5 \times 10^5$，$0 \le k < n$，数字串长度 $n$，答案对 $998244353$ 取模。

## 思路

在 $n-1$ 个空隙中选 $k$ 个放加号，表达式被分成 $k+1$ 个连续数字块，答案就是所有方案里所有块数值之和。按线性性，可以**按块统计**：对每个连续块 $[l, r]$（长度 $m = r-l+1$），算它作为某个表达式中的一个块出现多少次，再乘上它的数值 $val(l, r)$。

一个块要成为表达式中的块，需要满足：

- 块内部的 $m-1$ 个空隙都不能放加号；
- 若块的左边界不是串首（$l > 0$），则该空隙必须放加号；右边界同理（$r < n-1$）；
- 其余空隙自由放置剩下的加号。

于是块被分成两类，系数只与长度 $m$ 有关：

1. **边界块**（贴左或贴右，$1 \le m \le n-1$）：有一侧贴着串边界，只需 1 个必放加号。自由空隙数为 $n-1-(m-1)-1 = n-m-1$，还需放 $k-1$ 个加号，方案数为 $\binom{n-m-1}{k-1}$。
2. **内部块**（$1 \le m \le n-2$）：两侧都要放加号。自由空隙数为 $n-m-2$，还需放 $k-2$ 个，方案数为 $\binom{n-m-2}{k-2}$。
3. 当 $k = 0$ 时没有加号，整个串是一个数，直接输出其值对模数取模。

记 $L(m)$ 为前缀块 $[0, m-1]$ 的数值，$R(m)$ 为后缀块 $[n-m, n-1]$ 的数值，$W(m)$ 为**所有**长度为 $m$ 的连续块数值之和，则答案为：

$$
\sum_{m=1}^{n-1} (L(m) + R(m)) \cdot \binom{n-m-1}{k-1}
+ \sum_{m=1}^{n-2} (W(m) - L(m) - R(m)) \cdot \binom{n-m-2}{k-2}
$$

（$W(m) - L(m) - R(m)$ 正好是所有长度为 $m$ 的内部块的数值之和。）

三者都可以 $O(n)$ 递推：

- $L(m) = 10 \cdot L(m-1) + d_{m-1}$，$L(0) = 0$；
- $R(m) = d_{n-m} \cdot 10^{m-1} + R(m-1)$，$R(0) = 0$；
- $W(1) = \sum d_i$；对 $m \ge 2$，每个长度为 $m$ 的块等于对应长度 $m-1$ 的块乘 10 再加末尾新增的数字：
  $$
  W(m) = 10 \cdot (W(m-1) - R(m-1)) + \sum_{i=m-1}^{n-1} d_i
  $$

组合数用阶乘和阶乘逆元预处理，全部在 $O(1)$ 内查询。注意 $\binom{x}{y}$ 在 $y < 0$ 或 $y > x$ 时按 0 处理（比如 $k=1$ 时内部块系数为 0，天然成立）。

## 复杂度

时间 $O(n)$，空间 $O(n)$。

## 仓颉实现

```cangjie
import std.env.*
import std.convert.*

const MOD: Int64 = 998244353

func modpow(a: Int64, e: Int64): Int64 {
    var res: Int64 = 1
    var base = a % MOD
    var ee = e
    while (ee > 0) {
        if ((ee & 1) == 1) {
            res = res * base % MOD
        }
        base = base * base % MOD
        ee = ee >> 1
    }
    return res
}

func comb(fact: Array<Int64>, invfact: Array<Int64>, x: Int64, y: Int64): Int64 {
    if (y < 0 || y > x) {
        return 0
    }
    return fact[x] * invfact[y] % MOD * invfact[x - y] % MOD
}

main(): Int64 {
    let reader = getStdIn()
    let nk = reader.readln().getOrThrow().split(" ", removeEmpty: true).map({ p: String => Int64.parse(p) })
    let n = nk[0]
    let k = nk[1]
    let s = reader.readln().getOrThrow()

    let dig = Array<Int64>(n, { _ => 0 })
    for (i in 0..n) {
        dig[i] = Int64(s[i]) - 48
    }

    // dpref[j] = 前 j 个数字之和
    let dpref = Array<Int64>(n + 1, { _ => 0 })
    for (i in 0..n) {
        dpref[i + 1] = dpref[i] + dig[i]
    }
    let totalD = dpref[n] % MOD

    // k = 0：整个串作为一个数
    if (k == 0) {
        var v: Int64 = 0
        for (i in 0..n) {
            v = (v * 10 + dig[i]) % MOD
        }
        println(v.toString())
        return 0
    }

    // 阶乘与阶乘逆元，用于组合数
    let fact = Array<Int64>(n + 1, { _ => 1 })
    for (i in 1..(n + 1)) {
        fact[i] = fact[i - 1] * i % MOD
    }
    let invfact = Array<Int64>(n + 1, { _ => 1 })
    invfact[n] = modpow(fact[n], MOD - 2)
    var idx = n
    while (idx > 0) {
        invfact[idx - 1] = invfact[idx] * idx % MOD
        idx -= 1
    }

    var ans: Int64 = 0
    var L: Int64 = 0          // 长度为 m 的前缀块 [0, m-1] 的数值
    var R: Int64 = 0          // 长度为 m 的后缀块 [n-m, n-1] 的数值
    var wall: Int64 = totalD  // 所有长度为 m 的连续块数值之和
    var prevR: Int64 = 0      // R(m-1)
    var pw: Int64 = 1         // 10^(m-1)
    for (m in 1..n) {
        L = (L * 10 + dig[m - 1]) % MOD
        R = (dig[n - m] * pw + R) % MOD
        if (m > 1) {
            wall = (10 * ((wall - prevR) % MOD) + (totalD - dpref[m - 1])) % MOD
            if (wall < 0) {
                wall += MOD
            }
        }
        // 贴左或贴右的边界块：块外还有 k-1 个加号
        let cb = comb(fact, invfact, n - m - 1, k - 1)
        ans = (ans + (L + R) % MOD * cb) % MOD
        // 内部块：左右两侧都放加号，共 k-2 个其余加号
        if (m <= n - 2) {
            var inner = (wall - L - R) % MOD
            if (inner < 0) {
                inner += MOD
            }
            let ci = comb(fact, invfact, n - m - 2, k - 2)
            ans = (ans + inner * ci) % MOD
        }
        prevR = R
        pw = pw * 10 % MOD
    }

    println(ans.toString())
    return 0
}
```
