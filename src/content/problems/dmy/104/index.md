---
oj: dmy
pid: '104'
title: '[R18B]项链'
difficulty: 入门
tags:
  - 模拟
  - 哈希
timeLimit: 1s
memoryLimit: 512m
---

> 数据规模：$1 \le n,m \le 3 \times 10^5$，$1 \le a_i \le m$。

## 思路

每种颜色要取「编号最小」的那颗珠子，而珠子是按编号 $1 \sim n$ 顺序给出的。因此只要**从左到右扫描一遍**，对每种颜色记录是否已经第一次出现：第一次见到颜色 $c$ 时就把当前编号记下，之后同色珠子一律跳过。

由于扫描方向本身就是编号递增的方向，第一次见到的那个就是该颜色的最小编号；并且记录下来的编号也自然按从小到大的顺序排列，无需再排序。

用一个大小为 $m+1$ 的布尔数组 `seen` 标记每种颜色是否已出现，边扫描边把答案拼进 `StringBuilder` 即可。

## 复杂度

时间 $O(n)$，空间 $O(n + m)$。

## 仓颉实现

```cangjie
import std.env.*
import std.convert.*

main(): Int64 {
    let reader = getStdIn()
    let line = reader.readln().getOrThrow().split(" ", removeEmpty: true)
    let n = Int64.parse(line[0])
    let m = Int64.parse(line[1])
    let a = reader.readln().getOrThrow().split(" ", removeEmpty: true).map({ p: String => Int64.parse(p) })

    let seen = Array<Bool>(m + 1, { _ => false })
    let sb = StringBuilder()
    var first = true
    for (i in 0..n) {
        let c = a[i]
        if (!seen[c]) {
            seen[c] = true
            if (first) {
                sb.append((i + 1).toString())
                first = false
            } else {
                sb.append(" ")
                sb.append((i + 1).toString())
            }
        }
    }
    println(sb.toString())
    return 0
}
```
