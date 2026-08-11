---
oj: dmy
pid: '401'
title: '[R64E] 4的倍数'
difficulty: 普及+/提高
tags:
  - 组合计数
  - 逆元
timeLimit: 1s
memoryLimit: 512m
---

> 数据规模：$1 \le k \le n \le 2 \times 10^5$。

## 思路

**关键性质：** 一个十进制整数是否为 4 的倍数，只取决于它的最后两位。设 $N = 100A + 10b + c$，其中 $b$、$c$ 分别是倒数第二位和最后一位。由于 $100 \equiv 0 \pmod 4$，所以 $N \bmod 4 = (10b + c) \bmod 4$，百位及更高位无论怎么选都不影响结果。

分两种情况：

- $k = 1$：长度为 1 的子序列就是单个数字，统计字符为 `0`、`4`、`8` 的位置数量即可。
- $k \ge 2$：从右往左扫描，枚举倒数第二位的位置 $i$，并维护 $cnt_d$ 表示位置 $i$ 右侧数字 $d$ 的出现次数。设 $S_i = v$，最后一位数字 $d$ 需要满足 $(10v + d) \bmod 4 = 0$。确定最后两位在位置 $i$ 与右侧某个数字 $d$ 的位置后，前面的 $k - 2$ 个位置要从 $i$ 左侧（共 $i$ 个字符）任选，方案数为 $\binom{i}{k - 2}$，因此这一位的贡献为 $cnt_d \cdot \binom{i}{k - 2}$。把当前 $i$ 所有合法 $d$ 的贡献累加入答案后，再令 $cnt_v \gets cnt_v + 1$，表示当前位置也可以作为更左侧位置的最后一位。

组合数通过**阶乘 + 逆元**预处理，模 $10^9 + 7$ 下 $O(1)$ 求出；当 $i < k - 2$ 时组合数视为 0（代码中直接用条件跳过）。

## 复杂度

时间复杂度 $O(n)$，空间复杂度 $O(n)$。

## 仓颉实现

```cangjie
import std.convert.*
import std.env.*

const MOD: Int64 = 1000000007

func powMod(a: Int64, e: Int64): Int64 {
    var res: Int64 = 1
    var base = a
    var exp = e
    while (exp > 0) {
        if (exp % 2 == 1) {
            res = res * base % MOD
        }
        base = base * base % MOD
        exp = exp / 2
    }
    return res
}

main() {
    let reader = getStdIn()
    let nk = reader.readln().getOrThrow().split(" ", removeEmpty: true).map({ p: String => Int64.parse(p) })
    let n = nk[0]
    let k = nk[1]
    let s = reader.readln().getOrThrow()
    let a = Array<Int64>(n, { _ => 0 })
    var i: Int64 = 0
    while (i < n) {
        a[i] = Int64(s[i]) - 48
        i += 1
    }
    var ans: Int64 = 0
    if (k == 1) {
        i = 0
        while (i < n) {
            if (a[i] == 0 || a[i] == 4 || a[i] == 8) {
                ans += 1
            }
            i += 1
        }
        println(ans)
        return
    }
    let fac = Array<Int64>(n + 1, { _ => 1 })
    var f: Int64 = 1
    i = 1
    while (i <= n) {
        f = f * i % MOD
        fac[i] = f
        i += 1
    }
    let invFac = Array<Int64>(n + 1, { _ => 1 })
    invFac[n] = powMod(fac[n], MOD - 2)
    var j = n
    while (j >= 1) {
        invFac[j - 1] = invFac[j] * j % MOD
        j -= 1
    }
    let cnt = Array<Int64>(10, { _ => 0 })
    let ky = k - 2
    i = n - 1
    while (i >= 0) {
        let v = a[i]
        var ways: Int64 = 0
        if (i >= ky) {
            ways = fac[i] * invFac[ky] % MOD * invFac[i - ky] % MOD
        }
        var d: Int64 = 0
        while (d < 10) {
            if ((10 * v + d) % 4 == 0) {
                ans = (ans + cnt[d] * ways) % MOD
            }
            d += 1
        }
        cnt[v] += 1
        i -= 1
    }
    println(ans)
}
```
