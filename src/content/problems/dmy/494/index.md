---
oj: dmy
pid: '494'
title: 青蛙跳石头
difficulty: 入门
tags:
  - 线性DP
timeLimit: 1s
memoryLimit: 256m
---

> 数据规模：$2 \le N \le 10^5$，$0 \le h_i \le 10^4$。

## 思路

**状态设计**：设 $dp[i]$ 表示从第 $1$ 块石头跳到第 $i$ 块石头所需的最少体力，$dp[1]=0$。

**转移**：最后一步只能从第 $i-1$ 块或第 $i-2$ 块跳来，因此

$$dp[i]=\min\big(dp[i-1]+|h_i-h_{i-1}|,\ dp[i-2]+|h_i-h_{i-2}|\big).$$

边界为 $dp[1]=0$、$dp[2]=|h_2-h_1|$，答案为 $dp[N]$。由于每次转移只依赖前两个状态，用两个滚动变量维护 $dp[i-2]$ 与 $dp[i-1]$ 即可，无需开数组。

以样例 $h=(10,30,40,20)$ 验证：$dp=(0,20,30,30)$，对应路线 $1\to 2\to 4$，消耗 $|30-10|+|20-30|=30$。

## 复杂度

时间 $O(N)$，额外空间 $O(1)$。

## 仓颉实现

<details>
<summary>查看仓颉实现</summary>

```cangjie
import std.env.*
import std.convert.*
import std.math.*

main() {
    let reader = getStdIn()
    let n = Int64.parse(reader.readln().getOrThrow())
    let h = reader.readln().getOrThrow().split(" ", removeEmpty: true).map({ p: String => Int64.parse(p) })
    var prev2: Int64 = 0
    var prev1: Int64 = abs(h[1] - h[0])
    var i: Int64 = 2
    while (i < n) {
        let c1 = prev1 + abs(h[i] - h[i - 1])
        let c2 = prev2 + abs(h[i] - h[i - 2])
        if (c1 < c2) {
            prev2 = prev1
            prev1 = c1
        } else {
            prev2 = prev1
            prev1 = c2
        }
        i += 1
    }
    println(prev1)
}
```

</details>
