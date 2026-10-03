---
oj: dmy
pid: '446'
title: '[R72B] 爱吃白饭的大肥鱼'
difficulty: 入门
tags:
  - 枚举
  - 数组
timeLimit: 1s
memoryLimit: 256m
---

> 数据规模：$3 \le n \le 500$，$1 \le m \le 500$。

## 思路

设 $r_i$ 为在第 $i$ 行游动的小鱼数量，$c_i$ 为在第 $i$ 列游动的小鱼数量。多条鱼可能位于同一行或同一列，因此记录的是**数量**而不是是否出现。

左上角为 $(x, y)$ 的 $3\times3$ 区域覆盖第 $x$ 至第 $x+2$ 行、第 $y$ 至第 $y+2$ 列，能吃到的小鱼数为

$$R(x) + C(y)$$

其中

$$R(x) = r_x + r_{x+1} + r_{x+2}, \quad C(y) = c_y + c_{y+1} + c_{y+2}$$

$R(x)$ 只由 $x$ 决定，$C(y)$ 只由 $y$ 决定，因此可以分别求两者的最大值：若 $x_0$ 使 $R$ 最大、$y_0$ 使 $C$ 最大，则对任意 $(x, y)$ 都有

$$R(x) + C(y) \le R(x_0) + C(y_0)$$

所以 $(x_0, y_0)$ 就是全局最优位置。

题目要求并列时优先取较小的 $x$，再取较小的 $y$。从小到大枚举 $x$、$y$，并且只在窗口和**严格变大**时更新，出现并列最优时就会自然地保留最小的 $x$ 和 $y$。

## 复杂度

统计小鱼数量需要 $O(m)$，枚举所有三行、三列窗口需要 $O(n)$。总时间复杂度为 $O(n + m)$，空间复杂度为 $O(n)$。

## 仓颉实现

<details>
<summary>查看仓颉实现</summary>

```cangjie
import std.env.*
import std.convert.*

main() {
    let reader = getStdIn()
    let first = reader.readln().getOrThrow().split(" ", removeEmpty: true).map({ p: String => Int64.parse(p) })
    let n = first[0]
    let m = first[1]

    // r[i] 为在第 i 行游动的小鱼数量，c[i] 为在第 i 列游动的小鱼数量
    let r = Array<Int64>(n + 1, { _ => 0 })
    let c = Array<Int64>(n + 1, { _ => 0 })
    for (_ in 0..m) {
        let line = reader.readln().getOrThrow().split(" ", removeEmpty: true)
        let op = Int64.parse(line[0])
        let k = Int64.parse(line[1])
        if (op == 1) {
            r[k] += 1
        } else {
            c[k] += 1
        }
    }

    // R(x) = r[x] + r[x+1] + r[x+2] 只由 x 决定，从小到大枚举，只在严格变大时更新，
    // 这样并列最优时保留最小的 x
    var bestR: Int64 = -1
    var bestX: Int64 = 0
    for (x in 1..=n - 2) {
        let cur = r[x] + r[x + 1] + r[x + 2]
        if (cur > bestR) {
            bestR = cur
            bestX = x
        }
    }

    // C(y) = c[y] + c[y+1] + c[y+2] 同理，取最小的 y
    var bestC: Int64 = -1
    var bestY: Int64 = 0
    for (y in 1..=n - 2) {
        let cur = c[y] + c[y + 1] + c[y + 2]
        if (cur > bestC) {
            bestC = cur
            bestY = y
        }
    }

    println(bestX.toString() + " " + bestY.toString())
}
```

</details>