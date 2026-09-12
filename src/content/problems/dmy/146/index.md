---
oj: dmy
pid: '146'
title: '[R24E]成环概率'
difficulty: 提高
tags:
  - DP
  - 概率
  - 组合数学
timeLimit: 1s
memoryLimit: 512m
---

> 对于 $20\%$ 的数据，$1 \leq n \leq 5$；对于 $50\%$ 的数据，$1 \leq n \leq 100$；对于 $100\%$ 的数据，$1 \leq n \leq 1000$。

## 思路

把 $2n$ 个绳头编号，随机配对等价于 $2n$ 个标号点上的均匀随机完美匹配。考虑如下**确定性顺序过程**：每次取编号最小的未配对绳头，从其余未配对绳头中等概率选一个与之相连。每个配对方案恰好被生成一次且概率相等，因此可以按这个过程递推环数的分布。

**关键观察**：过程中已被连成一片的绳子构成若干条「链」，每条链恰好有两个游离绳头（单根未配对的绳子也是长度为 1 的链）。链的具体形状不影响后续，状态只需要链的数量 $m$。取最小游离绳头，它的配对端只有两类情况：

- 与同链的另一个游离绳头配对（仅 1 种选法）：该链闭合，形成一个环；
- 与其他链的某个游离绳头配对（共 $2m-2$ 种选法）：两条链合并成一条新链，环数不变。

设 $h(m, c)$ 为还剩 $m$ 条链时、最终恰好还能形成 $c$ 个环的配对方案数，则

$$h(m, c) = h(m-1, c-1) + (2m-2) \cdot h(m-1, c), \qquad h(0, 0) = 1.$$

递推可在**一维数组**上按 $c$ 从 $m$ 递减到 $1$ 滚动完成。总方案数为 $(2n-1)!! = 1 \cdot 3 \cdots (2n-1)$，恰好形成 $k$ 个环的概率即

$$\Pr(k) = \frac{h(n, k)}{(2n-1)!!} \pmod{998244353},$$

分母用费马小定理求逆元。验证 $n = 2$：$h(2,1) = 2$、$h(2,2) = 1$，概率分别为 $2/3$、$1/3$，与样例一致。

## 复杂度

状态数 $O(n^2)$，每次转移 $O(1)$，总时间复杂度 $O(n^2)$，空间 $O(n)$。$n \leq 1000$ 时轻松通过。

## 仓颉实现

```cangjie
import std.env.*
import std.convert.*

// Random pairing of the 2n rope ends, counted by the number of cycles the
// resulting loops form. Sequential view: repeatedly take the smallest
// unmatched end and pair it with a uniform random remaining end. Each
// currently open chain (a path of ropes already linked) has exactly two free
// ends, so the process state is only the number m of open chains.
//   - pair the two ends of the same chain: it closes into one cycle (1 way);
//   - pair with an end of another chain: the two chains merge (2m-2 ways).
// Let h[m][c] be the number of pairings of the remaining ends that yield
// exactly c more cycles. Then h[m][c] = h[m-1][c-1] + (2m-2) * h[m-1][c],
// h[0][0] = 1. Total pairings = (2n-1)!!, and answer for k cycles is
// h[n][k] / (2n-1)!! mod 998244353.

func powmod(a: Int64, e: Int64, m: Int64): Int64 {
    var res: Int64 = 1
    var base = a % m
    var exp = e
    while (exp > 0) {
        if (exp % 2 == 1) {
            res = res * base % m
        }
        base = base * base % m
        exp = exp / 2
    }
    return res
}

main() {
    let reader = getStdIn()
    let n = Int64.parse(reader.readln().getOrThrow())
    let MOD: Int64 = 998244353
    let nn = n
    var h = Array<Int64>(nn + 1, { _ => 0 })
    h[0] = 1
    var m: Int64 = 1
    while (m <= nn) {
        var c = m
        while (c >= 1) {
            h[c] = (h[c - 1] + h[c] * (2 * m - 2) % MOD) % MOD
            c -= 1
        }
        h[0] = 0
        m += 1
    }
    var total: Int64 = 1
    var i: Int64 = 1
    while (i <= 2 * nn - 1) {
        total = total * i % MOD
        i += 2
    }
    let invTotal = powmod(total, MOD - 2, MOD)
    var k: Int64 = 1
    while (k <= nn) {
        let prob = h[k] * invTotal % MOD
        if (k > 1) {
            print(" ")
        }
        print(prob)
        k += 1
    }
    println()
}
```
