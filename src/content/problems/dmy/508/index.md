---
oj: dmy
pid: '508'
title: 模型选择
difficulty: 普及−
tags:
  - 线性DP
  - 数论
timeLimit: 1s
memoryLimit: 256m
---

> 数据规模：$1 \le T \le 100$，所有测试用例的 $n$ 之和不超过 $10^5$，$1 \le n \le 10^5$，$1 \le s_i \le 10^9$。

## 思路

选出的模型按编号递增排列，相邻两个满足「后一个编号是前一个的倍数」且「后一个尺寸严格更大」。由整除的传递性，只要相邻两项满足整除关系，整个序列的编号就是一条整除链。

设 $dp[i]$ 表示**以第 $i$ 个模型结尾**时最多能选出的模型数量，则

$$dp[i] = 1 + \max\{dp[j] : j \mid i,\ j < i,\ s_j < s_i\},$$

没有满足条件的 $j$ 时 $dp[i] = 1$（只选自己）。答案即 $\max_i dp[i]$。

朴素做法是对每个 $i$ 枚举它的所有真因子，需要试除分解，最坏 $O(n\sqrt{n})$。改成**枚举倍数**更好写也更快：外层让 $j$ 从 $1$ 递增到 $n$，内层枚举 $m = 2j, 3j, \dots \le n$，若 $s_j < s_m$ 就用 $dp[j] + 1$ 更新 $dp[m]$。

这样做的正确性来自处理顺序：$m$ 的所有候选前驱都是 $m$ 的真因子，严格小于 $m$，因此当外层扫到 $m$ 时，$dp[m]$ 已被所有前驱更新完毕、已是最终值；随后枚举 $m$ 的倍数时用的就是定值。枚举倍数的总次数是 $\sum_{j=1}^{n} \lfloor n/j \rfloor = O(n \log n)$。

多组数据要逐组重建 $dp$ 数组，注意 $s_i$ 最大 $10^9$，用 64 位整数存储。

## 复杂度

时间 $O(n \log n)$（每组，累加不超过 $\sum n \cdot \log \max n$），空间 $O(n)$。

## 仓颉实现

<details>
<summary>查看仓颉实现</summary>

```cangjie
import std.env.*
import std.convert.*

main() {
    let reader = getStdIn()
    let t = Int64.parse(reader.readln().getOrThrow())
    var tc: Int64 = 0
    while (tc < t) {
        let n = Int64.parse(reader.readln().getOrThrow())
        let s = reader.readln().getOrThrow().split(" ", removeEmpty: true).map({ p: String => Int64.parse(p) })
        let dp = Array<Int64>(n + 1, { _ => 1 })
        var ans: Int64 = 0
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
        tc += 1
    }
}
```

</details>
