---
oj: dmy
pid: '50'
title: '[R9B] 奇偶差'
difficulty: 入门
tags:
  - 模拟
timeLimit: 1s
memoryLimit: 512m
---

> 数据规模：$1 \le n \le 10^6$，$1 \le A_i \le 10^9$。

## 思路

$|x - y|$ 最大只有两种可能：最大奇数减最小偶数，或最大偶数减最小奇数。遍历一遍维护奇数的最大值与最小值、偶数的最大值与最小值即可。若奇数和偶数不同时存在，输出 $-1$。

复杂度：时间 $O(n)$，空间 $O(1)$。

## 仓颉实现

```cangjie
import std.convert.*
import std.env.*

main() {
    let reader = getStdIn()
    reader.readln().getOrThrow()
    let a = reader.readln().getOrThrow().split(" ", removeEmpty: true).map({ p => Int64.parse(p) })
    var maxOdd: Int64 = -1
    var minOdd: Int64 = -1
    var maxEven: Int64 = -1
    var minEven: Int64 = -1
    var hasOdd = false
    var hasEven = false
    for (v in a) {
        if (v % 2 == 0) {
            if (!hasEven || v > maxEven) {
                maxEven = v
            }
            if (!hasEven || v < minEven) {
                minEven = v
            }
            hasEven = true
        } else {
            if (!hasOdd || v > maxOdd) {
                maxOdd = v
            }
            if (!hasOdd || v < minOdd) {
                minOdd = v
            }
            hasOdd = true
        }
    }
    if (!hasOdd || !hasEven) {
        println(-1)
    } else {
        var ans = maxOdd - minEven
        let t = maxEven - minOdd
        if (t > ans) {
            ans = t
        }
        println(ans)
    }
}
```
