---
oj: dmy
pid: '367'
title: '[R59B] 原始的排序'
difficulty: 入门
tags:
  - 模拟
timeLimit: 1s
memoryLimit: 512m
---

> 数据规模：$1 \le n, q \le 5000$，$1 \le a_i \le n$。

## 思路

每次交换两个位置 $x, y$ 后，序列中只有 $a_x$ 与 $a_y$ 发生变化，相邻关系 $a_i > a_{i+1}$ 也只会影响 $i \in \{x-1, x, y-1, y\}$ 这些位置。不过本题 $n, q \le 5000$，最朴素的做法——每次交换后重新扫描一遍整个序列统计满足 $a_i > a_{i+1}$ 的下标个数——也只要 $O(nq) = 2.5 \times 10^7$ 次比较，完全够用，无需维护增量。

具体地：把交换坐标转成 0 下标，交换元素后遍历 $i = 0 \ldots n-2$，累加 $a_i > a_{i+1}$ 的个数并输出。

## 复杂度

时间 $O(nq)$，空间 $O(n)$。

## 仓颉实现

```cangjie
import std.env.*
import std.convert.*

main() {
    let reader = getStdIn()
    let line = reader.readln().getOrThrow().split(" ", removeEmpty: true).map({ p: String => Int64.parse(p) })
    let n = line[0]
    let q = line[1]
    let a = reader.readln().getOrThrow().split(" ", removeEmpty: true).map({ p: String => Int64.parse(p) })
    for (_ in 0..q) {
        let t = reader.readln().getOrThrow().split(" ", removeEmpty: true).map({ p: String => Int64.parse(p) })
        let x = t[0] - 1
        let y = t[1] - 1
        let tmp = a[x]
        a[x] = a[y]
        a[y] = tmp
        var cnt = 0
        for (j in 0..(n - 1)) {
            if (a[j] > a[j + 1]) {
                cnt += 1
            }
        }
        println(cnt)
    }
}
```
