---
oj: dmy
pid: '447'
title: '[R72C] 协调'
difficulty: 普及
tags:
  - 数学
  - 模拟
timeLimit: 1s
memoryLimit: 256m
---

> 数据规模：$1 \le T \le 10^4$，$1 \le n \le 2 \times 10^5$，$0 \le a_i \le 10^9$，且单个测试点内所有测试数据的 $n$ 之和不超过 $2 \times 10^5$。

## 思路

假设调整后所有元素都等于 $v$。对于每个奇数下标 $i$ 有

$$a_i + x = v$$

所有奇数位置加上的数相同，因此它们在调整前就必须全部相等，记这个公共值为 $O$。同理，所有偶数位置在调整前也必须全部相等，记公共值为 $E$。

当奇数位置、偶数位置都存在时，还需要奇数位置上加 $x$ 的结果等于偶数位置上减 $x$ 的结果：

$$O + x = E - x$$

即 $2x = E - O$。因为 $x$ 是非负整数，所以合法解存在的条件为：

1. 所有奇数下标的值相同；
2. 所有偶数下标的值相同；
3. $E \ge O$；
4. $E - O$ 是偶数。

条件成立时唯一可能的答案是 $x = (E - O) / 2$，既是唯一解，自然也是最小合法值。

当 $n = 1$ 时没有偶数位置，单个元素总是已经「全部相等」，最小答案为 $0$。

实现时只需一遍扫描，用第一个奇数位置的值 $O$ 和第一个偶数位置的值 $E$ 作为基准，检查各自位置是否全部相等，再按上述条件判断即可。

## 复杂度

时间 $O(\sum n)$，空间 $O(n)$（仅存数组）。

## 仓颉实现

```cangjie
import std.env.*
import std.convert.*

func solve(reader: ConsoleReader) {
    let n = Int64.parse(reader.readln().getOrThrow())
    if (n == 1) {
        reader.readln()
        println("0")
        return
    }
    let a = reader.readln().getOrThrow().split(" ", removeEmpty: true).map({ p: String => Int64.parse(p) })
    let o = a[0]
    let e = a[1]
    var ok = true
    let nn = n
    for (i in 1..nn) {
        if (i % 2 == 0) {
            if (a[i] != o) {
                ok = false
            }
        } else {
            if (a[i] != e) {
                ok = false
            }
        }
    }
    if (!ok || e < o || (e - o) % 2 != 0) {
        println("-1")
        return
    }
    println(((e - o) / 2).toString())
}

main(): Int64 {
    let reader = getStdIn()
    let t = Int64.parse(reader.readln().getOrThrow())
    for (_ in 0..t) {
        solve(reader)
    }
    return 0
}
```