---
oj: dmy
pid: '134'
title: '[R22F]子序列计数'
difficulty: 提高
tags:
  - 组合数学
timeLimit: 1s
memoryLimit: 256m
---

## 题目

给定字符串 $s$ 与 $t$，考虑 $s$ 的所有互不相同的重排列（多重集排列），对每个重排列统计 $t$ 作为子序列出现的次数，求所有这些统计结果之和，对 $998244353$ 取模。

> 对于 $100\%$ 的数据，$1\le |s|\le 500$，$1\le |t|\le 3$，字符串 $s$ 和 $t$ 仅由小写字母组成。

## 思路

记 $n=|s|$，$k=|t|$，$c_a$ 为字母 $a$ 在 $s$ 中出现的次数，$r_a$ 为字母 $a$ 在 $t$ 中出现的次数。

把「$s$ 的一个重排列」和「$t$ 在其中作为子序列出现的一组位置 $1\le i_1<i_2<\cdots<i_k\le n$」作为一个整体计数，答案就是这个整体计数。换一种视角：先固定位置的选择，再数有多少个重排列在这些位置上恰好依次填入 $t_1,t_2,\dots,t_k$。

固定位置后，这 $k$ 个位置的字符已确定，剩余 $n-k$ 个位置要填入剩余字母的多重集 $\{c_a-r_a\}$，可填出的不同重排列数为

$$
\frac{(n-k)!}{\prod_a (c_a-r_a)!},
$$

当某个字母满足 $c_a<r_a$（即 $t$ 的字母多重集不是 $s$ 的子多重集）时该值为 $0$。这个数量只取决于 $t$ 的字母多重集，与具体位置无关；而位置的选择共有 $\binom{n}{k}$ 种，因此答案为

$$
\binom{n}{k}\cdot\frac{(n-k)!}{\prod_a (c_a-r_a)!}
=\frac{n!}{k!\prod_a (c_a-r_a)!}.
$$

**验证**：$s=$ `aabb` 时重排列为 `aabb`、`abab`、`abba`、`baab`、`baba`、`bbaa`，$t=$ `ab` 的出现次数分别为 $4,3,2,2,1,0$，总和 $12$，而 $4!/(2!\cdot1!\cdot1!)=12$，两者一致。

由于 $n\le 500<998244353$ 且模数是质数，分母中每个阶乘都非零、可逆。分子分母各自对模数取模后，用快速幂求 $x^{p-2}$ 作为 $x$ 的逆元（费马小定理），乘回分子即可。

## 复杂度

- 时间复杂度：$O(|\Sigma|\cdot n)$，其中 $|\Sigma|=26$，另有 $O(\log p)$ 的快速幂求逆元。
- 空间复杂度：$O(|\Sigma|)$。

## 仓颉实现

<details>
<summary>查看仓颉实现</summary>

```cangjie
import std.env.*
import std.convert.*

const MOD: Int64 = 998244353

func modpow(base0: Int64, exp0: Int64): Int64 {
    var base = base0 % MOD
    var exp = exp0
    var res: Int64 = 1
    while (exp > 0) {
        if ((exp & 1) == 1) {
            res = (res * base) % MOD
        }
        base = (base * base) % MOD
        exp = exp / 2
    }
    return res
}

main(): Int64 {
    let reader = getStdIn()
    let s = reader.readln().getOrThrow()
    let t = reader.readln().getOrThrow()

    let cs = Array<Int64>(26, { _ => 0 })
    for (ch in s) {
        cs[Int64(ch) - 97] += 1
    }
    let ct = Array<Int64>(26, { _ => 0 })
    for (ch in t) {
        ct[Int64(ch) - 97] += 1
    }

    let n = s.size
    let k = t.size

    var fact: Int64 = 1
    var i: Int64 = 2
    while (i <= n) {
        fact = (fact * i) % MOD
        i += 1
    }

    var denom: Int64 = 1
    i = 2
    while (i <= k) {
        denom = (denom * i) % MOD
        i += 1
    }
    var a: Int64 = 0
    while (a < 26) {
        let left = cs[a] - ct[a]
        if (left < 0) {
            println("0")
            return 0
        }
        i = 2
        while (i <= left) {
            denom = (denom * i) % MOD
            i += 1
        }
        a += 1
    }

    println(((fact * modpow(denom, MOD - 2)) % MOD).toString())
    return 0
}
```

</details>
