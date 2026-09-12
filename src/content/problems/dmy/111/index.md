---
oj: dmy
pid: '111'
title: '[R19C]字符串操作'
difficulty: 提高
tags:
  - 模拟
  - 字符串
timeLimit: 1s
memoryLimit: 512m
---

> 数据规模：$1 \leq n, Q \leq 1000$，字符串仅由小写字母组成，每次操作都能找到对应的字符。

## 思路

数据规模极小，$n, Q$ 都不超过 $1000$，直接按题意模拟即可。

由于 仓颉的 `String` 是不可变的，需要用一个可变容器承载字符串内容。这里用 `ArrayList<UInt8>` 存储字符串的 UTF-8 字节序列（小写字母均为单字节，等价于逐字符存储），便于增删。

每次操作的处理步骤：

1. 读入整数 $x_i$ 和字符 $c_i$，从左向右扫描 `ArrayList`，统计字符 $c_i$ 出现的次数，找到第 $x_i$ 个 $c_i$ 所在的位置 `pos`。
2. 把该位置上的字符删掉，再插入到最前面。

注意「移动到最前面」是先删除、再插入，否则下标会错位。

## 复杂度

- 时间复杂度：$O(Q \cdot n)$，单次操作扫描与搬移元素均不超过 $O(n)$，总规模约 $10^{6}$ 次操作，远在时限内。
- 空间复杂度：$O(n)$。

## 仓颉实现

```cangjie
import std.convert.*
import std.collection.*
import std.env.*

main() {
    let reader = getStdIn()
    let n = Int64.parse(reader.readln().getOrThrow())
    let s = reader.readln().getOrThrow()
    let list = ArrayList<UInt8>()
    for (b in s) {
        list.add(b)
    }
    let Q = Int64.parse(reader.readln().getOrThrow())
    var q = Q
    while (q > 0) {
        q = q - 1
        let line = reader.readln().getOrThrow()
        let parts = line.split(" ", removeEmpty: true)
        let x = Int64.parse(parts[0])
        let c = parts[1][0]   // UInt8 byte of the char
        // find the x-th occurrence of c (1-indexed) from left
        var cnt = Int64(0)
        var pos = Int64(-1)
        var i = Int64(0)
        while (i < Int64(list.size)) {
            if (list[i] == c) {
                cnt = cnt + 1
                if (cnt == x) {
                    pos = i
                    break
                }
            }
            i = i + 1
        }
        if (pos >= 0) {
            let ch = list[pos]
            list.remove(at: pos)
            list.add(ch, at: 0)
        }
    }
    let arr = Array<UInt8>(list.size, { i: Int64 => list[i] })
    let result = String.fromUtf8(arr)
    println(result)
}
```
