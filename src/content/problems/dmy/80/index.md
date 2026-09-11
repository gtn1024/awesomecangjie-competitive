---
oj: dmy
pid: '80'
title: '[R14B] 向前看2'
difficulty: 入门
tags:
  - 模拟
timeLimit: 1s
memoryLimit: 512m
---

> 数据规模：$1 \le n \le 3000$，$1 \le h_i \le 1000$。

## 思路

按题意直接模拟 $n$ 轮调整。第 $i$ 轮看当前队伍中位置 $i$（0 起下标）的人：从队头开始扫他前面的所有人，找到第一个身高比他高的人；找到就交换位置，找不到（前面所有人都不高于他）则本轮不动。

判断「前面所有人都不高于他」与「找第一个比他高的人」共用一次扫描：一旦发现比他高的，他就是位置最靠前的那个，直接交换即可。

复杂度：时间 $O(n^2)$，空间 $O(n)$。$n \le 3000$，$O(n^2)$ 完全可行。

## 仓颉实现

```cangjie
import std.env.*
import std.convert.*

main(): Int64 {
    let reader = getStdIn()
    let n = Int64.parse(reader.readln().getOrThrow())
    let h = reader.readln().getOrThrow().split(" ", removeEmpty: true).map({ p => Int64.parse(p) })
    for (i in 1..n) {
        var pos = -1
        for (j in 0..i) {
            if (h[j] > h[i]) {
                pos = j
                break
            }
        }
        if (pos >= 0) {
            let t = h[i]
            h[i] = h[pos]
            h[pos] = t
        }
    }
    var first = true
    for (x in h) {
        if (!first) {
            print(" ")
        }
        print(x)
        first = false
    }
    println()
    return 0
}
```

要点：

- 从队头（下标 0）扫描，第一个满足 $h_j > h_i$ 的人就是题目要求的「位置最靠前」的更高者，找到即 `break`。
- 内层区间 `0..i` 不含右端点，恰好枚举位置 $i$ 之前的全部人。
