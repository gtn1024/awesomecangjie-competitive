---
oj: dmy
pid: '229'
title: '[R38A]不为倍数'
difficulty: 普及
tags:
  - 模拟
  - 数论
timeLimit: 1s
memoryLimit: 512m
---

> 对于 $100\%$ 的数据，$0 \leq n \leq 1000$，$1 \leq X \leq 10^5$，$1 \le a_i \le X$。

## 思路

$X$ 的范围很小（最多 $10^5$），可以直接开一个布尔数组 `bad[1..X]`，表示每个位置是否是某个 $a_i$ 的倍数。

对每个 $a_i$，把它的所有不超过 $X$ 的倍数 $a_i, 2a_i, 3a_i, \dots$ 逐一标记为 `true`。最后数 $1$ 到 $X$ 中 `bad` 为 `false` 的位置个数即为答案。

几点细节：

- $n$ 可能为 $0$，此时没有第二行输入，直接输出 $X$ 即可，读入时要判断后再读数组。
- $a_i$ 中可能出现重复或 $1$（$1$ 会把所有数标记掉），无需特殊处理，重复标记只是多写几次相同位置。
- 每个位置只被标记一次，重复标记不会影响正确性。

## 复杂度

- 时间：每个 $a_i$ 最多标记 $\frac{X}{a_i}$ 个位置，总和不超过 $n \cdot \frac{X}{a_i}$；最坏情况下（全部 $a_i=1$）为 $O(n)$，整体上界为 $O(n + X)$。
- 空间：$O(X)$ 的布尔数组。

## 仓颉实现

```cangjie
import std.console.*
import std.convert.*

main() {
    let reader = Console.stdIn
    let first = reader.readln().getOrThrow().split(" ", removeEmpty: true).map({ p: String => Int64.parse(p) })
    let n = first[0]
    let X = first[1]
    let bad = Array<Bool>(X + 1, { _ => false })
    if (n > 0) {
        let a = reader.readln().getOrThrow().split(" ", removeEmpty: true).map({ p: String => Int64.parse(p) })
        for (ai in a) {
            var k = ai
            while (k <= X) {
                bad[k] = true
                k += ai
            }
        }
    }
    var ans = 0
    var i = 1
    while (i <= X) {
        if (!bad[i]) {
            ans++
        }
        i++
    }
    println(ans)
}
```
