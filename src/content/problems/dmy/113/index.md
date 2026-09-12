---
oj: dmy
pid: '113'
title: '[R19E]区间和'
difficulty: 提高+/省选-
tags:
  - 组合数学
  - 计数
timeLimit: 2s
memoryLimit: 512m
---

## 题目

给定整数序列 $a$，定义 $f(l,r)$ 为 $a_l,a_{l+1},\dots,a_r$ 中**出现奇数次的数字之和**。求

$$
\sum_{i=1}^{n}\sum_{j=i}^{n}f(i,j)\bmod 998244353。
$$

> 对于 $100\%$ 的数据，$1\le n\le 5\times 10^5$，$1\le a_i\le 10^9$。

## 思路

按值分别统计贡献。对每个值 $x$，它贡献到答案的区间恰好是「$x$ 在区间内出现奇数次」的区间，因此只需统计这样的区间数，再乘上 $x$。

设 $x$ 的出现位置为 $p_1<p_2<\cdots<p_m$，记 $s_t$ 为前 $t$ 个元素中 $x$ 出现次数的奇偶性（$t=0,1,\dots,n$，$s_0=0$）。区间 $[l,r]$ 内 $x$ 出现奇数次当且仅当 $s_{l-1}\ne s_r$，所以满足条件的区间数为「奇偶性为 $0$ 的前缀数」$\times$「奇偶性为 $1$ 的前缀数」。

$s_t$ 只在 $x$ 出现的位置处翻转，故奇偶性为 $1$ 的前缀覆盖区间

$$
[p_1,p_2-1],\ [p_3,p_4-1],\ [p_5,p_6-1],\ \dots
$$

若 $m$ 为奇数，末尾还有一段 $[p_m,n]$。于是

$$
cnt_1=\sum_{k\text{ 为奇数}}(p_{k+1}-p_k)+[m\text{ 为奇数}]\cdot(n-p_m+1),
$$

$$
cnt_0=n+1-cnt_1,
$$

贡献为 $x\cdot cnt_0\cdot cnt_1$。

实现时把数对 $(a_i,i)$ 编码成 $a_i\times n+i$ 后排序，同一值的下标自然聚在一起，对每组出现位置用上述公式 $O(1)$ 均摊地统计即可。注意 $a_i$ 可达 $10^9$，先对 $x$ 取模再乘，避免中间结果溢出 `Int64`。

## 复杂度

- 时间复杂度：$O(n\log n)$，由排序主导。
- 空间复杂度：$O(n)$。

## 仓颉实现

```cangjie
import std.env.*
import std.convert.*
import std.sort.*

main() {
    let reader = getStdIn()
    let n = Int64.parse(reader.readln().getOrThrow())
    let nn = n
    let a = reader.readln().getOrThrow().split(" ", removeEmpty: true).map({ p: String => Int64.parse(p) })

    // 编码 (a_i, i) 为 a_i * n + i，排序后按值分组
    var enc = Array<Int64>(nn, { _ => 0 })
    for (i in 0..nn) {
        enc[i] = a[i] * nn + i
    }
    sort(enc)

    let MOD: Int64 = 998244353
    var ans: Int64 = 0
    var i: Int64 = 0
    while (i < nn) {
        let v = enc[i] / nn
        var j = i
        while (j < nn && enc[j] / nn == v) {
            j += 1
        }
        let m = j - i
        // 前缀奇偶性为 1 的前缀个数：
        // 每对相邻位置 (p_k, p_{k+1}) 贡献 p_{k+1} - p_k，m 为奇数时最后一段 [p_m, n] 贡献 n - p_m
        var cnt1: Int64 = 0
        var k: Int64 = 0
        while (k + 1 < m) {
            cnt1 += (enc[i + k + 1] % nn) - (enc[i + k] % nn)
            k += 2
        }
        if (m % 2 == 1) {
            cnt1 += nn - (enc[i + m - 1] % nn)
        }
        let cnt0 = nn + 1 - cnt1
        let c = (cnt0 % MOD) * (cnt1 % MOD) % MOD
        ans = (ans + (v % MOD) * c) % MOD
        i = j
    }
    println(ans)
}
```
