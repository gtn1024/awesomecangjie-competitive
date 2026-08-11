---
oj: dmy
pid: '49'
title: '[R9A] 六进制'
difficulty: 入门
tags:
  - 进制
timeLimit: 1s
memoryLimit: 512m
---

> 数据规模：$1 \le x \le 10^{18}$。

## 思路

反复执行 $x \bmod 6$ 取出最低位、$x / 6$ 去除最低位，得到六进制下从低位到高位的各位数字，最后反向输出。$x = 0$ 时单独输出 $0$。

复杂度：时间 $O(\log x)$，空间 $O(\log x)$。

## 仓颉实现

```cangjie
import std.collection.*
import std.convert.*
import std.env.*

main() {
    let reader = getStdIn()
    var x = Int64.parse(reader.readln().getOrThrow())
    let digits = ArrayList<Int64>()
    if (x == 0) {
        println(0)
        return
    }
    while (x > 0) {
        digits.add(x % 6)
        x = x / 6
    }
    for (i in 0..digits.size) {
        print(digits[digits.size - 1 - i])
    }
    println()
}
```
