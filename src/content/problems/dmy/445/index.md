---
oj: dmy
pid: '445'
title: '[R72A] 暴力出奇迹'
difficulty: 普及-
tags:
  - 枚举
  - 模拟
timeLimit: 1s
memoryLimit: 256m
---

> 数据规模：$k \le 10^5$，$x, n_i, m_i \le 10^9$。

## 思路

题目直接给出了第 $i$ 个测试点能通过的条件：$n_i \le x$ 或 $m_i = 1$。依次读入每个测试点，条件成立就把答案加一即可。最容易写错的地方是把「或」误写成「且」。

## 复杂度

时间 $O(k)$，空间 $O(1)$。

## 仓颉实现

```cangjie
import std.convert.*
import std.env.*

main() {
    let reader = getStdIn()
    let first = reader.readln().getOrThrow().split(" ", removeEmpty: true).map({ p: String => Int64.parse(p) })
    let k = first[0]
    let x = first[1]
    var ans: Int64 = 0
    var i: Int64 = 0
    while (i < k) {
        let line = reader.readln().getOrThrow().split(" ", removeEmpty: true).map({ p: String => Int64.parse(p) })
        let n = line[0]
        let m = line[1]
        if (n <= x || m == 1) {
            ans += 1
        }
        i += 1
    }
    println(ans)
}
```