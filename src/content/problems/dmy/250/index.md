---
oj: dmy
pid: '250'
title: '[R41A] 出题组 3'
difficulty: 入门
tags:
  - 模拟
  - 数学
timeLimit: 1s
memoryLimit: 512m
---

> 数据规模：$1 \le n, x, y, k \le 100$，$1 \le y \le n$，$x < k$。

## 思路

第 $x$ 场比赛由出题组 $y$ 出题后，每经过一场比赛，出题组编号加 $1$。编号超过 $n$ 时回到 $1$，因此一共前进 $k - x$ 步。

先把编号转为从 $0$ 开始，再取模即可：

$$
ans = (y - 1 + k - x) \bmod n + 1
$$

## 复杂度

时间复杂度 $O(1)$，空间复杂度 $O(1)$。

## 仓颉实现

```cangjie
import std.convert.*
import std.env.*

main(): Int64 {
    let reader = getStdIn()
    let values = reader.readln().getOrThrow().split(" ", removeEmpty: true).map({ p: String => Int64.parse(p) })
    let n = values[0]
    let x = values[1]
    let y = values[2]
    let k = values[3]

    let answer = (y - 1 + k - x) % n + 1
    println(answer)
    return 0
}
```
