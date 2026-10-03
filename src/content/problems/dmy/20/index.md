---
oj: dmy
pid: '20'
title: '[R4B] 保留DMY'
difficulty: 入门
tags:
  - 模拟
timeLimit: 1s
memoryLimit: 512m
---

## 思路

遍历字符串 $S$，仅保留字符 `D`、`M`、`Y` 输出。用布尔变量记录是否出现过这三种字符，若从未出现则输出 $-1$。

复杂度：时间 $O(n)$，空间 $O(1)$。

## 仓颉实现

<details>
<summary>查看仓颉实现</summary>

```cangjie
import std.env.*

main() {
    let reader = getStdIn()
    reader.readln().getOrThrow()
    let s = reader.readln().getOrThrow()
    var found = false
    for (ch in s.runes()) {
        if (ch == r'D' || ch == r'M' || ch == r'Y') {
            print(ch)
            found = true
        }
    }
    if (found) {
        println()
    } else {
        println(-1)
    }
}
```

</details>
