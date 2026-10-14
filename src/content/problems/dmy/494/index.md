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

设 $f_i$ 为青蛙从第 1 块石头跳到第 $i$ 块石头所需的最少体力。由于每次只能向后跳 1 块或 2 块，到达第 $i$ 块之前的最后一步只有两种可能：从第 $i-1$ 块跳过来，或从第 $i-2$ 块跳过来。因此

$$f_i = \min\big(f_{i-1} + |h_i - h_{i-1}|,\ f_{i-2} + |h_i - h_{i-2}|\big),$$

边界为 $f_1 = 0$，$f_2 = |h_2 - h_1|$，答案为 $f_N$。

**为什么这样转移是充分的？** 青蛙的路线是一条严格递增的下标序列，任意一条合法路线把最后一块去掉后仍是到达前一块的合法路线；反过来，两条子路线各自加上最后一跳都能拼成到达第 $i$ 块的合法路线。也就是说，最优解一定由某个「到达前一位置的最优解」延伸而来，转移没有遗漏。

**为什么可以这样递推而不用考虑更早的位置？** 由于跳跃长度不超过 2，任何路线在到达 $i$ 之前的落脚点集合中，$i-1$ 与 $i-2$ 之间必然有一个是上一步（否则无法跨越这两块），所以只需看这两个状态。

转移只依赖前两项，用两个变量滚动即可，无需开数组。

## 复杂度

时间 $O(N)$，额外空间 $O(1)$（除输入的 $h$ 数组外）。

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
