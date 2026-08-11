---
oj: dmy
pid: '79'
title: '[R14A] 感叹句!'
difficulty: 入门
tags:
  - 字符串
timeLimit: 1s
memoryLimit: 512m
---

> 数据规模：$1 \le n \le 10^5$，$S$ 仅由小写英文字母和 `?` 构成。

## 思路

把字符串中每个 `?` 替换成 `!` 后原样输出。`?`（`0x3F`）与 `!`（`0x21`）都是单字节 ASCII 字符，直接在字节层面替换即可，不必按字符处理。

复杂度：时间 $O(n)$，空间 $O(n)$。

## 仓颉实现

```cangjie
import std.env.*
import std.convert.*

main(): Int64 {
    let reader = getStdIn()
    let n = Int64.parse(reader.readln().getOrThrow())
    let s = reader.readln().getOrThrow()
    let bs = Array<UInt8>(n, { i =>
        if (s[i] == UInt8(0x3F)) {
            UInt8(0x21)
        } else {
            s[i]
        }
    })
    println(String.fromUtf8(bs))
    return 0
}
```

要点：

- 仓颉中字符串按下标访问得到的是 UTF-8 字节（`UInt8`），本题只涉及 ASCII 字符，字节级替换不会影响其他字节。
- 处理完的字节数组用 `String.fromUtf8` 还原成字符串输出。
