---
oj: dmy
pid: '235'
title: '[R38F] 魔塔'
difficulty: 普及+/提高
tags:
  - 组合数学
  - 计数
timeLimit: 4s
memoryLimit: 512m
---

> 数据规模：$n \le 10^6$，$X \le 10^{18}$，$2 \le a_i \le 10^6$。

## 思路

**关键观察**：幂塔增长极快。全取最小值 $2$ 时，塔高 4 的值为 $2^{(2^{(2^2)})} = 2^{16} = 65536$，而塔高 5 的值为 $2^{(2^{(2^{(2^2)})})} = 2^{65536} > 10^{18} \ge X$。因此**塔高不小于 5 的方案永远不合法**，只需考虑高度 1 到 4 的塔。

设 $f(e)$ 为满足 $t^e \le X$ 的最大整数 $t$（即 $f(e) = \lfloor X^{1/e} \rfloor$），则条件 $a^e \le X$ 等价于 $a \le f(e)$。分高度讨论：

- **高度 1**：$a_i \le X$，直接计数。
- **高度 2**：塔值为 $a_i^{a_j}$。由于 $a_i \ge 2$，必须有 $a_j \le 59$（否则 $2^{a_j} > 10^{18} \ge X$），再要求 $a_i \le f(a_j)$。
- **高度 3**：塔值为 $a_i^{(a_j^{a_k})}$。设 $E = a_j^{a_k}$，必须有 $E \le 59$。枚举 $(a_j, a_k) \ge 2$ 且 $a_j^{a_k} \le 59$ 的数对，一共只有 10 种：$(2,2),(2,3),(2,4),(2,5),(3,2),(3,3),(4,2),(5,2),(6,2),(7,2)$。对每种数对要求 $a_i \le f(E)$。
- **高度 4**：塔值为 $a_i^{(a_j^{(a_k^{a_l})})}$。设 $E = a_k^{a_l} \ge 4$、$F = a_j^E \le 59$，可得 $E = 4$（即 $a_k = a_l = 2$）且 $a_j = 2$，指数 $F = 16$。于是合法的四元组只能是 $(a_i, 2, 2, 2)$，要求 $a_i \le f(16)$。

**计数方法**：从左到右扫描原数组，维护两类信息：

- 对每个阈值 $t$，记录「当前已扫描前缀中值 $\le t$ 的元素个数」$\mathrm{cnt}[t]$。需要的阈值恰为 $f(2), f(3), \dots, f(59)$ 共 58 个，而 $f(e)$ 关于 $e$ 递减，所以把这些阈值按升序排好后，每插入一个值 $a_j$ 只需把「阈值 $\ge a_j$」的计数器全部加 1，单次 $O(58)$；
- 对每个值 $v$，记录「当前位置之后值为 $v$ 的元素个数」$\mathrm{suf}[v]$（总频数减去已扫过的部分）。

于是扫描到位置 $j$ 时：

- 高度 2 贡献：$\mathrm{cnt}[f(a_j)]$（要求 $a_j \le 59$）；
- 高度 3 贡献：对每个以 $a_j$ 为首项的数对 $(a_j, v)$，加 $\mathrm{cnt}[f(a_j^v)] \times \mathrm{suf}[v]$；
- 高度 4 贡献：若 $a_j = 2$，加 $\mathrm{cnt}[f(16)] \times \binom{\mathrm{suf}[2]}{2}$（从后面任选两个值为 2 的位置作第 3、4 层）。

最后把所有贡献取模相加。

## 复杂度

时间 $O(58n)$，空间 $O(n + 10^6)$。

## 仓颉实现

```cangjie
import std.convert.*
import std.env.*

// t^e <= X ?
func powLE(t: Int64, e: Int64, X: Int64): Bool {
    var r: Int64 = 1
    var b = t
    var ee = e
    while (ee > 0) {
        if (ee % 2 == 1) {
            if (r > X / b) {
                return false
            }
            r = r * b
        }
        ee = ee / 2
        if (ee > 0) {
            if (b > X / b) {
                return false
            }
            b = b * b
        }
    }
    return true
}

// max t with t^e <= X, capped at 1e6（a_i <= 1e6，超过 1e6 的阈值等价于 1e6）
func floorRoot(X: Int64, e: Int64): Int64 {
    var lo: Int64 = 1
    var hi: Int64 = 1000000
    while (lo < hi) {
        let mid = (lo + hi + 1) / 2
        if (powLE(mid, e, X)) {
            lo = mid
        } else {
            hi = mid - 1
        }
    }
    return lo
}

main(): Int64 {
    let MOD: Int64 = 666666666
    let reader = getStdIn()
    let first = reader.readln().getOrThrow().split(" ", removeEmpty: true)
    let X = Int64.parse(first[1])
    let a = reader.readln().getOrThrow().split(" ", removeEmpty: true).map({ p: String => Int64.parse(p) })

    // thr[e - 2] = floorRoot(X, e)，e in 2..59；floorRoot 关于 e 递减
    var thr = Array<Int64>(58, { _ => 0 })
    for (e in 2..60) {
        thr[e - 2] = floorRoot(X, e)
    }

    // 值域计数（后缀）
    var suf = Array<Int64>(1000001, { _ => 0 })
    for (x in a) {
        suf[x] += 1
    }

    // cnt[k] = 已扫描前缀中值 <= thr[57 - k] 的个数（k 越大阈值越大）
    var cnt = Array<Int64>(58, { _ => 0 })

    var c1: Int64 = 0
    var c2: Int64 = 0
    var c3: Int64 = 0
    var c4: Int64 = 0

    for (aj in a) {
        suf[aj] -= 1
        if (aj <= X) {
            c1 += 1
        }
        if (aj <= 59) {
            c2 = (c2 + cnt[59 - aj]) % MOD
        }
        if (aj == 2) {
            c3 = (c3 + cnt[55] * suf[2]) % MOD
            c3 = (c3 + cnt[51] * suf[3]) % MOD
            c3 = (c3 + cnt[43] * suf[4]) % MOD
            c3 = (c3 + cnt[27] * suf[5]) % MOD
            c4 = (c4 + cnt[43] * (suf[2] * (suf[2] - 1) / 2)) % MOD
        } else if (aj == 3) {
            c3 = (c3 + cnt[50] * suf[2]) % MOD
            c3 = (c3 + cnt[32] * suf[3]) % MOD
        } else if (aj == 4) {
            c3 = (c3 + cnt[43] * suf[2]) % MOD
        } else if (aj == 5) {
            c3 = (c3 + cnt[34] * suf[2]) % MOD
        } else if (aj == 6) {
            c3 = (c3 + cnt[23] * suf[2]) % MOD
        } else if (aj == 7) {
            c3 = (c3 + cnt[10] * suf[2]) % MOD
        }
        // 插入 aj：阈值 >= aj 的计数器 +1
        var k: Int64 = 0
        while (k < 58 && thr[57 - k] < aj) {
            k += 1
        }
        while (k < 58) {
            cnt[k] += 1
            k += 1
        }
    }

    let ans = (c1 + c2 + c3 + c4) % MOD
    println(ans)
    return 0
}
```
