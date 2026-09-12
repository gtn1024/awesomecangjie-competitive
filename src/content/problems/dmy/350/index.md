---
oj: dmy
pid: '350'
title: '[R56C] 斜向矩阵'
difficulty: 入门
tags:
  - 模拟
timeLimit: 1s
memoryLimit: 512m
---

> 数据规模：$1 \le n \le 100$。

## 思路

数字按「右上 → 左下」方向的斜线依次填入，整个矩阵共有 $2n-1$ 条斜线，按从左到右的顺序编号 $0 \sim 2n-2$。若用 $i + j$ 作为 (i, j) 所在斜线的编号，则第 $k$ 条斜线的起点为：

- $k < n$：起点 $(0, k)$，斜线在矩阵上半部分；
- $k \ge n$：起点 $(k - n + 1, n - 1)$，斜线在矩阵下半部分。

从起点出发沿 $i+1,\ j-1$ 方向走到边界，依次填入 $1 \sim n^2$ 即可。

复杂度：时间 $O(n^2)$，空间 $O(n^2)$。

## 仓颉实现

```cangjie
import std.env.*
import std.convert.*

main(): Int64 {
    let reader = getStdIn()
    let n = Int64.parse(reader.readln().getOrThrow())
    let nn = n
    let a = Array<Array<Int64>>(nn, { _ => Array<Int64>(nn, { _ => 0 }) })
    var cnt: Int64 = 1
    for (k in 0..(2 * nn - 1)) {
        var i: Int64 = 0
        var j: Int64 = k
        if (k >= nn) {
            i = k - nn + 1
            j = nn - 1
        }
        while (i < nn && j >= 0) {
            a[i][j] = cnt
            cnt += 1
            i += 1
            j -= 1
        }
    }
    for (i in 0..nn) {
        for (j in 0..nn) {
            if (j != 0) {
                print(" ")
            }
            print(a[i][j])
        }
        println()
    }
    return 0
}
```
