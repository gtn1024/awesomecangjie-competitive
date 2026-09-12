---
oj: dmy
pid: '281'
title: '[R46A]难题'
difficulty: 入门
tags:
  - 数学
timeLimit: 1s
memoryLimit: 512m
---

> 数据规模：$0 \le A, B \le 10^{8}$。

## 思路

乘积 $A \times B$ 为奇数，当且仅当 $A$ 与 $B$ 同时为奇数：奇数 $\times$ 奇数 $=$ 奇数，而只要其中有一个偶数，乘积中就含有因子 $2$，必然为偶数。$0$ 视作偶数。

因此只需判断 $A \bmod 2 = 1$ 且 $B \bmod 2 = 1$ 是否同时成立，是则输出 `Yes`，否则输出 `No`。

## 复杂度

时间 $O(1)$，空间 $O(1)$。

## 仓颉实现

```cangjie
import std.convert.*
import std.env.*

main() {
    let reader = getStdIn()
    let v = reader.readln().getOrThrow().split(" ", removeEmpty: true).map({ p: String => Int64.parse(p) })
    if ((v[0] % 2 == 1) && (v[1] % 2 == 1)) {
        println("Yes")
    } else {
        println("No")
    }
}
```

要点：

- 一行读入两个整数，`split(" ", removeEmpty: true)` 容忍行尾多余空格，下标从 $0$ 开始取 $A=v[0]$、$B=v[1]$。
- 只看奇偶性，不需要真正计算乘积，避免溢出与多余运算。
