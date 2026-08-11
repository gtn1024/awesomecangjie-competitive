---
oj: dmy
pid: '231'
title: '[R38C]幂'
difficulty: 提高
tags:
  - 数论
  - 二分
timeLimit: 1s
memoryLimit: 256m
---

> $1 \leq T \leq 5$，$2 \leq M \leq 10^{14}$。

## 思路

枚举指数 $B$。$B = 1$ 时 $A = M$ 一定是解，先累加 $M$。

对 $B \geq 2$：因为 $A \geq 2$（$A = 1$ 时 $1^B = 1 \neq M$），有 $2^B \leq A^B = M$，故 $B \leq \lfloor \log_2 M \rfloor$。$M \leq 10^{14}$ 时 $B \leq 46$。

对每个 $B$，需要判断是否存在整数 $A$ 使 $A^B = M$。这等价于求 $M$ 的 $B$ 次整数根，且要求精确。**用浮点 `pow` 取整后做一次验证会有精度风险**（$M$ 高达 $10^{14}$ 时浮点误差可能达到 $1$ 以上），所以直接在整数域上二分：

二分 $A \in [1, M]$，找最大的 $A$ 使 $A^B \leq M$，再验证该 $A$ 是否满足 $A^B = M$。若相等则 $A$ 是一组解，累加。

二分中每次需要计算 $A^B$ 并与 $M$ 比较。为防止中间结果溢出 `Int64`（$M \leq 10^{14}$，但累乘过程中 $A \cdot A$ 可能达到约 $10^{28}$），在快速幂中加入**上界截断**：一旦中间结果超过 $M$ 即返回 $M + 1$ 表示「过大」，避免溢出。判断 `result > limit / b + 1` 后再相乘即可安全。

## 复杂度

$B$ 枚举 $O(\log M)$ 次，每次二分 $O(\log M)$ 轮，每轮快速幂 $O(\log B)$。总复杂度 $O(T \log^3 M)$，$\log M \approx 47$，完全可承受。

## 仓颉实现

```cangjie
import std.convert.*
import std.env.*

// 快速幂计算 base^exp，带溢出/上界保护：结果若超过 limit，返回 limit+1。
// base, exp >= 1, limit >= 1。结果若溢出 Int64 也会被截断为 limit+1。
func powLimit(base: Int64, exp: Int64, limit: Int64): Int64 {
    var result: Int64 = 1
    var b = base
    var e = exp
    // 设一个比 limit 大的阈值，超过即认定超过 limit。
    // 注意 limit <= 1e14，result*b 可能溢出 Int64（max ~9.2e18），需检查。
    while (e > 0) {
        if ((e & 1) == 1) {
            // result *= b，但检查是否超 limit
            if (b != 0 && result > limit / b + 1) {
                return limit + 1
            }
            result = result * b
            if (result > limit) {
                return limit + 1
            }
        }
        e = e >> 1
        if (e > 0) {
            // b *= b 平方
            if (b != 0 && b > limit / b + 1) {
                b = limit + 1
            } else {
                b = b * b
                if (b > limit) {
                    b = limit + 1
                }
            }
        }
    }
    return result
}

// 给定指数 B 和 M，二分找最大的 A 使 A^B <= M，再判断 A^B == M。
// 若存在精确整数 A 使 A^B == M，返回 A，否则返回 -1。
func rootExact(b: Int64, m: Int64): Int64 {
    var lo: Int64 = 1
    var hi: Int64 = m
    var ans: Int64 = 1
    while (lo <= hi) {
        var mid = (lo + hi) >> 1
        var p = powLimit(mid, b, m)
        if (p <= m) {
            ans = mid
            lo = mid + 1
        } else {
            hi = mid - 1
        }
    }
    if (powLimit(ans, b, m) == m) {
        return ans
    }
    return -1
}

func solve(m: Int64): Int64 {
    var sum: Int64 = 0
    // B = 1：A = M，总是解。
    sum += m
    // B >= 2：A = M^(1/B)，且 A >= 2（A=1 时 1^B=1 != M）。
    // B 上界：2^B <= M => B <= floor(log2(M))，M<=1e14 => B<=46。
    var b: Int64 = 2
    while (true) {
        // 剪枝：2^b > m 则 A>=2 时 A^b>m，无解。
        if (powLimit(2, b, m) > m) {
            break
        }
        var a = rootExact(b, m)
        if (a >= 2) {
            sum += a
        }
        b += 1
    }
    return sum
}

main(): Int64 {
    let reader = getStdIn()
    let line = reader.readln().getOrThrow()
    let t = Int64.parse(line)
    for (_ in 0..t) {
        let mline = reader.readln().getOrThrow().split(" ", removeEmpty: true)
        let m = Int64.parse(mline[0])
        println(solve(m).toString())
    }
    return 0
}
```
