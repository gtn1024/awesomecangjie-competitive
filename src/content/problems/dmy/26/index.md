---
oj: dmy
pid: '26'
title: '[R5B] 次大质因数'
difficulty: 入门
tags:
  - 数论
timeLimit: 1s
memoryLimit: 512m
---

> 数据规模：$2 \le N \le 10^6$。

## 思路

对 $N$ 分解质因数，用试除循环把每个质因数（去重）按从小到大的顺序收集到列表。若列表长度小于 $2$，说明质因数不足两个，输出 $-1$；否则输出列表中倒数第二个元素，即次大质因数。

复杂度：时间 $O(\sqrt N)$，空间 $O(\log N)$。

## 仓颉实现

```cangjie
import std.collection.*
import std.convert.*
import std.env.*

main() {
    let reader = getStdIn()
    let n = Int64.parse(reader.readln().getOrThrow())
    var x = n
    var i: Int64 = 2
    let factors = ArrayList<Int64>()
    while (i * i <= x) {
        if (x % i == 0) {
            factors.add(i)
            while (x % i == 0) {
                x = x / i
            }
        }
        i = i + 1
    }
    if (x > 1) {
        factors.add(x)
    }
    if (factors.size < 2) {
        println(-1)
    } else {
        println(factors[factors.size - 2])
    }
}
```
