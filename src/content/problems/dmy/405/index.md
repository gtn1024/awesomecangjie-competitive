---
oj: dmy
pid: '405'
title: '[R65C] 登山'
difficulty: 普及-
tags:
  - 前缀和
timeLimit: 1s
memoryLimit: 512m
---

> 数据规模：$3 \le n \le 2 \times 10^5$，$1 \le q \le 2 \times 10^5$，$1 \le a_i \le 10^9$，$1 \le l \le r \le n$。

## 思路

先一次扫描预处理每个位置是否为峰顶（$a_i > a_{i-1}$ 且 $a_i > a_{i+1}$）和谷底（$a_i < a_{i-1}$ 且 $a_i < a_{i+1}$），分别用两个标记数组表示。再对这两个标记数组做前缀和，即可在 $O(1)$ 内查询任意区间内的峰顶数和谷底数。

对于一次查询 $[l, r]$，点 $i$ 成为峰顶/谷底需要 $l \le i - 1 < i < i + 1 \le r$，即 $i \in [l+1, r-1]$。所以实际统计区间是 $[l+1, r-1]$，需保证 $l + 1 \le r - 1$（即区间长度至少为 $3$），否则答案为 $0$。边界情形 $l = r$、$r = l + 1$ 自然落入此特判。

复杂度：时间 $O(n + q)$，空间 $O(n)$。

## 仓颉实现

```cangjie
import std.env.*
import std.convert.*

main(): Int64 {
    let reader = getStdIn()
    let line = reader.readln().getOrThrow().split(" ", removeEmpty: true).map({ p => Int64.parse(p) })
    let n = line[0]
    let q = line[1]
    let a = reader.readln().getOrThrow().split(" ", removeEmpty: true).map({ p => Int64.parse(p) })

    // isPeak[i] / isValley[i]: position i (1-indexed, i in [2, n-1]) is a peak/valley
    // prefix arrays so that peak[i] = count of peaks among positions in [1..i]
    var peak = Array<Int64>(n + 1, { _ => 0 })
    var valley = Array<Int64>(n + 1, { _ => 0 })
    var i = 2
    while (i <= n - 1) {
        var pc = peak[i - 1]
        var vc = valley[i - 1]
        if (a[i - 1] > a[i - 2] && a[i - 1] > a[i]) {
            pc++
        }
        if (a[i - 1] < a[i - 2] && a[i - 1] < a[i]) {
            vc++
        }
        peak[i] = pc
        valley[i] = vc
        i++
    }
    while (i <= n) {
        peak[i] = peak[i - 1]
        valley[i] = valley[i - 1]
        i++
    }

    var k = 0
    while (k < q) {
        let lr = reader.readln().getOrThrow().split(" ", removeEmpty: true).map({ p => Int64.parse(p) })
        let l = lr[0]
        let r = lr[1]
        var pc = 0
        var vc = 0
        if (l + 1 <= r - 1) {
            pc = peak[r - 1] - peak[l]
            vc = valley[r - 1] - valley[l]
        }
        println("${pc} ${vc}")
        k++
    }
    return 0
}
```

要点：

- 峰顶、谷底预处理与前缀和合并到同一次扫描：`peak[i]` 直接继承 `peak[i-1]`，若当前点满足条件再 `+1`，省去额外标记数组。
- 区间查询时把 $[l, r]$ 收紧为 $[l+1, r-1]$，对应前缀和 `peak[r-1] - peak[l]`，避免端点本身被错误统计。
- 每算出一个查询结果就直接用 `println` 输出一行，无需额外拼接输出缓冲。
