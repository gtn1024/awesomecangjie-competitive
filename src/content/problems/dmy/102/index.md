---
oj: dmy
pid: '102'
title: '[R17F]wow2'
difficulty: 提高
tags:
  - 递推
  - 矩阵快速幂
timeLimit: 1s
memoryLimit: 512m
---

## 题目

给定两个由 `w` 和 `o` 组成的字符串 $S_1,S_2$，按斐波那契方式构造字符串 $S_i=S_{i-2}+S_{i-1}$（$i\ge 3$），求 $S_n$ 中连续子串 `wow` 的出现次数，对 $998244353$ 取模。

> 对于 $100\%$ 的数据，$1\le T\le 100$，$3\le n\le 10^{18}$，$S_1,S_2$ 的长度都不超过 $10$。

## 思路

设 $f_i$ 为 $S_i$ 中 `wow` 的出现次数，把 $S_i=S_{i-2}+S_{i-1}$ 代入后，`wow` 的计数由三部分组成：完全在 $S_{i-2}$ 内的、完全在 $S_{i-1}$ 内的、以及跨过分界线的，即

$$
f_i=f_{i-2}+f_{i-1}+c_i,
$$

其中 $c_i$ 是跨过 $S_{i-2}$ 与 $S_{i-1}$ 分界线的 `wow` 个数。跨过分界线的 `wow` 起始位置只能是 $S_{i-2}$ 的倒数第 $2$ 个或倒数第 $1$ 个字符处，因此 $c_i$ 只取决于 $S_{i-2}$ 的最后 $2$ 个字符和 $S_{i-1}$ 的前几个字符。

**关键观察**：前缀和后缀很快稳定下来。当 $S_{i-1}$ 足够长时，拼接后 $S_i$ 的**最后 2 个字符**等于 $S_{i-1}$ 的最后 2 个字符，**前 3 个字符**等于 $S_{i-2}$ 的前 3 个字符。于是：

- 后缀 $\mathrm{suf}_2(S_j)$ 从 $j=7$ 起恒等于 $\mathrm{suf}_2(S_6)$；
- 前缀 $\mathrm{pre}_3(S_j)$ 从 $j=9$ 起按奇偶交替：奇数 $j$ 取 $\mathrm{pre}_3(S_7)$，偶数 $j$ 取 $\mathrm{pre}_3(S_6)$。

所以从 $i=9$ 开始，$c_i$ 只按 $i$ 的奇偶取两个常数 $c_9,c_{10}$，递推变为带常数的线性递推 $f_i=f_{i-1}+f_{i-2}+c_{i\text{ 的奇偶}}$，可以用矩阵快速幂在 $O(\log n)$ 内求出 $f_n$。

实现上先把 $S_1\sim S_8$ 直接构造出来（长度不超过 $210$），暴力数出 $f_1\sim f_8$。向量 $v_i=[f_i,f_{i-1},1]^T$ 满足

$$
v_{i+1}=\begin{pmatrix}1&1&c_{i+1}\\1&0&0\\0&0&1\end{pmatrix}v_i.
$$

令 $A_9=A(c_9)$、$A_{10}=A(c_{10})$，从 $i=9$ 到 $n$ 共 $k=n-8$ 步，转移矩阵按奇偶交替：$k$ 为偶数时 $P=(A_{10}A_9)^{k/2}$，$k$ 为奇数时 $P=A_9\cdot(A_{10}A_9)^{k/2}$。对 $A_{10}A_9$ 做矩阵快速幂即可，答案为 $(Pv_8)_0$。所有中间量对 $998244353$ 取模，$3\times3$ 矩阵乘法中乘积不超过约 $10^{18}$，`Int64` 足够。

## 复杂度

- 时间复杂度：每组数据 $O(27\log n)$，即 $O(\log n)$ 次 $3\times3$ 矩阵乘法。
- 空间复杂度：$O(1)$，只需保存 $S_1\sim S_8$ 与常数个矩阵。

## 仓颉实现

