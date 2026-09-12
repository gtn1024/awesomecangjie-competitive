---
oj: dmy
pid: '417'
title: '[R67C] 排列'
difficulty: 普及
tags:
  - 模拟
timeLimit: 1s
memoryLimit: 512m
---

> 数据规模：$1 \le n, x, y \le 5000$。

## 思路

矩阵第 $k$ 行是把排列 $p$ 连续作用 $k$ 次的结果，即 $a_{k,i}=p^k(i)$。由递推 $a_{k,i}=a_{k-1,p_i}$，可以在已知第 $k-1$ 行时用 $a_{k,i}=a_{k-1,p_i}$ 一次性算出整行。

由于 $n,x,y$ 都不超过 $5000$，直接从第 $1$ 行逐层模拟到第 $\max(x,y)$ 行即可。在过程中，当层数等于 $x$ 时把当前行存为 $vx$、等于 $y$ 时存为 $vy$，最后逐位比较 $vx$ 与 $vy$ 的字典序输出符号。

空间上只保留「上一层」与「当前层」两个数组（滚动数组），不需要存整个矩阵。

复杂度：时间 $O(n\cdot \max(x,y))$，空间 $O(n)$。

## 仓颉实现

```cangjie
import std.env.*
import std.convert.*

main() {
    let reader = getStdIn()
    let n = Int64.parse(reader.readln().getOrThrow().split(" ", removeEmpty: true)[0])
    let p = reader.readln().getOrThrow().split(" ", removeEmpty: true).map({ s => Int64.parse(s) })
    let xy = reader.readln().getOrThrow().split(" ", removeEmpty: true).map({ s => Int64.parse(s) })
    let x = xy[0]
    let y = xy[1]
    let nn = n
    var cur = Array<Int64>(nn, { i => p[i] })
    var vx: Array<Int64> = Array<Int64>(nn, { _ => 0 })
    var vy: Array<Int64> = Array<Int64>(nn, { _ => 0 })
    var hi = x
    if (y > hi) {
        hi = y
    }
    if (x == 1) {
        var i = 0
        while (i < nn) {
            vx[i] = cur[i]
            i += 1
        }
    }
    if (y == 1) {
        var i = 0
        while (i < nn) {
            vy[i] = cur[i]
            i += 1
        }
    }
    var k = 2
    while (k <= hi) {
        let prev = cur
        cur = Array<Int64>(nn, { i => prev[p[i] - 1] })
        if (k == x) {
            var i = 0
            while (i < nn) {
                vx[i] = cur[i]
                i += 1
            }
        }
        if (k == y) {
            var i = 0
            while (i < nn) {
                vy[i] = cur[i]
                i += 1
            }
        }
        k += 1
    }
    var i = 0
    var res = "="
    while (i < nn) {
        if (vx[i] < vy[i]) {
            res = "<"
            break
        } else if (vx[i] > vy[i]) {
            res = ">"
            break
        }
        i += 1
    }
    println(res)
}
```

要点：

- $a_{k,i}=a_{k-1,p_i}$，由于 $p_i\in[1,n]$，数组按下标取值时要减 $1$ 转为 $0$ 基下标。
- 用滚动数组只保留相邻两层，把空间从 $O(n\cdot \max(x,y))$ 压到 $O(n)$。
- 逐位比较时，第一次遇到不等的元素即可确定大小关系；全部相等则输出 `=`。
