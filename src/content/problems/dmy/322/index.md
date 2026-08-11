---
oj: dmy
pid: '322'
title: '[R52A] R'
difficulty: 入门
tags:
  - 数学
  - 构造
timeLimit: 1s
memoryLimit: 512m
---

> 数据规模：$1 \le T \le 100$，$1 \le a,b \le 10^9$。

## 思路

每场比赛恰好加入一道此前未使用的传统题。为了让 $a$ 道传统题全部出现，比赛场数必须恰好为 $a$。

每场比赛还要加入至少两道此前未使用的交互题，因此 $a$ 场比赛至少需要 $2a$ 道交互题。于是 $b \ge 2a$ 是必要条件。

这个条件也足够。若 $b \ge 2a$，可以让前 $a-1$ 场比赛分别加入一道传统题和两道交互题，最后一场加入剩余的一道传统题以及

$$
b-2(a-1)
$$

道交互题。因为 $b-2(a-1) \ge 2$，最后一场同样满足要求，且所有题恰好都被加入比赛。

所以，当且仅当 $b \ge 2a$ 时输出 `NOI`，否则输出 `NOIP`。

复杂度：每组测试用例的时间复杂度为 $O(1)$，空间复杂度为 $O(1)$；总时间复杂度为 $O(T)$。

## 仓颉实现

```cangjie
import std.console.*
import std.convert.*

func solve(reader: ConsoleReader): Unit {
    let values = reader.readln().getOrThrow().split(" ", removeEmpty: true).map({ p: String => Int64.parse(p) })
    let a = values[0]
    let b = values[1]
    if (b >= 2 * a) {
        println("NOI")
    } else {
        println("NOIP")
    }
}

main(): Int64 {
    let reader = Console.stdIn
    let t = Int64.parse(reader.readln().getOrThrow())
    for (_ in 0..t) {
        solve(reader)
    }
    return 0
}
```
