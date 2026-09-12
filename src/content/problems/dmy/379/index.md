---
oj: dmy
pid: '379'
title: '[R61A] 四季'
difficulty: 入门
tags:
  - 模拟
timeLimit: 1s
memoryLimit: 512m
---

> 数据规模：$1 \le n \le 12$。

## 思路

按月份区间判断季节：$3 \sim 5$ 月为 `Spring`，$6 \sim 8$ 月为 `Summer`，$9 \sim 11$ 月为 `Autumn`，其余（$12$、$1$、$2$ 月）为 `Winter`。

复杂度：时间 $O(1)$，空间 $O(1)$。

## 仓颉实现

```cangjie
import std.env.*
import std.convert.*

main() {
    let reader = getStdIn()
    let n = Int64.parse(reader.readln().getOrThrow())
    var s = "Winter"
    if (3 <= n && n <= 5) {
        s = "Spring"
    } else if (6 <= n && n <= 8) {
        s = "Summer"
    } else if (9 <= n && n <= 11) {
        s = "Autumn"
    }
    println(s)
}
```

要点：

- 冬季覆盖三个不连续的月份（12、1、2），作为默认分支最方便：前三个区间都不命中时输出 `Winter`。
- 每个分支独立判断区间，不需要处理月份跨年的取模。
