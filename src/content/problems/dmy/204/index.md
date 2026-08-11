---
oj: dmy
pid: '204'
title: '[R34A]FizzBuzz 游戏'
difficulty: 入门
tags:
  - 模拟
timeLimit: 1s
memoryLimit: 512m
---

> 数据规模：$1 \le n \le 10^5$，$1 \le X, Y \le 10^9$，$1 \le a_i \le 10^9$。

## 思路

不需要真正构造字符串，只关心字符 `z` 的总数。对每个 $a_i$ 用两次取模判断它是不是 $X$、$Y$ 的倍数：

- 同时是 $X$ 和 $Y$ 的倍数，对应 `FizzBuzz`，贡献 $4$ 个 `z`；
- 仅是其中之一的倍数，对应 `Fizz` 或 `Buzz`，贡献 $2$ 个 `z`；
- 两者都不是，保持数字不变，贡献 $0$。

逐项累加即可。（题面样例解释里把 `Buzz` 误写成 `Bizz`，但 `Buzz` 同样有 $2$ 个 `z`，不影响计数。）

## 复杂度

时间 $O(n)$，空间 $O(n)$ 存数组（也可边读边算做到 $O(1)$）。

## 仓颉实现

```cangjie
import std.console.*
import std.convert.*

main(): Int64 {
    let reader = Console.stdIn
    let header = reader.readln().getOrThrow().split(" ", removeEmpty: true).map({ p: String => Int64.parse(p) })
    let n = header[0]
    let x = header[1]
    let y = header[2]
    let a = reader.readln().getOrThrow().split(" ", removeEmpty: true).map({ p: String => Int64.parse(p) })
    var ans: Int64 = 0
    var i = 0
    while (i < n) {
        let v = a[i]
        let mx = v % x == 0
        let my = v % y == 0
        if (mx && my) {
            ans += 4
        } else if (mx || my) {
            ans += 2
        }
        i++
    }
    println(ans)
    return 0
}
```
