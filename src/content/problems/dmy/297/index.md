---
oj: dmy
pid: '297'
title: '[R48B]相等数对'
difficulty: 普及
tags:
  - 枚举
timeLimit: 1s
memoryLimit: 512m
---

> 对于 $100\%$ 的数据，$1 \le n \le 1000$，$1 \le A_i, B_i \le 10^9$。

## 思路

$n \le 1000$，$O(n^2)$ 完全可过。直接双重循环枚举下标 $i$、$j$（$0 \le i, j < n$），当 $i \neq j$ 且 $a_i = b_j$ 时累加答案即可。

注意题面中 $i$、$j$ 都取 $1 \dots n$，且条件 $i \neq j$ 是「下标不同」。因此下标只需用同一套编号比较即可，0 基或 1 基不影响结果。

## 复杂度

- 时间：$O(n^2)$，$n \le 1000$ 时约为 $10^6$ 次比较。
- 空间：$O(n)$，仅存储两个数组。

## 仓颉实现

```cangjie
import std.convert.*
import std.env.*

main() {
    let reader = getStdIn()
    let n = Int64.parse(reader.readln().getOrThrow())
    let a = reader.readln().getOrThrow().split(" ", removeEmpty: true).map({ p: String => Int64.parse(p) })
    let b = reader.readln().getOrThrow().split(" ", removeEmpty: true).map({ p: String => Int64.parse(p) })

    var ans: Int64 = 0
    var i = 0
    while (i < n) {
        var j = 0
        while (j < n) {
            if (i != j && a[i] == b[j]) {
                ans += 1
            }
            j += 1
        }
        i += 1
    }
    println(ans)
}
```
