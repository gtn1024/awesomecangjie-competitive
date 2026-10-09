---
oj: dmy
pid: '490'
title: '[R79C] 卡片'
difficulty: 入门
tags:
  - 贪心
timeLimit: 1s
memoryLimit: 512m
---

> 数据规模：$1 \le n \le 2 \times 10^5$，$1 \le c_i \le n$，$1 \le w_i \le 10^9$。

## 思路

每种颜色至多选一张，而不同颜色的卡片之间互不影响，因此每种颜色的选择是**完全独立**的：对颜色 $c$，若选了它，当然选该颜色中权值最大的那张。

这个方案一定最优：任取一个合法选择，把其中每张卡片替换成同色权值最大的卡片，总权值不会变小，替换后仍然任意两张颜色不同；而「每种颜色各取最大」这个选择本身合法（被选卡片颜色两两不同）。所以答案就是所有颜色的最大权值之和。

由于 $c_i \le n$，直接开一个大小 $n+1$ 的数组 `best` 维护每种颜色的当前最大权值。读入时若 $w > $ `best[c]` 就更新，并顺手把差值累加到答案里（等价于最后把所有 `best[c]` 求和，但少一遍扫描）。总权值最大约 $2 \times 10^5 \times 10^9 = 2 \times 10^{14}$，需要用 `Int64`。

## 复杂度

时间 $O(n)$，空间 $O(n)$。

## 仓颉实现

```cangjie
import std.convert.*
import std.env.*

main() {
    let reader = getStdIn()
    let n = Int64.parse(reader.readln().getOrThrow())
    let nn = n
    var best = Array<Int64>(nn + 1, { _ => 0 })
    var total: Int64 = 0
    for (_ in 0..n) {
        let line = reader.readln().getOrThrow().split(" ", removeEmpty: true)
        let c = Int64.parse(line[0])
        let w = Int64.parse(line[1])
        if (w > best[c]) {
            total += w - best[c]
            best[c] = w
        }
    }
    println(total)
}
```
