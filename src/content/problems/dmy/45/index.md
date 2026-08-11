---
oj: dmy
pid: '45'
title: '[R8C] 点名'
difficulty: 普及-
tags:
  - 计数
  - 字符串
timeLimit: 1s
memoryLimit: 512m
---

> 数据规模：$1 \le n, m \le 10^5$，$1 \le |S_i| \le 10$。

## 思路

一次点名只跟「名字首字母」或「名字末尾字母」有关。统计 $pre[c]$ 为点名首字母为 $c$ 的次数，$suf[c]$ 为点名末尾字母为 $c$ 的次数，则第 $i$ 个同学被点到的次数为 $pre[\text{首字母}] + suf[\text{末尾字母}]$。

字符 $c$ 用 `UInt32(c) - UInt32(r'a')` 转成 $0 \sim 25$ 的下标。

复杂度：时间 $O(n + m)$，空间 $O(26)$。

## 仓颉实现

```cangjie
import std.convert.*
import std.env.*

main() {
    let reader = getStdIn()
    let line0 = reader.readln().getOrThrow().split(" ", removeEmpty: true).map({ p => Int64.parse(p) })
    let n = line0[0]
    let m = line0[1]
    let head = Array<Int64>(n, { _ => 0 })
    let tail = Array<Int64>(n, { _ => 0 })
    for (i in 0..n) {
        let s = reader.readln().getOrThrow().toRuneArray()
        head[i] = Int64(UInt32(s[0]) - UInt32(r'a'))
        tail[i] = Int64(UInt32(s[s.size - 1]) - UInt32(r'a'))
    }
    let pre = Array<Int64>(26, { _ => 0 })
    let suf = Array<Int64>(26, { _ => 0 })
    for (_ in 0..m) {
        let line = reader.readln().getOrThrow().split(" ", removeEmpty: true)
        let f = Int64.parse(line[0])
        let c = Int64(UInt32(line[1].toRuneArray()[0]) - UInt32(r'a'))
        if (f == 1) {
            pre[c] = pre[c] + 1
        } else {
            suf[c] = suf[c] + 1
        }
    }
    for (i in 0..n) {
        if (i > 0) {
            print(" ")
        }
        print(pre[head[i]] + suf[tail[i]])
    }
    println()
}
```
