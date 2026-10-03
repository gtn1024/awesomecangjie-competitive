---
oj: dmy
pid: '3'
title: '[R1C] 区间求和'
difficulty: 入门
tags:
  - 数学
timeLimit: 1s
memoryLimit: 512m
---

> 数据规模：$1 \le n \le 10^5$，$1 \le A_i \le 10^3$。

## 思路

把每个子区间的和拆成每个元素对答案的贡献：$A_i$ 会出现在所有满足 $l \le i \le r$ 的子区间 $[l,r]$ 中，这样的子区间共有 $i \times (n-i+1)$ 个（左端点 $l$ 有 $i$ 种选择，右端点 $r$ 有 $n-i+1$ 种选择）。

所以答案为 $\sum_{i=1}^n A_i \times i \times (n-i+1)$，复杂度 $O(n)$。

复杂度：时间 $O(n)$，空间 $O(1)$。

## 仓颉实现

<details>
<summary>查看仓颉实现</summary>

```cangjie
import std.env.*
import std.convert.*

main() {
    let reader = getStdIn()
    let n = Int64.parse(reader.readln().getOrThrow())
    let a = reader.readln().getOrThrow().split(" ", removeEmpty: true).map({ p => Int64.parse(p) })
    var ans: Int64 = 0
    for (i in 0..n) {
        ans += a[i] * (i + 1) * (n - i)
    }
    println(ans)
}
```

</details>

要点：

- 最大答案约为 $10^5 \times 10^3 \times 2.5 \times 10^9 = 2.5 \times 10^{17}$，必须用 `Int64`，计算过程中也要防止溢出。
- 数组按题面在第二行一次性读入，行尾多余空格由 `split(" ", removeEmpty: true)` 过滤。
