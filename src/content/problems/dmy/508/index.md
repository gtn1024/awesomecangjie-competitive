---
oj: dmy
pid: '508'
title: 模型选择
difficulty: 入门
tags:
  - 线性DP
  - 枚举
timeLimit: 1s
memoryLimit: 256m
---

> 数据规模：$1 \le T \le 100$，所有测试用例的 $n$ 之和不超过 $10^5$，$1 \le n \le 10^5$，$1 \le s_i \le 10^9$。

## 思路

**设 $dp[i]$ 表示以模型 $i$ 结尾（必选 $i$）时最多能选出的模型数。** 初值 $dp[i]=1$（只选它自己）；转移时枚举 $i$ 的真约数 $j$，若 $s_j<s_i$，模型 $i$ 就可以接在 $j$ 后面（编号满足 $j \mid i$ 的倍数关系，尺寸严格更大），于是 $dp[i]=\max(dp[i],\,dp[j]+1)$。答案即为所有 $dp[i]$ 的最大值。

**实现上按 $j$ 从小到大枚举，反过来用 $dp[j]$ 去刷新它的所有倍数 $m=2j,3j,\ldots$。** 由于 $j$ 的真约数都小于 $j$，外层循环走到 $j$ 时 $dp[j]$ 已经定值，可以直接拿来转移，无需刻意约数分解。每个 $j$ 要访问约 $n/j$ 个倍数，总访问次数是调和级数 $n\left(1+\frac12+\frac13+\cdots\right)=O(n\log n)$，$n \le 10^5$ 时不过约 $1.2 \times 10^6$ 次。

## 复杂度

时间 $O(n\log n)$（调和级数），额外空间 $O(n)$。

## 仓颉实现

<details>
<summary>查看仓颉实现</summary>

```cangjie
import std.env.*
import std.convert.*

func solve(reader: ConsoleReader): Unit {
    let n = Int64.parse(reader.readln().getOrThrow())
    let s = reader.readln().getOrThrow().split(" ", removeEmpty: true).map({ p: String => Int64.parse(p) })
    let dp = Array<Int64>(n + 1, { _ => 1 })
    var ans: Int64 = 1
    var j: Int64 = 1
    while (j <= n) {
        if (dp[j] > ans) {
            ans = dp[j]
        }
        var m = j + j
        while (m <= n) {
            if (s[m - 1] > s[j - 1] && dp[j] + 1 > dp[m]) {
                dp[m] = dp[j] + 1
            }
            m += j
        }
        j += 1
    }
    println(ans)
}

main() {
    let reader = getStdIn()
    let t = Int64.parse(reader.readln().getOrThrow())
    var k: Int64 = 0
    while (k < t) {
        solve(reader)
        k += 1
    }
}
```

</details>
