---
oj: dmy
pid: '105'
title: '[R18C]支架2'
difficulty: 提高
tags:
  - 贪心
  - 排序
timeLimit: 1s
memoryLimit: 512m
---

> 对于 $100\%$ 的数据，$1\leq n,m\leq 3000$，$1\leq a_i,b_i\leq 10^9$。

## 思路

把支架承重数组 $a$ 和艺术品重量数组 $b$ 都升序排序后，用双指针贪心匹配：指针 $i$ 扫描支架，指针 $j$ 扫描艺术品，都从小到大走。

- 若 $a_i\geq b_j$，说明当前支架能承载当前（还未匹配的最轻的）艺术品，把它们匹配，两个指针同时右移，答案加一。
- 否则 $a_i<b_j$，当前支架太弱，连最轻的未匹配艺术品都撑不住，这个支架永远用不上，指针 $i$ 右移即可。

正确性在于：对最小的可用支架，能匹配的最优选择是当前最轻的未匹配艺术品（把更轻的留到后面没有收益）；而连最轻的都承载不了的支架直接丢弃也不影响最优解。

## 复杂度

- 时间：排序 $O(n\log n+m\log m)$，双指针 $O(n+m)$。
- 空间：$O(n+m)$。

## 仓颉实现

```cangjie
import std.convert.*
import std.env.*
import std.sort.*

main(): Int64 {
    let reader = getStdIn()
    let nm = reader.readln().getOrThrow().split(" ", removeEmpty: true).map({ p: String => Int64.parse(p) })
    let n = nm[0]
    let m = nm[1]
    let a = reader.readln().getOrThrow().split(" ", removeEmpty: true).map({ p: String => Int64.parse(p) })
    let b = reader.readln().getOrThrow().split(" ", removeEmpty: true).map({ p: String => Int64.parse(p) })
    sort(a)
    sort(b)
    var i = 0
    var j = 0
    var count = 0
    while (i < n && j < m) {
        if (a[i] >= b[j]) {
            i++
            j++
            count++
        } else {
            i++
        }
    }
    println(count)
    return 0
}
```
