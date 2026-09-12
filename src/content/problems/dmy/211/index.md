---
oj: dmy
pid: '211'
title: '[R35B]近回文数'
difficulty: 普及
tags:
  - 模拟
  - 暴力
timeLimit: 1s
memoryLimit: 512m
---

> 对于 $100\%$ 的数据，$1 \leq l \leq r \leq 2 \times 10^5$。

## 思路

数据范围很小（$r \leq 2 \times 10^5$），直接对区间内每个数 $x$ 判断它是否为近回文数即可，无需特殊优化。

关键在于如何高效判断。把 $x$ 的十进制字符串记为 $s$，设其长度为 $n$。**只考虑左右对称的位置对** $(i, n-1-i)$（$i < n/2$），统计这些位置对中两端字符不相等的对数 $m$：

- $m = 0$：所有对称位置都相等，$x$ 本身就是回文数，是近回文数。
- $m = 1$：恰好一对对称位置不等，把其中任意一端改成与另一端相同，只动了一位，即可得到回文数，是近回文数。
- $m \geq 2$：至少有两对对称位置不等，而每改一位最多修复一对，只改一位不可能让所有对称对都相等，不是近回文数。

因此 **$x$ 是近回文数，当且仅当 $m \leq 1$**。这个判据同时覆盖了「本身回文」和「修改一位成回文」两种情形。注意，当 $n$ 为奇数时，中间位不与任何位配对，改它不影响 $m$，但由于 $m \leq 1$ 已经允许「不改动」，奇数中间位的自由度并不引入额外判据，上面的充要条件依然成立。

按 $x$ 从 $l$ 到 $r$ 从小到大枚举，逐个判断并输出即可。

## 复杂度

- 每个数转字符串、扫描一半长度，单次判断 $O(\log_{10} x) \leq O(6)$。
- 共枚举至多 $2 \times 10^5$ 个数，总时间 $O(r \log r)$，运行很快。

## 仓颉实现

```cangjie
import std.console.*
import std.convert.*

// 判断一个数是否为「近回文数」：
// 本身回文（m=0），或只修改一位能成回文（即十进制表示中对称位置不匹配的对数 m<=1）。
func isNearPal(x: Int64): Bool {
    var s = x.toString()
    var arr = s.toRuneArray()
    var n = arr.size
    var m = 0
    var half = n / 2
    var i = 0
    while (i < half) {
        if (arr[i] != arr[n - 1 - i]) {
            m = m + 1
        }
        i = i + 1
    }
    return m <= 1
}

main() {
    let reader = Console.stdIn
    let parts = reader.readln().getOrThrow().split(" ", removeEmpty: true).map({ p: String => Int64.parse(p) })
    let l = parts[0]
    let r = parts[1]
    var x = l
    while (x <= r) {
        if (isNearPal(x)) {
            println(x)
        }
        x = x + 1
    }
}
```
