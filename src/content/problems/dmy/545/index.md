---
oj: dmy
pid: '545'
title: '特殊二进制数'
difficulty: 提高
tags:
  - 数位DP
timeLimit: 1s
memoryLimit: 256m
---

> 数据规模：$1 \le N < 2^{1000}$，$0 \le k \le 1000$，$N$ 的二进制表示长度为 $1$ 到 $1000$ 且不含前导零。

## 思路

**把操作次数落到 $1$ 的个数上。** 记 $s(c)$ 为对整数 $c$ 反复取 popcount 直到变成 $1$ 的操作次数，即 $s(1)=0$，$s(c)=1+s(\mathrm{popcount}(c))$。由于 $\mathrm{popcount}(c)<c$（$c\ge2$），这个递推可以按 $c$ 从小到大直接算出。

对任意 $x>1$，第一次操作后得到 $\mathrm{popcount}(x)$，于是

$$\mathrm{steps}(x)=1+s(\mathrm{popcount}(x)).$$

因为 $x<2^{1000}$，$\mathrm{popcount}(x)\le 1000$，所以预先算好 $c=1,\dots,1000$ 的 $s(c)$ 就够用。题意要求 $\mathrm{steps}(x)=k$，等价于要求 $\mathrm{popcount}(x)=c$ 且 $s(c)=k-1$。问题因此拆成两层：先枚举所有满足 $s(c)=k-1$ 的 $c$，再数 $1$ 到 $N$ 中 `1` 的个数恰为 $c$ 的整数。

**数出「恰有 $c$ 个 1」的个数。** 设 $N$ 的二进制串长为 $L$，从高位到低位扫描，同时维护 $used$ 表示当前已经与 $N$ 的前缀完全相同时数到的 `1` 的个数。当扫描到某一位且 $N$ 的该位为 `1` 时，令这一位取 $0$、更前面的位仍与 $N$ 相同，得到的数就严格小于 $N$，并且这是「首次变得比 $N$ 小」的位置。此后剩余 $r=L-1-p$ 位可以任意填，要让总共有 $c$ 个 `1`，还需在其中放 $c-used$ 个，方案数为

$$\binom{r}{\,c-used\,}.$$

把所有这样的位置贡献累加，最后补上 $N$ 自己（当 $\mathrm{popcount}(N)=c$ 时 $+1$），就得到不超过 $N$ 且恰有 $c$ 个 `1` 的数的个数。每个数都唯一对应「首次变小的位置」，因此不重不漏。

**边界。** $c\ge1$ 时方案里不会数到 $0$，所以不必额外排除 $0$；但 $k=1$ 对应的 $c$ 是 $s(c)=0$ 的 $c=1$，此时 $x=1$ 也被计入（它确实只有一个 `1`），而 $\mathrm{steps}(1)=0$，故答案要减 $1$。$k=0$ 时只有 $x=1$ 符合，答案恒为 $1$（$N\ge1$ 保证它存在）。另外，$c\le1000$ 时 $s(c)\le4$，所以 $k$ 较大时答案直接为 $0$，无需特判也不会出错。

**组合数。** 模数 $10^9+7$ 是质数，且 $L\le1000<10^9+7$，用阶乘与其逆元算 $\binom{r}{j}$ 即可。

## 复杂度

预处理 $s(c)$ 为 $O(1000)$，阶乘与逆元 $O(L)$。统计部分对每个为 `1` 的位置枚举 $c$，总计 $O(L^2)$ 次组合数运算，时间 $O(L^2)$、空间 $O(L)$，$L\le1000$ 时约 $5\times10^5$ 次运算，远小于时限。

## 仓颉实现

<details>
<summary>查看仓颉实现</summary>

```cangjie
import std.env.*
import std.convert.*

const MOD: Int64 = 1000000007

func popcount(x: Int64): Int64 {
    var t = x
    var c: Int64 = 0
    while (t > 0) {
        c += t & 1
        t >>= 1
    }
    return c
}

func qpow(a: Int64, e: Int64): Int64 {
    var base = a % MOD
    var exp = e
    var res: Int64 = 1
    while (exp > 0) {
        if (exp % 2 == 1) {
            res = res * base % MOD
        }
        base = base * base % MOD
        exp >>= 1
    }
    return res
}

main() {
    let reader = getStdIn()
    let bits = reader.readln().getOrThrow().split(" ", removeEmpty: true)[0].toRuneArray()
    let k = Int64.parse(reader.readln().getOrThrow().split(" ", removeEmpty: true)[0])
    let n = bits.size
    if (k == 0) {
        println(1)
    } else {
        let steps = Array<Int64>(1001, { _ => 0 })
        for (c in 2..=1000) {
            steps[c] = 1 + steps[popcount(c)]
        }
        let fact = Array<Int64>(n + 1, { _ => 1 })
        for (i in 1..=n) {
            fact[i] = fact[i - 1] * i % MOD
        }
        let invfact = Array<Int64>(n + 1, { _ => 1 })
        invfact[n] = qpow(fact[n], MOD - 2)
        var i = n
        while (i > 0) {
            invfact[i - 1] = invfact[i] * i % MOD
            i -= 1
        }
        let cnt = Array<Int64>(n + 2, { _ => 0 })
        var used: Int64 = 0
        for (p in 0..n) {
            if (bits[p] == r'1') {
                let r = n - 1 - p
                for (j in 0..=r) {
                    let comb = fact[r] * invfact[j] % MOD * invfact[r - j] % MOD
                    cnt[used + j] = (cnt[used + j] + comb) % MOD
                }
                used += 1
            }
        }
        cnt[used] = (cnt[used] + 1) % MOD
        var ans: Int64 = 0
        for (c in 1..=n) {
            if (steps[c] == k - 1) {
                ans = (ans + cnt[c]) % MOD
            }
        }
        if (k == 1) {
            ans = (ans - 1 + MOD) % MOD
        }
        println(ans)
    }
}
```

</details>
