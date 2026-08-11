---
oj: dmy
pid: '258'
title: '[R42C]神奇宝箱'
difficulty: 提高
tags:
  - 数学
  - 等比数列
  - 前缀和
  - 取模
timeLimit: 1s
memoryLimit: 512m
---

> 数据规模：$1 \le n \le 10^{12}$，答案对 $998244353$ 取模。

## 思路

宝石的等级序列为 $1,\ 2,2,\ 3,3,3,3,\ 4,\dots$：第 $i$ 批恰有 $2^{i-1}$ 颗等级为 $i$ 的宝石，占据队伍中的位置 $2^{i-1}, 2^{i-1}+1, \dots, 2^{i}-1$。每颗宝石的能量为 $\text{等级}\times\text{位置}\times 2$，$n$ 高达 $10^{12}$，必须做到 $O(\log n)$。

先定位前 $n$ 颗宝石覆盖到了哪几批。设 $b$ 为最大的满足 $2^b - 1 \le n$ 的整数（即前 $b$ 批被完整取走，共 $2^b-1$ 颗），则剩下的 $r = n - (2^b-1)$ 颗来自第 $b+1$ 批的前 $r$ 个位置。由于 $n \le 10^{12} < 2^{40}$，$b \le 40$，批数极少。

第 $i$ 批（完整）的能量为

$$
E_i = 2 \cdot i \cdot \sum_{k=2^{i-1}}^{2^i-1} k = 2 \cdot i \cdot \frac{(2^{i-1}+2^i-1)\cdot 2^{i-1}}{2}
$$

用等差数列求和公式可直接算出位置之和，再乘以等级和因子 $2$ 即得该批能量。

对剩余的第 $b+1$ 批，等级为 $b+1$，位置为 $2^b, 2^b+1, \dots, 2^b+r-1$，位置之和同样是等差求和：

$$
S_{\text{剩}} = \frac{(2^b + 2^b + r - 1)\cdot r}{2}
$$

所有运算都在模 $p=998244353$ 下进行。除以 $2$ 转化为乘 $2$ 的逆元 $(p+1)/2$；$2^k$ 这种大数用快速幂在模域里计算，避免溢出。最终答案为「前 $b$ 批能量之和」加上「剩余部分的能量」，对 $p$ 取模。

## 复杂度

批数 $b \le 40$，每批调用一次 $O(\log i)$ 的快速幂，总时间复杂度 $O(\log^2 n)$，空间复杂度 $O(1)$。

## 仓颉实现

```cangjie
import std.convert.*
import std.env.*

let p: Int64 = 998244353

func powMod(a: Int64, e: Int64): Int64 {
    var base = a % p
    var exp = e
    var res: Int64 = 1
    while (exp > 0) {
        if (exp % 2 == 1) {
            res = (res * base) % p
        }
        base = (base * base) % p
        exp = exp / 2
    }
    return res
}

main() {
    let reader = getStdIn()
    let n = Int64.parse(reader.readln().getOrThrow())
    // find largest b such that 2^b - 1 <= n, i.e. full batches are 1..b
    var b: Int64 = 0
    var pow2: Int64 = 1 // 2^b
    while (pow2 - 1 <= n) {
        b = b + 1
        pow2 = pow2 * 2
    }
    b = b - 1
    // now 2^b - 1 <= n < 2^(b+1) - 1
    // full batches count = b, gems = 2^b - 1
    var ans: Int64 = 0
    // sum over i = 1..b of energy of batch i
    // batch i: positions 2^(i-1) .. 2^i - 1, level i, count 2^(i-1)
    // position sum = (2^(i-1) + 2^i - 1) * 2^(i-1) / 2
    // energy = 2 * i * positionSum
    var i: Int64 = 1
    while (i <= b) {
        let powIm1 = powMod(2, i - 1) // 2^(i-1) mod p
        let powI = (powIm1 * 2) % p   // 2^i mod p
        // position sum = (2^(i-1) + 2^i - 1) * 2^(i-1) / 2
        let first = powIm1
        let last = (powI - 1 + p) % p
        let s = (first + last) % p
        let cnt = powIm1
        let inv2 = (p + 1) / 2 // inverse of 2 mod p
        let posSum = (((s * cnt) % p) * inv2) % p
        let two: Int64 = 2
        let energy = (((two * (i % p)) % p) * posSum) % p
        ans = (ans + energy) % p
        i = i + 1
    }
    // full gems before batch b+1 = 2^b - 1 (b <= 40, safe as integer)
    var fullGems: Int64 = 1
    var j: Int64 = 0
    while (j < b) {
        fullGems = fullGems * 2
        j = j + 1
    }
    fullGems = fullGems - 1
    let r = n - fullGems
    if (r > 0) {
        let level = b + 1
        // positions 2^b .. 2^b + r - 1, level b+1
        let powB = powMod(2, b) // 2^b mod p
        // position sum = (2^b + 2^b + r - 1) * r / 2
        let lastMod = (powB + (r % p) % p - 1 + p) % p
        let s = (powB + lastMod) % p
        let inv2 = (p + 1) / 2
        let posSum = (((s * (r % p)) % p) * inv2) % p
        let two: Int64 = 2
        let energy = (((two * (level % p)) % p) * posSum) % p
        ans = (ans + energy) % p
    }
    println(ans)
}
```
