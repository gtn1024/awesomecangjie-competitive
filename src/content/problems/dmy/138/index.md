---
oj: dmy
pid: '138'
title: '[R23C]最大指数'
difficulty: 提高
tags:
  - 数论
  - 二分
timeLimit: 1s
memoryLimit: 256m
---

> 对于 $100\%$ 的数据，$1 \leq T \leq 10^3$，$1 \leq X,Y \leq 10^9$，且 $A = X \times Y$ 不为 $1$。

## 思路

令 $A = X \times Y$，则 $A \leq 10^{18}$，可以用 `Int64` 安全存储。题目要把 $A$ 写成 $a^b$ 并让 $b$ 最大。

关键观察：$b$ 的取值范围很小。由于 $a \geq 2$ 时 $a^b \leq A \leq 10^{18}$，而 $2^{60} > 10^{18}$，所以 $b \leq 60$（$A = 1$ 时 $b$ 可任意，但题目保证 $A \neq 1$）。

于是 **从大到小枚举 $b$**（$60$ 递减到 $2$），对每个 $b$ 求出 $a = \lfloor A^{1/b} \rfloor$（整数开方，用二分实现），然后验证 $a^b = A$ 或 $(a+1)^b = A$ 是否成立。第一个成立的 $b$ 就是答案；若所有 $b \geq 2$ 都不成立，则 $b = 1$，$a = A$。

二分开方的上界可以按 $b$ 分档收紧（$b$ 大时 $a$ 很小），减少二分轮数。快速幂中要 **带溢出截断**：一旦中间结果超过 $A$ 就直接返回 $A+1$，避免 `Int64` 乘法溢出。

## 复杂度

每组数据枚举 $O(\log A)$ 个 $b$，每个 $b$ 二分开方 $O(\log A)$ 轮，每轮一次 $O(\log b)$ 的快速幂。总复杂度 $O(T \log^3 A)$，对 $T \leq 10^3$ 完全可行。

## 仓颉实现

```cangjie
// [R23C]最大指数
// 给 X,Y, A=X*Y. 把 A 表为 a^b, 最大化 b. 输出 a b.
// 思路: 枚举 b 从 60 递减到 1, 对每个 b 二分找 floor(A^{1/b}), 验证 a^b==A 或 (a+1)^b==A.
// 快速幂带溢出截断: 乘法结果 > A 直接返回 A+1, 防止 Int64 溢出.

import std.convert.*
import std.env.*

// 计算 base^exp, 若中间结果 > limit 则提前返回 limit+1 (用于二分比较)
func powLimit(base: Int64, exp: Int64, limit: Int64): Int64 {
    if (base == 1) {
        return 1
    }
    var result: Int64 = 1
    var b: Int64 = base
    var e: Int64 = exp
    while (e > 0) {
        if ((e & 1) == 1) {
            // result *= b, 检测溢出/超 limit
            if (b != 0 && result > (limit + b - 1) / b) {
                return limit + 1
            }
            result = result * b
            if (result > limit) {
                return limit + 1
            }
        }
        e = e >> 1
        if (e > 0) {
            if (b != 0 && b > (limit + b - 1) / b) {
                b = limit + 1
            } else {
                b = b * b
            }
            if (b > limit) {
                b = limit + 1
            }
        }
    }
    return result
}

// 二分最大的 a 使 a^b <= A, 返回 a
func kthRoot(a: Int64, b: Int64): Int64 {
    if (b == 1) {
        return a
    }
    if (b == 2) {
        // 用整数平方根
        var lo: Int64 = 1
        var hi: Int64 = 1000000001 // > 1e9, 因为 sqrt(1e18)=1e9
        while (lo < hi) {
            var mid: Int64 = lo + ((hi - lo + 1) >> 1)
            if (mid <= 1000000000 && mid * mid <= a) {
                lo = mid
            } else {
                hi = mid - 1
            }
        }
        return lo
    }
    var lo: Int64 = 1
    // hi: 2^60 -> 60th root 是 2, 但 b 较小的时候 hi 较大
    // 一般 a <= A, 用 A 作上界安全但慢; 用更紧的上界
    var hi: Int64 = a
    if (b >= 60) {
        hi = 2
    } else if (b >= 40) {
        hi = 1000
    } else if (b >= 20) {
        hi = 1000000
    } else if (b >= 10) {
        hi = 1000000000
    }
    // 校正: 保证 hi^b 不下溢太小; 直接放宽, 用 min(a, 估算上界)
    if (hi > a) {
        hi = a
    }
    while (lo < hi) {
        var mid: Int64 = lo + ((hi - lo + 1) >> 1)
        var p: Int64 = powLimit(mid, b, a)
        if (p <= a) {
            lo = mid
        } else {
            hi = mid - 1
        }
    }
    return lo
}

func solve(): Unit {
    let reader = getStdIn()
    let line = reader.readln().getOrThrow().split(" ", removeEmpty: true).map({ p: String => Int64.parse(p) })
    let x = line[0]
    let y = line[1]
    let a = x * y
    // 特判 A == 1 (题目保证不为 1)
    // 枚举 b 从 60 递减到 1
    var bestA: Int64 = a
    var bestB: Int64 = 1
    var b: Int64 = 60
    while (b >= 2) {
        var c: Int64 = kthRoot(a, b)
        // 验证 c^b == a 或 (c+1)^b == a
        if (powLimit(c, b, a) == a) {
            bestA = c
            bestB = b
            break
        }
        var c2: Int64 = c + 1
        if (powLimit(c2, b, a) == a) {
            bestA = c2
            bestB = b
            break
        }
        b = b - 1
    }
    println("${bestA} ${bestB}")
}

main() {
    let reader = getStdIn()
    let t = Int64.parse(reader.readln().getOrThrow())
    var i: Int64 = 0
    while (i < t) {
        solve()
        i = i + 1
    }
}
```
