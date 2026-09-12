---
oj: dmy
pid: '334'
title: '[R54A]制作人员'
difficulty: 入门
tags:
  - 字符串
timeLimit: 1s
memoryLimit: 512m
---

> 对于 $100\%$ 的数据，$1 \le |s| \le 100$，且 $s$ 中只包含小写字母。

## 思路

题目要求判断字符串 $s$ 中是否 **同时** 包含子串 `lzm` 和 `tom`。

由于字符串只含小写字母，可以直接按字节遍历。枚举所有长度为 $3$ 的连续子串起始位置 $i$（$0 \le i \le |s| - 3$），检查 `s[i..i+2]` 是否等于 `lzm` 或 `tom`，分别用两个布尔变量记录是否出现过。

最终若两个布尔变量均为真，输出 `Yes`，否则输出 `No`。

## 复杂度

- 时间复杂度：$O(|s|)$，只需一次线性扫描。
- 空间复杂度：$O(|s|)$，存储输入字符串。

## 仓颉实现

```cangjie
import std.env.*

main() {
    let reader = getStdIn()
    let s = reader.readln().getOrThrow()
    let n = s.size
    var hasLzm = false
    var hasTom = false
    if (n >= 3) {
        var i = 0
        while (i <= n - 3) {
            if (s[i] == UInt8(108) && s[i + 1] == UInt8(122) && s[i + 2] == UInt8(109)) {
                hasLzm = true
            } else if (s[i] == UInt8(116) && s[i + 1] == UInt8(111) && s[i + 2] == UInt8(109)) {
                hasTom = true
            }
            i += 1
        }
    }
    if (hasLzm && hasTom) {
        println("Yes")
    } else {
        println("No")
    }
}
```
