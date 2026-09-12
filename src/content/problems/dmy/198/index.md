---
oj: dmy
pid: '198'
title: '[R33A]数字求和'
difficulty: 入门
tags:
  - 数学
timeLimit: 1s
memoryLimit: 512m
---

> 数据规模：$123 \le n \le 987$，且 $n$ 的三个数字均不相同且不为 $0$。

## 思路

设三位数 $n$ 的三个数字依次为 $a, b, c$。它们的全排列共 $3! = 6$ 个。

对任意一个数字（例如 $a$）来说，在百位、十位、个位三个位置上，固定 $a$ 在某个位置后，剩下的两个数字 $b, c$ 可以任意排列，共 $2$ 种。因此 $a$ 在每个数位上都恰好出现 $2$ 次。$b, c$ 同理。

于是总和为：

$$
2(a+b+c)\times 100 + 2(a+b+c)\times 10 + 2(a+b+c)\times 1 = 222\,(a+b+c)
$$

例：$n=123$ 时，$222\times(1+2+3)=222\times 6=1332$。

## 复杂度

时间 $O(1)$，空间 $O(1)$。

## 仓颉实现

```cangjie
import std.env.*
import std.convert.*

main() {
    let reader = getStdIn()
    let n = Int64.parse(reader.readln().getOrThrow())
    let a = n / 100
    let b = n / 10 % 10
    let c = n % 10
    println((222 * (a + b + c)).toString())
}
```
