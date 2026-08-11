---
oj: dmy
pid: '241'
title: '[R39E]子序列计数'
difficulty: 普及+
tags:
  - 动态规划
  - 前缀和
timeLimit: 1s
memoryLimit: 512m
---

> 数据规模：$n \le 5000$，$m \le n$，$1 \le K \le n$，$1 \le A_i, B_i \le n$。

## 思路

记 $dp[i]$ 为「当前已匹配到 $B$ 的某个前缀，且最后一个选中的下标为 $i$」的方案数，按 $B$ 的下标 $j$ 分层推进。

- 第一层（$j = 0$）：所有满足 $A[i] = B_0$ 的位置 $i$，$dp[i] = 1$。
- 后续层（$j > 0$）：若 $A[i] = B_j$，则它可以接在任意满足 $i' \le i - K$ 的上一层位置 $i'$ 之后，即 $dp[i] = \sum_{i' \le i-K} dp_{j-1}[i']$；否则 $dp[i] = 0$。

直接枚举 $i'$ 是 $O(n^2)$ 每层，会超时。利用**前缀和**优化：对上一层 $dp$ 求前缀和 $ps[t] = \sum_{i' < t} dp[i']$，则 $\sum_{i' \le i-K} dp[i'] = ps[i-K+1]$（当 $i - K + 1 < 0$ 时为 $0$），每层即可 $O(n)$ 完成。

最终答案是把最后一层的所有 $dp[i]$ 求和取模。整个过程在模 $998244353$ 意义下进行。

## 复杂度

时间 $O(nm)$，空间 $O(n)$。

## 仓颉实现

```cangjie
import std.convert.*
import std.env.*

const MOD: Int64 = 998244353

main() {
    let reader = getStdIn()
    let line0 = reader.readln().getOrThrow().split(" ", removeEmpty: true)
    let n = Int64.parse(line0[0])
    let m = Int64.parse(line0[1])
    let k = Int64.parse(line0[2])
    let a = reader.readln().getOrThrow().split(" ", removeEmpty: true).map({ p: String => Int64.parse(p) })
    let b = reader.readln().getOrThrow().split(" ", removeEmpty: true).map({ p: String => Int64.parse(p) })

    // dp[i]：当前已匹配 B[0..j]，最后一个选中下标为 i 的方案数
    var dp = Array<Int64>(n, { _ => 0 })
    var ndp = Array<Int64>(n, { _ => 0 })
    let ps = Array<Int64>(n + 1, { _ => 0 })

    for (j in 0..m) {
        if (j == 0) {
            let b0 = b[0]
            for (i in 0..n) {
                if (a[i] == b0) { ndp[i] = 1 } else { ndp[i] = 0 }
            }
        } else {
            // 前缀和：ps[t] = sum_{i' < t} dp[i']
            ps[0] = 0
            for (i in 0..n) {
                ps[i + 1] = (ps[i] + dp[i]) % MOD
            }
            let bj = b[j]
            for (i in 0..n) {
                if (a[i] == bj) {
                    // 上一个选中下标 i' 需满足 i' <= i - K，即 sum_{i' < i-K+1} dp[i']
                    let lim = i - k + 1
                    if (lim >= 0) { ndp[i] = ps[lim] } else { ndp[i] = 0 }
                } else {
                    ndp[i] = 0
                }
            }
        }
        let tmp = dp
        dp = ndp
        ndp = tmp
    }

    var ans: Int64 = 0
    for (i in 0..n) {
        ans = (ans + dp[i]) % MOD
    }
    println(ans)
}
```
