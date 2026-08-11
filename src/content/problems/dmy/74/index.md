---
oj: dmy
pid: '74'
title: '[R13B] n位数'
difficulty: 入门
tags:
  - 贪心
timeLimit: 1s
memoryLimit: 512m
---

> 数据规模：$1 \le n \le 1000$，$1 \le m \le 9n$。

## 思路

答案可能是上千位的整数，不能用整数类型保存，按位构造字符串输出。

要得到「最大」的 $n$ 位数，贪心：从高位到低位，每一位在能保证剩余位凑出剩余数位和的前提下尽量取大。设当前已到第 $i$ 位（$0$ 开始），后面还有 $rest = n-i-1$ 位。

- 当前位最大能取 $\min(9, m)$，其中 $m$ 是剩余数位和；
- 但至少要留下足够的空间让后面 $rest$ 位凑出剩余和，每位最大为 9，因此当前位至少为 $m - 9 \times rest$；
- 首位还必须 $\ge 1$，保证是 $n$ 位数。

逐位取两者之间的值即可，$m \le 9n$ 保证始终有解。

复杂度：时间 $O(n)$，空间 $O(n)$。

## 仓颉实现

```cangjie
import std.env.*
import std.convert.*

main(): Int64 {
    let reader = getStdIn()
    let nm = reader.readln().getOrThrow().split(" ", removeEmpty: true).map({ p => Int64.parse(p) })
    let n = nm[0]
    var m = nm[1]
    let sb = StringBuilder()
    for (i in 0..n) {
        let rest = n - i - 1
        var x = m
        if (x > 9) {
            x = 9
        }
        var lower = m - 9 * rest
        if (i == 0 && lower < 1) {
            lower = 1
        }
        if (lower > 0 && x < lower) {
            x = lower
        }
        sb.append(x)
        m = m - x
    }
    println(sb.toString())
    return 0
}
```

要点：

- `m` 用可变变量维护剩余数位和，每确定一位就减去该位的值。
- 首位下限取 `max(1, m - 9 * rest)`，其余位下限取 `max(0, m - 9 * rest)`，保证剩余位数能凑满数位和且首位非零。
