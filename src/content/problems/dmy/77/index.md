---
oj: dmy
pid: '77'
title: '[R13E] 合成球2'
difficulty: 普及-
tags:
  - 计数
  - 快速幂
  - 费马小定理
timeLimit: 1s
memoryLimit: 512m
---

> 数据规模：$1 \le n \le 10^{10^6}$（以十进制串给出），$2 \le k \le 10^6$。

## 思路

与给定颜色序列、问合成方案数的题不同，本题问的是：每个球颜色任意取 $1\sim k$，有多少种初始情况最终能合成出颜色 $1$。

关键是合成规则——新球颜色由你从合成前的两个球颜色中任选。于是：

- 只要初始情况中 **至少有一个颜色为 $1$ 的球**，每轮合成时都把颜色 $1$ 保留下来，最后一定得到颜色 $1$；
- 反之，若初始全是 $2\sim k$，则任你怎么合成都产生不出颜色 $1$。

所以答案是「所有初始情况」减去「全不为 $1$ 的初始情况」：

$$\text{ans}=k^n-(k-1)^n \pmod{998244353}$$

### 大指数取模

$n$ 以最多 $10^6$ 位的十进制串给出。模数 $P=998244353$ 是质数，$k$ 与 $k-1$ 都与 $P$ 互质，由费马小定理 $a^{P-1}\equiv 1\pmod P$ 得

$$a^n \equiv a^{\,n\bmod(P-1)}\pmod P$$

于是把 $n$ 当字符串逐位算出 $y=n\bmod(P-1)$（每一位 `y=(y*10+d) mod (P-1)`），再用快速幂分别算 $k^y$ 与 $(k-1)^y$ 即可。逐位取模是 $O(|n|)$，快速幂是 $O(\log P)$。

注意 $n=1$ 时 $(k-1)^1=k-1$，公式仍然成立，无需特判；减法结果加模取模避免负数。

## 仓颉实现

<details>
<summary>查看仓颉实现</summary>

```cangjie
import std.convert.*
import std.env.*

let MOD: Int64 = 998244353

func qpow(base: Int64, exp: Int64): Int64 {
    var b = base % MOD
    if (b < 0) {
        b = b + MOD
    }
    var e = exp
    var r: Int64 = 1
    while (e > 0) {
        if (e % 2 == 1) {
            r = r * b % MOD
        }
        b = b * b % MOD
        e = e / 2
    }
    return r
}

main() {
    let reader = getStdIn()
    let line = reader.readln().getOrThrow()
    let parts = line.split(" ", removeEmpty: true)
    let nStr = parts[0]
    let k = Int64.parse(parts[1])
    // y = n mod (MOD-1)，n 是超大十进制串
    let phi = MOD - 1
    var y: Int64 = 0
    for (ch in nStr) {
        let d = Int64(UInt32(ch) - UInt32(r'0'))
        y = (y * 10 % phi + d % phi) % phi
    }
    let kk = k % MOD
    let kk1 = (k - 1) % MOD
    let ans = (qpow(kk, y) - qpow(kk1, y) + MOD) % MOD
    println("${ans}")
}
```

</details>

要点：

- 题眼是看出「存在颜色 $1$ 即可合成出颜色 $1$」，把计数问题化成总数减补集。
- 超大 $n$ 不能转整数，要用费马小定理把指数降到 $P-1$ 范围内，逐位取模。
- `for (ch in nStr)` 得到的是 `UInt8` 字节，先经 `UInt32` 再 `Int64` 转成数字。
