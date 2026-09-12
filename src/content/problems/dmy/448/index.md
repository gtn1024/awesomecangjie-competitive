---
oj: dmy
pid: '448'
title: '[R72D] 过滤'
difficulty: 普及/提高-
tags:
  - 差分
  - 回文
timeLimit: 1s
memoryLimit: 256m
---

> 数据规模：$n \le 2 \times 10^5$，$1 \le a_i \le n$。

## 思路

只看一对对称位置 $(a_i, a_{n-i+1}) = (u, v)$，不妨设 $u < v$。由 $b$ 的定义：

- $x < u$ 时，两边都大于 $x$，$b$ 均为 $1$，配对相等；
- $u \le x < v$ 时，只有一边满足 $a \le x$，$b$ 不相等；
- $x \ge v$ 时，两边都不大于 $x$，$b$ 均为 $0$，配对相等。

因此这一对位置恰好使阈值区间 $[u, v-1]$ 非法；若 $u = v$，则对任意阈值都相等。对每对对称位置取 $l = \min(u, v)$、$r = \max(u, v)$，当 $l < r$ 时用差分数组把区间 $[l, r-1]$ 加一。

最后对差分数组做前缀和，覆盖次数为 $0$ 的阈值 $x$ 就是使 $b$ 为回文数组的答案（覆盖次数即该阈值下的失配对数）。

## 复杂度

时间 $O(n)$，空间 $O(n)$。

## 仓颉实现

```cangjie
import std.env.*
import std.convert.*

main() {
    let reader = getStdIn()
    let n = Int64.parse(reader.readln().getOrThrow())
    let nn = n
    let a = reader.readln().getOrThrow().split(" ", removeEmpty: true).map({ p: String => Int64.parse(p) })

    // 差分数组按值 1..n 建立，大小 n+2，下标 0..n+1
    let diff = Array<Int64>(nn + 2, { _ => 0 })

    var i = 0
    while (i < (nn + 1) / 2) {
        let u = a[i]
        let v = a[nn - 1 - i]
        var l = u
        var r = v
        if (l > r) {
            l = v
            r = u
        }
        if (l < r) {
            diff[l] += 1
            diff[r] -= 1
        }
        i += 1
    }

    // 前缀和：覆盖次数为 0 的阈值 x 即为答案，先数出个数 k
    var k: Int64 = 0
    var cur: Int64 = 0
    i = 1
    while (i <= nn) {
        cur += diff[i]
        if (cur == 0) {
            k += 1
        }
        i += 1
    }
    println(k)

    // 第二遍扫描直接输出合法阈值，空格分隔，行尾换行
    var sep = ""
    cur = 0
    i = 1
    while (i <= nn) {
        cur += diff[i]
        if (cur == 0) {
            print(sep)
            print(i)
            sep = " "
        }
        i += 1
    }
    println()
}
```