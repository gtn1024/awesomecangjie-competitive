---
oj: dmy
pid: '457'
title: '[R74A] 这一场的标题很长'
difficulty: 入门
tags:
  - 字符串
  - 模拟
timeLimit: 1s
memoryLimit: 256m
---

> 数据规模：$0 \le k \le 10^5$，$1 \le |s| \le 10^5$，字符串 $s$ 仅由小写英文字母组成。

## 思路

直接比较字符串长度与阈值 $k$：长度严格大于 $k$ 输出 `Yes`，否则输出 `No`。

字符串只含小写英文字母，因此长度既等于字节数也等于字符数，取字符串的字节长度即可。

## 复杂度

时间 $O(|s|)$（读入），空间 $O(|s|)$。

## 仓颉实现

```cangjie
import std.convert.*
import std.env.*

main() {
    let reader = getStdIn()
    let k = Int64.parse(reader.readln().getOrThrow())
    let s = reader.readln().getOrThrow()
    if (Int64(s.size) > k) {
        println("Yes")
    } else {
        println("No")
    }
}
```
