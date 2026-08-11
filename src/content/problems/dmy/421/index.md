---
oj: dmy
pid: '421'
title: '[R68A] 发车'
difficulty: 入门
tags:
  - 数学
timeLimit: 1s
memoryLimit: 512m
---

> 数据规模：$0 \le S \le T \le 1000$，$1 \le K \le 1000$。

## 思路

发车时刻为 $S, S + K, S + 2K, \ldots$，即所有满足 $t \equiv S \pmod K$ 且 $t \ge S$ 的时刻。当前时刻 $T \ge S$，设 $d = (T - S) \bmod K$，则 $T$ 刚错过上一班车 $d$ 分钟，最近的一班车还要等：

- $d = 0$ 时恰逢发车，等待 $0$ 分钟；
- 否则下一班车在 $K - d$ 分钟后。

两种情形可统一写成 $(K - d) \bmod K$。

复杂度：时间 $O(1)$，空间 $O(1)$。

## 仓颉实现

```cangjie
import std.env.*
import std.convert.*

main(): Int64 {
    let reader = getStdIn()
    let s = reader.readln().getOrThrow().split(" ", removeEmpty: true).map({ p: String => Int64.parse(p) })
    let S = s[0]
    let K = s[1]
    let T = s[2]
    let r = (T - S) % K
    println(if (r == 0) { 0 } else { K - r })
    return 0
}
```

要点：

- 题目保证 $S \le T$，所以 $(T - S) \bmod K$ 非负，无需处理负数取模。
