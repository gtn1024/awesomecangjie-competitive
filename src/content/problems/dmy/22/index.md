---
oj: dmy
pid: '22'
title: '[R4D] 排队问题'
difficulty: 入门
tags:
  - 排序
  - 前缀和
timeLimit: 1s
memoryLimit: 512m
---

## 思路

$n$ 名同学都问问题时，按 $a_i$ 从小到大排队可使等待时间总和最小。设按该顺序第 $j$ 名同学（$0$ 开始编号）前面的同学的所需时间之和为 $wait[j]$，全部同学的总等待时间为 $total = \sum wait[j]$。

若去掉排在第 $j$ 名的同学 $i$：他的等待时间 $wait[j]$ 被减去；排在他后面的 $n-1-j$ 名同学每人等待时间都减少 $a_i$。因此答案为

$$total - wait[j] - a_i \times (n-1-j)$$

所需时间相同的同学互换位置不影响上式结果，所以按值排序后任意同名次的同学直接套用公式即可。

复杂度：时间 $O(n \log n)$，空间 $O(n)$。

## 仓颉实现

```cangjie
import std.convert.*
import std.env.*
import std.sort.*

func solve() {
    let reader = getStdIn()
    let n = Int64.parse(reader.readln().getOrThrow())
    let nn = n
    let a = reader.readln().getOrThrow().split(" ", removeEmpty: true).map({ p => Int64.parse(p) })
    let order = Array<Int64>(nn, { i => i })
    sort(order, key: { i => a[i] })
    let pos = Array<Int64>(nn, { _ => 0 })
    let wait = Array<Int64>(nn, { _ => 0 })
    var pre: Int64 = 0
    for (j in 0..nn) {
        pos[order[j]] = j
        wait[j] = pre
        pre += a[order[j]]
    }
    var total: Int64 = 0
    for (j in 0..nn) {
        total += wait[j]
    }
    let sb = StringBuilder()
    for (i in 0..nn) {
        let j = pos[i]
        sb.append(total - wait[j] - a[i] * (n - 1 - j))
        sb.append("\n")
    }
    print(sb.toString())
}

main() {
    solve()
}
```
