---
oj: dmy
pid: '415'
title: '[R67A] 贴纸'
difficulty: 入门
tags:
  - 模拟
timeLimit: 1s
memoryLimit: 512m
---

> 数据规模：$0 \le a \le 10$，$0 \le b \le 10$。

## 思路

一页最多 10 张，判断 $a + b \le 10$ 是否成立，成立输出 `Yes`，否则输出 `No`。

复杂度：时间 $O(1)$，空间 $O(1)$。

## 仓颉实现

```cangjie
import std.env.*
import std.convert.*

main(): Int64 {
    let reader = getStdIn()
    let ab = reader.readln().getOrThrow().split(" ", removeEmpty: true).map({ p => Int64.parse(p) })
    println(if (ab[0] + ab[1] <= 10) { "Yes" } else { "No" })
    return 0
}
```

要点：

- 判断条件与题目描述一致，直接比较总数与容量。
