---
oj: dmy
pid: '496'
title: 假期计划
difficulty: 普及−
tags:
  - 线性DP
timeLimit: 1s
memoryLimit: 256m
---

> 数据规模：$1 \le N \le 10^5$，$0 \le a_i, b_i, c_i \le 10^4$。

## 思路

**状态只与「最后一天选了哪项活动」有关。** 设 $f_i(A)$ 表示前 $i$ 天满足限制、且第 $i$ 天选活动 A 时的最大快乐值，$f_i(B)$、$f_i(C)$ 同理。

第 $i$ 天选 A，则第 $i-1$ 天只能选 B 或 C：

$$f_i(A) = a_i + \max\{f_{i-1}(B), f_{i-1}(C)\},$$

对 B、C 完全对称。初始值 $f_0(A) = f_0(B) = f_0(C) = 0$（前 $0$ 天没有约束），答案是 $\max\{f_N(A), f_N(B), f_N(C)\}$。

**每个状态只依赖上一天另外两个状态，可以滚动更新。** 按天遍历，先取出旧的三个值，再分别用另外两个旧值的较大者加上当天的收益覆盖，这样转移不会互相污染。用 $O(1)$ 个变量即可，无需存下整张表。

由于 $N \le 10^5$ 且收益不超过 $10^4$，答案不超过 $10^9$，64 位整数足够。

## 复杂度

时间 $O(N)$，额外空间 $O(1)$。

## 仓颉实现

<details>
<summary>查看仓颉实现</summary>

```cangjie
import std.env.*
import std.convert.*

main() {
    let reader = getStdIn()
    let n = Int64.parse(reader.readln().getOrThrow())
    var dp = Array<Int64>(3, { _ => 0 })
    var i: Int64 = 0
    while (i < n) {
        let v = reader.readln().getOrThrow().split(" ", removeEmpty: true).map({ p: String => Int64.parse(p) })
        let d0 = dp[0]
        let d1 = dp[1]
        let d2 = dp[2]
        dp[0] = v[0] + (if (d1 > d2) { d1 } else { d2 })
        dp[1] = v[1] + (if (d0 > d2) { d0 } else { d2 })
        dp[2] = v[2] + (if (d0 > d1) { d0 } else { d1 })
        i += 1
    }
    var ans = dp[0]
    if (dp[1] > ans) {
        ans = dp[1]
    }
    if (dp[2] > ans) {
        ans = dp[2]
    }
    println(ans)
}
```

</details>
