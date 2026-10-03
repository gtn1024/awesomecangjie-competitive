---
oj: dmy
pid: '39'
title: '[R7C] 二维gcd和'
difficulty: 普及-
tags:
  - 数论
  - 欧拉函数
timeLimit: 1s
memoryLimit: 512m
---

> 数据规模：$1 \le N, M \le 2 \times 10^6$。

## 思路

把 $\gcd(i, N)$ 作为公因式提出，原式可化为两个独立的一维和之积：

$$
\sum_{i=1}^N\sum_{j=1}^M \gcd(i,N)\cdot\gcd(j,M)
= \left(\sum_{i=1}^N \gcd(i,N)\right)\left(\sum_{j=1}^M \gcd(j,M)\right)
$$

记 $f(x) = \sum_{i=1}^x \gcd(i, x)$。按最大公因数分组：$\gcd(i, x) = d$ 当且仅当 $d \mid x$ 且 $\gcd(i/d, x/d) = 1$，这样的 $i$ 恰有 $\varphi(x/d)$ 个，所以

$$f(x) = \sum_{d \mid x} d \cdot \varphi(x / d)$$

用欧拉筛预处理 $\varphi(1 \sim \max(N,M))$，再枚举 $x$ 的因子 $d$（只枚举到 $\sqrt x$，因子成对出现）即可 $O(\sqrt x)$ 求出 $f(x)$。最后把 $f(N)$ 与 $f(M)$ 相乘并对 $998244353$ 取模。

复杂度：时间 $O(\max(N,M) + \sqrt N + \sqrt M)$，空间 $O(\max(N,M))$。

## 仓颉实现

<details>
<summary>查看仓颉实现</summary>

```cangjie
import std.collection.*
import std.convert.*
import std.env.*

func gcdSum(x: Int64, phi: Array<Int64>): Int64 {
    var res: Int64 = 0
    var d: Int64 = 1
    while (d * d <= x) {
        if (x % d == 0) {
            res = res + d * phi[x / d]
            if (d * d != x) {
                res = res + (x / d) * phi[d]
            }
        }
        d = d + 1
    }
    return res
}

main() {
    let reader = getStdIn()
    let line = reader.readln().getOrThrow().split(" ", removeEmpty: true).map({ p => Int64.parse(p) })
    let n = line[0]
    let m = line[1]
    let maxv = if (n > m) { n } else { m }
    let phi = Array<Int64>(maxv + 1, { _ => 0 })
    let isComp = Array<Bool>(maxv + 1, { _ => false })
    let primes = ArrayList<Int64>()
    phi[1] = 1
    for (i in 2..(maxv + 1)) {
        if (!isComp[i]) {
            primes.add(i)
            phi[i] = i - 1
        }
        for (p in primes) {
            if (i * p > maxv) {
                break
            }
            isComp[i * p] = true
            if (i % p == 0) {
                phi[i * p] = phi[i] * p
                break
            } else {
                phi[i * p] = phi[i] * (p - 1)
            }
        }
    }
    let MOD: Int64 = 998244353
    println(gcdSum(n, phi) % MOD * (gcdSum(m, phi) % MOD) % MOD)
}
```

</details>