```cangjie
import std.convert.*
import std.env.*
import std.console.*

let MOD: Int64 = 998244353

func countWow(s: String): Int64 {
    let rs = s.toRuneArray()
    var cnt: Int64 = 0
    var i = 0
    while (i + 2 < rs.size) {
        if (rs[i] == r'w' && rs[i + 1] == r'o' && rs[i + 2] == r'w') {
            cnt = cnt + 1
        }
        i = i + 1
    }
    return cnt
}

// 跨过 A|B 分界线的 wow 个数：只统计窗口位置 0 和 1 起始的两种
func crossWow(u: String, v: String): Int64 {
    let ur = u.toRuneArray()
    let vr = v.toRuneArray()
    var cnt: Int64 = 0
    if (ur[0] == r'w' && ur[1] == r'o' && vr[0] == r'w') {
        cnt = cnt + 1
    }
    if (ur[1] == r'w' && vr[0] == r'o' && vr[1] == r'w') {
        cnt = cnt + 1
    }
    return cnt
}

func suf2(s: String): String {
    let rs = s.toRuneArray()
    let b = StringBuilder()
    b.append(rs[rs.size - 2])
    b.append(rs[rs.size - 1])
    return b.toString()
}

func pre3(s: String): String {
    let rs = s.toRuneArray()
    let b = StringBuilder()
    b.append(rs[0])
    b.append(rs[1])
    b.append(rs[2])
    return b.toString()
}

func matMul(a: Array<Array<Int64>>, b: Array<Array<Int64>>): Array<Array<Int64>> {
    var r = Array<Array<Int64>>(3, { _ => Array<Int64>(3, { _ => 0 }) })
    for (i in 0..3) {
        for (k in 0..3) {
            let aik = a[i][k]
            if (aik == 0) {
                continue
            }
            for (j in 0..3) {
                r[i][j] = (r[i][j] + aik * b[k][j]) % MOD
            }
        }
    }
    return r
}

func matPow(a: Array<Array<Int64>>, e: Int64): Array<Array<Int64>> {
    var base = a
    var ex = e
    var res = Array<Array<Int64>>(3, { _ => Array<Int64>(3, { _ => 0 }) })
    for (i in 0..3) {
        res[i][i] = 1
    }
    while (ex > 0) {
        if (ex % 2 == 1) {
            res = matMul(res, base)
        }
        base = matMul(base, base)
        ex = ex / 2
    }
    return res
}

// 转移矩阵 [f_{i+1}, f_i, 1]^T = A(c) * [f_i, f_{i-1}, 1]^T
func makeA(c: Int64): Array<Array<Int64>> {
    var a = Array<Array<Int64>>(3, { _ => Array<Int64>(3, { _ => 0 }) })
    a[0][0] = 1
    a[0][1] = 1
    a[0][2] = c % MOD
    a[1][0] = 1
    a[2][2] = 1
    return a
}

func solve(n: Int64, s1: String, s2: String): Int64 {
    if (s1.size + s2.size == 0) {
        return 0
    }
    let s3 = s1 + s2
    let s4 = s2 + s3
    let s5 = s3 + s4
    let s6 = s4 + s5
    let s7 = s5 + s6
    let s8 = s6 + s7
    let f3 = countWow(s3)
    let f4 = countWow(s4)
    let f5 = countWow(s5)
    let f6 = countWow(s6)
    let f7 = countWow(s7)
    let f8 = countWow(s8)
    if (n == 3) { return f3 % MOD }
    if (n == 4) { return f4 % MOD }
    if (n == 5) { return f5 % MOD }
    if (n == 6) { return f6 % MOD }
    if (n == 7) { return f7 % MOD }
    if (n == 8) { return f8 % MOD }
    // n >= 9：suf2(S_j) = suf2(S6) 对所有 j >= 7 成立；
    // pre3 按奇偶交替：奇数 i 用 pre3(S7)，偶数 i 用 pre3(S6)
    let su = suf2(s6)
    let c9 = crossWow(su, pre3(s6))
    let c10 = crossWow(su, pre3(s7))
    let a9 = makeA(c9)
    let a10 = makeA(c10)
    let d = matMul(a10, a9)
    let k = n - 8
    let m = k / 2
    var p = matPow(d, m)
    if (k % 2 == 1) {
        p = matMul(a9, p)
    }
    let f8m = f8 % MOD
    let f7m = f7 % MOD
    let ans = (p[0][0] * f8m + p[0][1] * f7m + p[0][2]) % MOD
    return ans
}

main() {
    let reader = Console.stdIn
    let t = Int64.parse(reader.readln().getOrThrow())
    for (tc in 0..t) {
        let parts = reader.readln().getOrThrow().split(" ", removeEmpty: true)
        let n = Int64.parse(parts[0])
        let s1 = parts[1]
        let s2 = parts[2]
        println(solve(n, s1, s2))
    }
}
```
