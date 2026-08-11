---
oj: dmy
pid: '2'
title: '[R1B] 砖块覆盖'
difficulty: 入门
tags:
  - 数学
timeLimit: 1s
memoryLimit: 512m
---

> 数据规模：$1 \le T \le 100$，$1 \le n,m \le 1000$。

## 思路

每块砖面积为 $2$，覆盖的总面积必须是偶数，因此 $n \times m$ 为奇数时无解。

当 $n \times m$ 为偶数时，$n$ 与 $m$ 至少有一个是偶数：若 $n$ 为偶数，把 $2 \times 1$ 的砖竖着铺满 $n$ 行；否则 $m$ 为偶数，用 $1 \times 2$ 的砖横着铺满 $m$ 列，一定存在覆盖方案。

所以只需要判断 $n \times m$ 的奇偶性。

复杂度：时间 $O(T)$，空间 $O(1)$。

## 仓颉实现

```cangjie
import std.env.*
import std.convert.*

let reader = getStdIn()

func solve(): Unit {
    let arr = reader.readln().getOrThrow().split(" ")
    let n = Int64.parse(arr[0])
    let m = Int64.parse(arr[1])
    if ((n * m) % 2 == 0) {
        println("Yes")
    } else {
        println("No")
    }
}

main(): Int64 {
    let t = Int64.parse(reader.readln().getOrThrow())
    for (_ in 1..=t) {
        solve()
    }
    return 0
}
```

要点：

- $n,m \le 1000$，$n \times m$ 不超过 $10^6$，用 `Int64` 计算不存在溢出。
