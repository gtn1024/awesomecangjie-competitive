---
oj: dmy
pid: '28'
title: '[R5D] 数字变异'
difficulty: 入门
tags:
  - 模拟
  - 循环检测
timeLimit: 1s
memoryLimit: 512m
---

## 思路

$n$ 可达 $10^{100000}$，以字符串读入并求数位和。变异一次后结果不超过 $9 \times 10^5 + m \le 1.9 \times 10^6$，之后每次变异的结果也始终在 $10^6$ 量级，因此过程中出现的数字种类有限，序列必然进入循环。

用 `first[x]` 记录数字 $x$ 最早在第几次变异后被产生。模拟过程中一旦产生一个之前出现过的数字 $y$，说明从 `first[y]` 到当前步之间是一个长度为 `len = steps - first[y]` 的循环，剩下的 `k - steps` 步只需再走 `(k - steps) % len` 步即可。

复杂度：时间 $O(\text{len}(n) + \min(k, 2 \times 10^6))$，空间 $O(2 \times 10^6)$。

## 仓颉实现

```cangjie
import std.convert.*
import std.env.*

func digitSum(s: String): Int64 {
    var sum: Int64 = 0
    for (ch in s) {
        sum += Int64(ch) - 48
    }
    sum
}

func mutate(x: Int64, m: Int64): Int64 {
    var v = x
    var s: Int64 = 0
    while (v > 0) {
        s += v % 10
        v /= 10
    }
    s + m
}

main() {
    let reader = getStdIn()
    let parts = reader.readln().getOrThrow().split(" ", removeEmpty: true)
    let m = Int64.parse(parts[1])
    let k = Int64.parse(parts[2])
    let first = Array<Int64>(2000010, { _ => -1 })
    var x = digitSum(parts[0]) + m
    var steps: Int64 = 1
    first[x] = 1
    while (steps < k) {
        x = mutate(x, m)
        steps += 1
        if (first[x] != -1) {
            let len = steps - first[x]
            let rem = (k - steps) % len
            for (_ in 0..rem) {
                x = mutate(x, m)
            }
            break
        }
        first[x] = steps
    }
    println(x)
}
```
