---
oj: dmy
pid: '440'
title: '[R71B] 层层叠叠'
difficulty: 入门
tags:
  - 模拟
timeLimit: 1s
memoryLimit: 256m
---

## 思路

构造过程从外向内层层填充：第 $i$ 次（$i$ 从 $1$ 开始）用字符 $s_i$ 填满当时最外圈的边框。因此矩阵中某个格子属于第几层，取决于它到四边的最近距离，即第 $d$ 层（$d$ 从 $0$ 开始）的格子填的都是 $s_{d+1}$。

设 $m = 2n - 1$，格子 $(r, c)$ 到边框的距离为 $d = \min(r, c, m-1-r, m-1-c)$。逐格扫描整个矩阵：用数组 `s` 记录每层首次出现的字符，若同一层出现两个不同字符，则矩阵不是任何字符串的生成矩阵，输出 `No`；否则 `s` 即为所求字符串，输出 `Yes` 和 `s`。

复杂度：时间 $O(n^2)$，空间 $O(n)$。

## 仓颉实现

```cangjie
import std.convert.*
import std.env.*

main() {
    let reader = getStdIn()
    let n = Int64.parse(reader.readln().getOrThrow())
    let m = 2 * n - 1
    let s = Array<Rune>(n, { _ => r' ' })
    var ok = true
    for (r in 0..m) {
        let line = reader.readln().getOrThrow()
        let runes = line.toRuneArray()
        for (c in 0..m) {
            var d = r
            if (c < d) { d = c }
            if (m - 1 - r < d) { d = m - 1 - r }
            if (m - 1 - c < d) { d = m - 1 - c }
            let ch = runes[Int64(c)]
            if (s[Int64(d)] == r' ') {
                s[Int64(d)] = ch
            } else if (s[Int64(d)] != ch) {
                ok = false
            }
        }
    }
    if (!ok) {
        println("No")
    } else {
        println("Yes")
        for (ch in s) {
            print(ch)
        }
        println()
    }
}
```
