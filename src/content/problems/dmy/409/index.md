---
oj: dmy
pid: '409'
title: '[R66A] Accepted'
difficulty: 入门
tags:
  - 模拟
timeLimit: 1s
memoryLimit: 512m
---

> 数据规模：$0 \le a \le b \le 10^9$，$b \ge 1$。

## 思路

获得满分当且仅当得分 $a$ 等于满分 $b$，比较后输出对应文案。

复杂度：时间 $O(1)$，空间 $O(1)$。

## 仓颉实现

```cangjie
import std.env.*
import std.convert.*

main() {
    let reader = getStdIn()
    let ab = reader.readln().getOrThrow().split(" ", removeEmpty: true).map({ p => Int64.parse(p) })
    println(if (ab[0] == ab[1]) { "Accepted" } else { "Unaccepted" })
}
```

要点：

- 满分判断就是 `a == b`，两个输出文案与样例一致，直接原样输出。
