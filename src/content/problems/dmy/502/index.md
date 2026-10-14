---
oj: dmy
pid: '502'
title: 彩带切割
difficulty: 普及−
tags:
  - 线性DP
  - 完全背包
timeLimit: 1s
memoryLimit: 256m
---

> 数据规模：$1 \le n \le 4000$，$1 \le a, b, c \le 4000$，且保证至少存在一种切法。

## 思路

长度是唯一的资源：每切下一段长度 $p \in \{a, b, c\}$ 的彩带，就把剩余长度从 $i$ 变成 $i - p$，段数加一，然后可以继续切。切完时总长恰好用完，也就是**恰好装满容量 $n$ 的完全背包，求段数的最大值**。

设 $dp[i]$ 表示长度为 $i$ 的彩带能切出的最大段数。只有能被恰好切完的长度才是合法状态，用 $-1$ 标记不可达：

$$dp[0] = 0,\qquad dp[i] = \max_{\substack{p \in \{a,b,c\} \\ p \le i,\ dp[i-p] \ge 0}} \bigl(dp[i-p] + 1\bigr).$$

按 $i$ 从小到大递推即可，因为 $dp[i]$ 只依赖比 $i$ 小的下标，转移顺序天然合法。同一段长度可以被反复使用，所以这是完全背包而不是 01 背包；本题物品只有三种，没有必要做 $O(n)$ 到 $O(3n)$ 之外的优化。

题面保证答案存在，因此 $dp[n] \ge 0$，直接输出 $dp[n]$ 即可。需要注意的是，**段长超过 $n$ 或组合不出 $n$ 的情形都在转移里被自动排除**（前者 $p > i$ 被跳过，后者保持 $-1$），不需要额外特判。

## 复杂度

时间 $O(n)$（物品数恒为 3），额外空间 $O(n)$。

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
    let pieces = [v[1], v[2], v[3]]
    let nn = n
    let dp = Array<Int64>(nn + 1, { _ => -1 })
    dp[0] = 0
    var i: Int64 = 1
    while (i <= nn) {
        for (p in pieces) {
            if (i >= p && dp[i - p] >= 0 && dp[i - p] + 1 > dp[i]) {
                dp[i] = dp[i - p] + 1
            }
        }
        i += 1
    }
    println(dp[n])
}
```

</details>
