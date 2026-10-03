---
oj: dmy
pid: '205'
title: '[R34B]括号回文串'
difficulty: 普及
tags:
  - 贪心
timeLimit: 1s
memoryLimit: 512m
---

> 数据规模：$1 \le n \le 10^5$，$1 \le a_i \le 1000$，字符串 $s$ 仅由 `(` 和 `)` 组成。

## 思路

回文串要求每一对对称位置字符相同，即 $s[i] = s[n-1-i]$。把所有需要满足的约束拆成两两独立的对称对 $(i, n-1-i)$（$i < n/2$），它们之间互不影响，可以分别求最小花费再累加。

对于每一对：

- 若 $s[i] = s[n-1-i]$，已经满足回文条件，花费 $0$；
- 若 $s[i] \ne s[n-1-i]$，需要把其中一个字符翻转。由于两个位置只要改其中一个就能让它们相同，取代价较小的那个，即 $\min(a[i], a[n-1-i])$。

$n$ 为奇数时正中间那个字符自成回文（它与自己对称），无需处理。

## 复杂度

时间 $O(n)$，空间 $O(n)$ 存字符串和代价数组。

## 仓颉实现

<details>
<summary>查看仓颉实现</summary>

```cangjie
import std.console.*
import std.convert.*

main() {
    let reader = Console.stdIn
    let n = Int64.parse(reader.readln().getOrThrow())
    let s = reader.readln().getOrThrow()
    let a = reader.readln().getOrThrow().split(" ", removeEmpty: true).map({ p: String => Int64.parse(p) })
    let nn = n
    var ans: Int64 = 0
    var i = 0
    while (i < nn / 2) {
        if (s[i] != s[nn - 1 - i]) {
            let x = a[i]
            let y = a[nn - 1 - i]
            if (x < y) {
                ans += x
            } else {
                ans += y
            }
        }
        i++
    }
    println(ans)
}
```

</details>
