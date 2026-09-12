---
oj: dmy
pid: '386'
title: '[R62B] 字符串判断'
difficulty: 入门
tags:
  - 字符串
timeLimit: 1s
memoryLimit: 512m
---

> 数据规模：$1 \le n \le 100$，字符串仅由小写字母和 `?` 组成。

## 思路

逐位比较 $S$ 和 $T$：某一位能同时成立的条件是两字符相同，或者其中至少一个是 `?`（`?` 可以替换成任意小写字母，包括另一个字符本身）。所有位都满足则输出 `Yes`，否则 `No`。

复杂度：时间 $O(n)$，空间 $O(n)$。

## 仓颉实现

```cangjie
import std.env.*
import std.convert.*

main() {
    let reader = getStdIn()
    let n = Int64.parse(reader.readln().getOrThrow())
    let s = reader.readln().getOrThrow()
    let t = reader.readln().getOrThrow()
    var ok = true
    for (i in 0..n) {
        if (s[i] != t[i] && s[i] != UInt8(0x3F) && t[i] != UInt8(0x3F)) {
            ok = false
            break
        }
    }
    println(if (ok) { "Yes" } else { "No" })
}
```

要点：

- 不匹配只有一种情况：两个字符都不等于对方，且两者都不是 `?`（`0x3F`）。
- 发现不匹配立即 `break`，不必扫描完整个字符串。
