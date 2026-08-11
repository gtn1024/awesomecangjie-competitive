---
oj: dmy
pid: '33'
title: '[R6C] 分班'
difficulty: 普及-
tags:
  - 模拟
  - 图论
timeLimit: 2s
memoryLimit: 512m
---

> 数据规模：$1 \le n \le 10^5$，$1 \le a_i \le 10^9$，$0 \le m \le 2 \times 10^6$。

## 思路

按编号从小到大模拟分班。用邻接表记录「与 $x$ 有矛盾且编号小于 $x$」的人：对每条矛盾 $(u, v)$，把较小的编号加入较大编号的邻接表。这样轮到 $x$ 时，只需检查 $vec[x]$ 中的人所在班级，就能判断 $x$ 与哪个班有矛盾：

- 两个班都有矛盾对象，则输出 $-1$；
- 仅 1 班有，则分到 2 班；仅 2 班有，则分到 1 班；
- 都没有，则分到总团结度更低的班，平局分到 1 班。

同时用两个变量维护两班团结度之和。

复杂度：时间 $O(n + m)$，空间 $O(n + m)$。

## 仓颉实现

```cangjie
import std.collection.*
import std.convert.*
import std.env.*

main() {
    let reader = getStdIn()
    let n = Int64.parse(reader.readln().getOrThrow())
    let a = reader.readln().getOrThrow().split(" ", removeEmpty: true).map({ p => Int64.parse(p) })
    let m = Int64.parse(reader.readln().getOrThrow())
    let vec = ArrayList<ArrayList<Int64>>(n + 1, { _ => ArrayList<Int64>() })
    for (_ in 0..m) {
        let line = reader.readln().getOrThrow().split(" ", removeEmpty: true).map({ p => Int64.parse(p) })
        let u = line[0]
        let v = line[1]
        if (u < v) {
            vec[v].add(u)
        } else {
            vec[u].add(v)
        }
    }
    let cls = Array<Int64>(n + 1, { _ => 0 })
    var sum1: Int64 = 0
    var sum2: Int64 = 0
    for (x in 1..(n + 1)) {
        var has1 = false
        var has2 = false
        for (y in vec[x]) {
            if (cls[y] == 1) {
                has1 = true
            } else if (cls[y] == 2) {
                has2 = true
            }
        }
        if (has1 && has2) {
            cls[x] = -1
            println(-1)
        } else if (has1) {
            cls[x] = 2
            sum2 = sum2 + a[x - 1]
            println(2)
        } else if (has2) {
            cls[x] = 1
            sum1 = sum1 + a[x - 1]
            println(1)
        } else {
            if (sum1 <= sum2) {
                cls[x] = 1
                sum1 = sum1 + a[x - 1]
                println(1)
            } else {
                cls[x] = 2
                sum2 = sum2 + a[x - 1]
                println(2)
            }
        }
    }
}
```
