---
oj: dmy
pid: '86'
title: '[R15B] 最近点'
difficulty: 入门
tags:
  - 枚举
timeLimit: 1s
memoryLimit: 512m
---

> 数据规模：$2 \le n \le 2000$，$1 \le x_i, y_i \le 1000$。

## 思路

对每个点 $i$，枚举其余所有点 $j$，计算距离的平方 $d = (x_i-x_j)^2 + (y_i-y_j)^2$，取最小的 $j$ 作为答案。距离比较用平方形式，避免浮点运算；坐标差不超过 $10^3$，平方和不超过 $2 \times 10^6$，用 `Int64` 安全。

平局取编号最小：按 $j$ 递增顺序扫描，只有严格更小才更新答案，首次遇到的最小值自然是编号最小的。

复杂度：时间 $O(n^2)$，空间 $O(n)$。

## 仓颉实现

```cangjie
import std.env.*
import std.convert.*

main(): Int64 {
    let reader = getStdIn()
    let n = Int64.parse(reader.readln().getOrThrow())
    var xs = Array<Int64>(n, { _ => 0 })
    var ys = Array<Int64>(n, { _ => 0 })
    for (i in 0..n) {
        let p = reader.readln().getOrThrow().split(" ", removeEmpty: true).map({ q => Int64.parse(q) })
        xs[i] = p[0]
        ys[i] = p[1]
    }
    var first = true
    for (i in 0..n) {
        var best: Int64 = 1 << 62
        var bestj: Int64 = -1
        for (j in 0..n) {
            if (j == i) {
                continue
            }
            let dx = xs[i] - xs[j]
            let dy = ys[i] - ys[j]
            let d = dx * dx + dy * dy
            if (d < best) {
                best = d
                bestj = j
            }
        }
        if (!first) {
            print(" ")
        }
        print(bestj + 1)
        first = false
    }
    println()
    return 0
}
```

要点：

- 坐标按行读入，每行两个整数；`j == i` 时跳过自己，其余点全部参与比较。
- 距离初值设为大数（`1 << 62`），保证任意真实距离都能更新它。
