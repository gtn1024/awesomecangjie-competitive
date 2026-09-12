---
oj: dmy
pid: '434'
title: '[R70B] 寻觅'
difficulty: 入门
tags:
  - 哈希表
timeLimit: 1s
memoryLimit: 512m
---

## 思路

用哈希表对每个出现过数值记录三样信息：出现次数、第一次出现的位置、最后一次出现的位置。

从左到右扫描序列，对当前值 $v$（位置为 $i$）：

- 若 $v$ 尚未出现，则记录次数为 $1$、首次和末次位置均为 $i$；
- 若 $v$ 已经出现，则次数加 $1$，并把末次位置更新为 $i$。

序列扫描结束后，对每次询问 $x$，若 $x$ 不在哈希表中输出 `0 -1 -1`，否则直接输出记录的三样信息。

由于 $a_i, x$ 最大可达 $10^9$，不能直接开数组，用哈希表按值存取。

复杂度：时间 $O(n + m)$，空间 $O(n)$。

## 仓颉实现

```cangjie
import std.convert.*
import std.collection.*
import std.env.*

main() {
    let reader = getStdIn()
    let nm = reader.readln().getOrThrow().split(" ", removeEmpty: true).map({ p: String => Int64.parse(p) })
    let m = nm[1]
    let a = reader.readln().getOrThrow().split(" ", removeEmpty: true).map({ p: String => Int64.parse(p) })
    let mp = HashMap<Int64, Array<Int64>>()
    var i = 0
    for (v in a) {
        let pos = i + 1
        if (mp.contains(v)) {
            let old = mp[v]
            old[0] = old[0] + 1
            old[2] = pos
        } else {
            let rec = Array<Int64>(3, { _ => 0 })
            rec[0] = 1
            rec[1] = pos
            rec[2] = pos
            mp[v] = rec
        }
        i = i + 1
    }
    var j = 0
    while (j < m) {
        let x = Int64.parse(reader.readln().getOrThrow())
        if (mp.contains(x)) {
            let rec = mp[x]
            println("${rec[0]} ${rec[1]} ${rec[2]}")
        } else {
            println("0 -1 -1")
        }
        j = j + 1
    }
}
```
