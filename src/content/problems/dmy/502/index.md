---
oj: dmy
pid: '502'
title: 彩带切割
difficulty: 入门
tags:
  - 线性DP
  - 完全背包
timeLimit: 1s
memoryLimit: 256m
---

> 数据规模：$1 \le n, a, b, c \le 4000$，保证至少存在一种切法。

## 思路

设 $dp[i]$ 表示**恰好**切出总长 $i$ 的彩带时最多能得到的段数，切不出则为 $-1$。初始 $dp[0] = 0$（空彩带 zero 段），其余为 $-1$。

按长度从小到大转移：最后一段的长度 $x$ 只能是 $a$、$b$、$c$ 之一，若 $i \ge x$ 且 $i - x$ 可被恰好拼出，则

$$dp[i] = \max_{x \in \{a,b,c\}} dp[i - x] + 1.$$

三者都不可达时 $dp[i]$ 保持 $-1$。题目保证 $n$ 至少有一种切法，因此最终答案就是 $dp[n]$。这等价于**完全背包**（每种物品无限件，最大化件数），背包容量恰好装满的写法。

## 复杂度

时间 $O(n)$（状态 $O(n)$，每个状态枚举 3 种段长），额外空间 $O(n)$。

## 仓颉实现

<details>
<summary>查看仓颉实现</summary>

```cangjie
import std.env.*
import std.convert.*

main() {
    let reader = getStdIn()
    let v = reader.readln().getOrThrow().split(" ", removeEmpty: true).map({ p: String => Int64.parse(p) })
    let n = v[0]
    let cuts = [v[1], v[2], v[3]]
    let dp = Array<Int64>(n + 1, { _ => -1 })
    dp[0] = 0
    var i: Int64 = 1
    while (i <= n) {
        var best: Int64 = -1
        for (x in cuts) {
            if (i >= x && dp[i - x] >= 0 && dp[i - x] + 1 > best) {
                best = dp[i - x] + 1
            }
        }
        dp[i] = best
        i += 1
    }
    println(dp[n])
}
```

</details>
