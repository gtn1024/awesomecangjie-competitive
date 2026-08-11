---
oj: dmy
pid: '352'
title: '[R56E] 移位和'
difficulty: 普及+/提高
tags:
  - 数学
  - 前缀和
timeLimit: 1s
memoryLimit: 256m
---

> 数据规模：$1 \le n, m \le 10^6$，$0 \le l_i \le 10^9$。

## 思路

循环右移 $n$ 次后数字串恢复原样，因此 $f(l_i)$ 只取决于 $k = l_i \bmod n$，问题转化为求循环右移 $k$ 位后整数的数值。

记原数字串为 $a_1 a_2 \dots a_n$，右移 $k$ 位（$1 \le k \le n - 1$）得到 $a_{n-k+1} \dots a_n a_1 \dots a_{n-k}$，其数值为：

$$
f(k) = \underbrace{a_{n-k+1}\dots a_n}_{S_k} \cdot 10^{n-k} + \underbrace{a_1 \dots a_{n-k}}_{P_k}
$$

其中 $S_k$ 是后缀 $a_{n-k+1}\dots a_n$ 的数值，$P_k$ 是前缀 $a_1\dots a_{n-k}$ 的数值。预处理三个数组（均对 $M = 10^9+7$ 取模）：

- $p_i = 10^i \bmod M$，$10$ 的幂；
- $pre_i$：前缀 $a_1 \dots a_i$ 的数值；
- $suf_i$：后缀 $a_i \dots a_n$ 的数值。

于是 $S_k = suf_{n-k+1}$，$P_k = pre_{n-k}$，代入得：

$$
f(k) = suf_{n-k+1} \cdot p_{n-k} + pre_{n-k}
$$

$k = 0$ 时 $f(0)$ 就是原数，即 $pre_n$。对每个 $l_i$ 取 $k = l_i \bmod n$ 后 $O(1)$ 累加即可。运算中两个因子都小于 $10^9+7$，乘积不超过 $10^{18}$，64 位整数不会溢出。

复杂度：时间 $O(n + m)$，空间 $O(n)$。

## 仓颉实现

```cangjie
import std.env.*
import std.convert.*

main(): Int64 {
    let reader = getStdIn()
    let first = reader.readln().getOrThrow().split(" ", removeEmpty: true).map({ p: String => Int64.parse(p) })
    let n = first[0]
    let m = first[1]
    let xs = reader.readln().getOrThrow()
    let MOD: Int64 = 1000000007

    // pow10[i] = 10^i mod MOD, pre[i] = a[0..i-1] 的数值 mod MOD
    let pow10 = Array<Int64>(n + 1, { _ => 0 })
    let pre = Array<Int64>(n + 1, { _ => 0 })
    pow10[0] = 1
    var i: Int64 = 0
    for (ch in xs) {
        let d = Int64(ch) - 48
        pre[i + 1] = (pre[i] * 10 + d) % MOD
        pow10[i + 1] = pow10[i] * 10 % MOD
        i = i + 1
    }

    // suf[k] = a[k..n-1] 的数值 mod MOD
    let suf = Array<Int64>(n + 1, { _ => 0 })
    var cur: Int64 = 0
    var k = n - 1
    while (k >= 0) {
        let d = Int64(xs[k]) - 48
        cur = (cur + d * pow10[n - 1 - k]) % MOD
        suf[k] = cur
        k = k - 1
    }

    var ans: Int64 = 0
    let ls = reader.readln().getOrThrow().split(" ", removeEmpty: true).map({ p: String => Int64.parse(p) })
    for (li in ls) {
        let k = li % n
        if (k == 0) {
            ans = (ans + pre[n]) % MOD
        } else {
            // 右移 k 位：前 k 位是后缀 a[n-k..n-1]，后 n-k 位是前缀 a[0..n-k-1]
            ans = (ans + suf[n - k] * pow10[n - k] + pre[n - k]) % MOD
        }
    }
    println(ans)
    return 0
}
```
