---
oj: dmy
pid: '166'
title: '[R27F]公约数'
difficulty: 提高
tags:
  - 数论
  - 莫比乌斯反演
timeLimit: 1s
memoryLimit: 512m
---

> 数据规模：$1 \le n \le 100$，$1 \le A_i \le 10^7$。

## 思路

直接统计 $\gcd(X_1, \dots, X_n) = 1$ 的序列不方便，先看一个更简单的问题：满足「$d \mid X_i$ 对每个 $i$ 都成立」的序列有多少个？此时每个 $X_i$ 可以取 $d, 2d, \dots, \lfloor A_i/d\rfloor \cdot d$，共 $\lfloor A_i/d\rfloor$ 种，所以答案是

$$
F(d) = \prod_{i=1}^{n} \left\lfloor \frac{A_i}{d} \right\rfloor
$$

而 $\gcd(X_1, \dots, X_n) = 1$ 等价于「不存在质数 $p$ 整除所有 $X_i$」。由莫比乌斯反演：

$$
\text{ans} = \sum_{d=1}^{m} \mu(d) \cdot F(d) = \sum_{d=1}^{m} \mu(d) \prod_{i=1}^{n} \left\lfloor \frac{A_i}{d} \right\rfloor
$$

其中 $m = \min A_i$，$\mu$ 是莫比乌斯函数。验证一下：$\prod_i \lfloor A_i/d\rfloor$ 统计的是「所有 $X_i$ 都被 $d$ 整除」的序列数，反演后恰好留下 $\gcd$ 恰为 $1$ 的部分。

直接枚举 $d$ 是 $O(mn)$，$m$ 最大 $10^7$、$n$ 最大 $100$，无法通过。用整除分块优化：把 $d$ 按「所有 $\lfloor A_i/d\rfloor$ 同时不变」分组。对当前块左端点 $l$，令 $q_i = \lfloor A_i/l\rfloor$，则块右端点为

$$
r = \min\left(m,\ \min_{i} \left\lfloor \frac{A_i}{q_i} \right\rfloor\right)
$$

块内每个 $\lfloor A_i/d\rfloor$ 都等于 $q_i$（因为 $d \le r \le A_i/q_i$ 时 $\lfloor A_i/d\rfloor = q_i$），所以这一块的贡献是

$$
\left(\sum_{d=l}^{r} \mu(d)\right) \cdot \prod_{i=1}^{n} q_i
$$

预处理 $\mu$ 的前缀和 $M(x) = \sum_{d \le x} \mu(d)$ 后，$\sum_{d=l}^{r} \mu(d) = M(r) - M(l-1)$ 可 $O(1)$ 求出。答案对 $998244353$ 取模，前缀和差值可能为负，先取模再加模修正。

## 复杂度

线性筛求 $\mu$ 并原地转成前缀和：$O(m)$ 时间、$O(m)$ 空间（$m = \min A_i \le 10^7$，用 32 位整数数组存，内存约几十 MB）。分块统计共 $O(nB)$，其中块数 $B = O(\sum_i \sqrt{A_i})$，最坏约 $6 \times 10^5$ 块。总时间约 $O(m + n\sum_i \sqrt{A_i})$，1 秒内轻松通过。

## 仓颉实现

<details>
<summary>查看仓颉实现</summary>

```cangjie
import std.convert.*
import std.sort.*
import std.collection.*
import std.env.*

const MOD: Int64 = 998244353

main() {
    let reader = getStdIn()
    let n = Int64.parse(reader.readln().getOrThrow())
    var a = reader.readln().getOrThrow().split(" ", removeEmpty: true).map({ p: String => Int64.parse(p) })
    sort(a)
    let nn = n
    let maxA = a[0]
    let size = maxA + 1

    // 线性筛求莫比乌斯函数 mu，之后原地转成前缀和 M(x) = sum_{d<=x} mu(d)
    let mu = Array<Int32>(size, { _ => 0 })
    let isComp = Array<Bool>(size, { _ => false })
    let primes = ArrayList<Int64>()
    mu[1] = 1
    var i: Int64 = 2
    while (i <= maxA) {
        if (!isComp[i]) {
            primes.add(i)
            mu[i] = -1
        }
        var j = 0
        while (j < primes.size) {
            let p = primes[j]
            let t = i * p
            if (t > maxA) {
                break
            }
            isComp[t] = true
            if (i % p == 0) {
                mu[t] = 0
                break
            } else {
                mu[t] = -mu[i]
            }
            j = j + 1
        }
        i = i + 1
    }
    var k: Int64 = 1
    while (k <= maxA) {
        mu[k] = mu[k] + mu[k - 1]
        k = k + 1
    }

    // 对 d 分块：每块内所有 floor(A_i / d) 同时不变，用前缀和快速累加 mu
    var ans: Int64 = 0
    var d: Int64 = 1
    while (d <= maxA) {
        var r = maxA
        var prod: Int64 = 1
        var idx: Int64 = 0
        while (idx < nn) {
            let ai = a[idx]
            let q = ai / d
            prod = (prod * (q % MOD)) % MOD
            let rq = ai / q
            if (rq < r) {
                r = rq
            }
            idx = idx + 1
        }
        var ms: Int64 = Int64(mu[r]) - Int64(mu[d - 1])
        ms = ((ms % MOD) + MOD) % MOD
        ans = (ans + ms * prod) % MOD
        d = r + 1
    }

    println(ans)
}
```

</details>
