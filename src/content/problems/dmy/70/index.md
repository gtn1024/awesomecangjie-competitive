---
oj: dmy
pid: '70'
title: '[R12D] 二维gcd和3'
difficulty: 普及-
tags:
  - 数论
  - 欧拉函数
timeLimit: 1s
memoryLimit: 512m
---

> 数据规模：$1 \le N \le 3 \times 10^6$。

## 思路

直接 $O(N^2)$ 枚举 $(i, j)$ 会超时，需要降维。

关键观察：$\gcd(i, N)$ 一定是 $N$ 的因数，所以先对 $i$ 按 $d_i = \gcd(i, N)$ 分组。令 $f[d]$ 表示满足 $\gcd(i, N) = d$ 的 $i$ 的个数。由经典结论，这等价于 $\gcd(i/d, N/d) = 1$，在 $1 \le i \le N$ 范围内恰有 $\varphi(N/d)$ 个，因此

$$f[d] = \varphi(N/d), \quad d \mid N.$$

同样地，$\gcd(j, N)$ 也只能取 $N$ 的因数。于是把求和按因数分组：

$$\text{ans} = \sum_{d_1 \mid N}\sum_{d_2 \mid N} \gcd(d_1, d_2)\cdot f[d_1]\cdot f[d_2].$$

算法只需：枚举 $N$ 的所有因数 $d$（枚举到 $\sqrt N$，因数成对出现），对每个因数 $d$ 用 $O(\sqrt N)$ 的分解计算 $\varphi(N/d)$；再两两枚举因数 $d_1, d_2$ 累加 $\gcd(d_1,d_2)\cdot f[d_1]\cdot f[d_2]$。$N$ 的不同因数个数不超过 $2\sqrt N$，所以因数两两配对的复杂度为 $O(\sqrt N \cdot \sqrt N)$ 量级，远小于时限。

注意三个数相乘可能溢出 `Int64`，每步都要对 $998244353$ 取模。

复杂度：时间 $O(N^{2/3})$ 左右（因数个数实际远小于 $\sqrt N$），空间 $O(\sqrt N)$。

## 仓颉实现

```cangjie
import std.collection.ArrayList
import std.console.*
import std.convert.*

main(): Int64 {
    let MOD: Int64 = 998244353
    let reader = Console.stdIn
    let n = Int64.parse(reader.readln().getOrThrow())

    // 欧拉函数 phi(x)
    func phi(x: Int64): Int64 {
        var r = x
        var t = x
        var p: Int64 = 2
        while (p * p <= t) {
            if (t % p == 0) {
                r = r / p * (p - 1)
                while (t % p == 0) {
                    t = t / p
                }
            }
            p += 1
        }
        if (t > 1) {
            r = r / t * (t - 1)
        }
        return r
    }

    // 最大公约数
    func gcd(a: Int64, b: Int64): Int64 {
        var x = a
        var y = b
        while (y != 0) {
            let t = x % y
            x = y
            y = t
        }
        return x
    }

    // 枚举 N 的所有因数 d，并记录 f[d] = phi(N/d) = gcd(i,N)=d 的 i 个数
    let divs = ArrayList<Int64>()
    let fs = ArrayList<Int64>()
    var d: Int64 = 1
    while (d * d <= n) {
        if (n % d == 0) {
            divs.add(d)
            fs.add(phi(n / d) % MOD)
            if (d != n / d) {
                divs.add(n / d)
                fs.add(phi(d) % MOD)
            }
        }
        d += 1
    }

    // 答案 = sum_{d1,d2 | N} gcd(d1,d2) * f[d1] * f[d2] (mod MOD)
    var ans: Int64 = 0
    let m = divs.size
    var i = 0
    while (i < m) {
        var j = 0
        while (j < m) {
            let g = gcd(divs[i], divs[j])
            // 三个数相乘可能溢出，分步取模
            ans = (ans + g % MOD * (fs[i] * fs[j] % MOD)) % MOD
            j += 1
        }
        i += 1
    }
    println(ans)
    return 0
}
```

要点：

- 把 $\gcd(i,N)$、$\gcd(j,N)$ 都按 $N$ 的因数分组，把 $O(N^2)$ 的双重求和降维成「因数两两配对」的二重求和。
- $\gcd(i,N)=d \iff \gcd(i/d, N/d)=1$，故计数 $f[d]=\varphi(N/d)$，避免线性筛，对每个因数 $O(\sqrt N)$ 分解即可。
- 三个数 $\gcd(d_1,d_2)\cdot f[d_1]\cdot f[d_2]$ 相乘先取模再相乘，防止溢出。
