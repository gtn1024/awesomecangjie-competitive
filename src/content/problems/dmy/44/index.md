---
oj: dmy
pid: '44'
title: '[R8B] 排序'
difficulty: 普及-
tags:
  - 排序
timeLimit: 1s
memoryLimit: 512m
---

> 数据规模：$1 \le n \le 2000$，$1 \le m \le 10$，$1 \le c_{i,j} \le 100$。

## 思路

读入每个同学的分数，同时统计通过科目数 $num[i]$（分数不低于 $60$）和总分 $sum[i]$。把编号、通过科目数、总分放进结构体，按「通过科目数降序、总分降序、编号升序」排序后输出编号。

复杂度：时间 $O(nm + n\log n)$，空间 $O(n)$。

## 仓颉实现

```cangjie
import std.collection.*
import std.convert.*
import std.env.*
import std.sort.*

class Student <: Comparable<Student> {
    var id: Int64
    var num: Int64
    var sum: Int64
    init(id: Int64, num: Int64, sum: Int64) {
        this.id = id
        this.num = num
        this.sum = sum
    }
    public func compare(that: Student): Ordering {
        if (this.num != that.num) {
            return if (this.num > that.num) { LT } else { GT }
        }
        if (this.sum != that.sum) {
            return if (this.sum > that.sum) { LT } else { GT }
        }
        if (this.id < that.id) {
            return LT
        } else if (this.id > that.id) {
            return GT
        } else {
            return EQ
        }
    }
}

main() {
    let reader = getStdIn()
    let line0 = reader.readln().getOrThrow().split(" ", removeEmpty: true).map({ p => Int64.parse(p) })
    let n = line0[0]
    let st = ArrayList<Student>()
    for (i in 1..(n + 1)) {
        let c = reader.readln().getOrThrow().split(" ", removeEmpty: true).map({ p => Int64.parse(p) })
        var num: Int64 = 0
        var sum: Int64 = 0
        for (v in c) {
            sum = sum + v
            if (v >= 60) {
                num = num + 1
            }
        }
        st.add(Student(i, num, sum))
    }
    let arr = st.toArray()
    sort(arr)
    var first = true
    for (s in arr) {
        if (first) {
            first = false
        } else {
            print(" ")
        }
        print(s.id)
    }
    println()
}
```
