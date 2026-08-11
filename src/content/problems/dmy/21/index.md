---
oj: dmy
pid: '21'
title: '[R4C] 因式分解'
difficulty: 入门
tags:
  - 数论
timeLimit: 1s
memoryLimit: 512m
---

> 数据规模：$1 \le n \le 10^4$，$2 \le A_i \le 10^6$。

## 思路

多个整数乘积的因式分解，等价于对每个整数分解后把相同质因数的指数相加。

对每个 $A_i$ 用 $2$ 开始递增试除，直到 $i \times i > x$；因子 $i$ 被完全除尽后记下指数 $k$，累加到 $cnt[i]$。若最后剩余 $x > 1$，说明它是一个大于 $\sqrt{A_i}$ 的质因子，累加到 $cnt[x]$。

最后从小到大输出所有 $cnt[i] \neq 0$ 的 $i$ 与 $cnt[i]$ 即可。

复杂度：时间 $O(n\sqrt V + V)$（$V = \max A_i$），空间 $O(V)$。

## 仓颉实现

```cangjie
import std.convert.*
import std.env.*

main() {
    let reader = getStdIn()
    reader.readln().getOrThrow()
    let a = reader.readln().getOrThrow().split(" ", removeEmpty: true).map({ p => Int64.parse(p) })
    let cnt = Array<Int64>(1000001, { _ => 0 })
    for (v in a) {
        var x = v
        var i: Int64 = 2
        while (i * i <= x) {
            if (x % i == 0) {
                var k: Int64 = 0
                while (x % i == 0) {
                    x = x / i
                    k = k + 1
                }
                cnt[i] = cnt[i] + k
            }
            i = i + 1
        }
        if (x > 1) {
            cnt[x] = cnt[x] + 1
        }
    }
    var first = true
    for (i in 2..1000001) {
        if (cnt[i] != 0) {
            if (first) {
                first = false
            } else {
                print(" ")
            }
            print(i)
            print(" ")
            print(cnt[i])
        }
    }
    println()
}
```
