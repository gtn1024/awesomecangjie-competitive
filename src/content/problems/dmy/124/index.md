---
oj: dmy
pid: '124'
title: '[R21C]拼图游戏'
difficulty: 提高
tags:
  - 暴力
  - 枚举
timeLimit: 1s
memoryLimit: 512m
---

> 数据规模：$1 \le T \le 10$，$1 \le n \le N \le 30$，$1 \le m \le M \le 30$，大拼图板和小拼图板的元素均在 $0 \sim 9$ 之间。

## 思路

题目要求判断小拼图块（$n \times m$）是否是大拼图板（$N \times M$）中某一块连续矩形子区域的精确副本，不能旋转或翻转。

由于规模很小，直接暴力枚举即可。枚举小拼图块在大拼图板中的左上角位置 $(r, c)$，合法范围是 $0 \le r \le N - n$、$0 \le c \le M - m$。对每一个候选起点，逐格比较 $n \times m$ 个元素是否全部对应相等。只要存在任意一个匹配的起点即输出 `Yes`；若枚举完所有起点仍无匹配，输出 `No`。

## 复杂度

每组数据起点数为 $O(NM)$，每个起点比较 $O(nm)$ 个元素，单组复杂度 $O(NMnm)$。最坏情况约 $30^4 \approx 8 \times 10^5$，$T = 10$ 共约 $8 \times 10^6$ 次比较，远在时限之内。

## 仓颉实现

```cangjie
import std.convert.*
import std.env.*

main() {
    let reader = getStdIn()
    let line = reader.readln().getOrThrow().split(" ", removeEmpty: true)
    let T = Int64.parse(line[0])
    for (_ in 0..T) {
        solve(reader)
    }
}

func solve(reader: ConsoleReader): Unit {
    let nm = reader.readln().getOrThrow().split(" ", removeEmpty: true)
    let N = Int64.parse(nm[0])
    let M = Int64.parse(nm[1])
    let big = Array<Array<Int64>>(Int64(N), { _ =>
        reader.readln().getOrThrow().split(" ", removeEmpty: true).map({ p: String => Int64.parse(p) })
    })
    let nm2 = reader.readln().getOrThrow().split(" ", removeEmpty: true)
    let n = Int64.parse(nm2[0])
    let m = Int64.parse(nm2[1])
    let small = Array<Array<Int64>>(Int64(n), { _ =>
        reader.readln().getOrThrow().split(" ", removeEmpty: true).map({ p: String => Int64.parse(p) })
    })
    let rowEnd = N - n
    let colEnd = M - m
    var found = false
    var r = Int64(0)
    while (r <= rowEnd && !found) {
        var c = Int64(0)
        while (c <= colEnd && !found) {
            var ok = true
            var i = Int64(0)
            while (i < n && ok) {
                var j = Int64(0)
                while (j < m && ok) {
                    if (big[r + i][c + j] != small[i][j]) {
                        ok = false
                    }
                    j++
                }
                i++
            }
            if (ok) {
                found = true
            }
            c++
        }
        r++
    }
    println(if (found) { "Yes" } else { "No" })
}
```
