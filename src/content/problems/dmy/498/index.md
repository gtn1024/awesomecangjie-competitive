---
oj: dmy
pid: '498'
title: 篮球训练
difficulty: 普及−
tags:
  - 线性DP
timeLimit: 1s
memoryLimit: 256m
---

> 数据规模：$1 \le N \le 10^5$，每个分数为不超过 $10^5$ 的非负整数。

## 思路

**按列做线性 DP，状态记录「上一列选了什么」。** 相邻限制只有两类：同一列上下两格不能同时选，相邻两列的同一行不能同时选。因此只需知道上一列的选取状态，就能决定当前列的合法方案。

设处理到第 $i$ 列时：

- $f_0$：前 $i-1$ 列的最大分数，且第 $i-1$ 列一个都不选；
- $f_1$：前 $i-1$ 列的最大分数，且第 $i-1$ 列选了上方格子；
- $f_2$：前 $i-1$ 列的最大分数，且第 $i-1$ 列选了下方格子。

转移到第 $i$ 列（上方分数 $a_i$，下方分数 $b_i$）：

- 第 $i$ 列不选：三种状态都允许，$g_0 = \max(f_0, f_1, f_2)$；
- 第 $i$ 列选上方：要求第 $i-1$ 列上方没选，即上一列状态为「空」或「选下方」，$g_1 = \max(f_0, f_2) + a_i$；
- 第 $i$ 列选下方：同理，$g_2 = \max(f_0, f_1) + b_i$。

初始 $f_0 = f_1 = f_2 = 0$（分数非负，空表合法且不会更优）。答案为处理完最后一列后的 $\max(f_0, f_1, f_2)$。

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
    let a = reader.readln().getOrThrow().split(" ", removeEmpty: true).map({ p: String => Int64.parse(p) })
    let b = reader.readln().getOrThrow().split(" ", removeEmpty: true).map({ p: String => Int64.parse(p) })
    var s0: Int64 = 0
    var s1: Int64 = 0
    var s2: Int64 = 0
    var i: Int64 = 0
    while (i < n) {
        let g0 = max(s0, max(s1, s2))
        let g1 = max(s0, s2) + a[i]
        let g2 = max(s0, s1) + b[i]
        s0 = g0
        s1 = g1
        s2 = g2
        i += 1
    }
    println(max(s0, max(s1, s2)))
}
```

</details>
