---
oj: dmy
pid: '481'
title: '[R78A] 删除字符'
difficulty: 入门
tags:
  - 模拟
  - 字符串
timeLimit: 1s
memoryLimit: 512m
---

> 数据规模：$1 \le n \le 100$，$1 \le x \le n$，$s$ 仅由小写英文字母组成。

## 思路

签到题。把字符串按下标切成两段：第 $x$ 个字符之前的部分 $s[0, x-1)$ 与之后的部分 $s[x, n)$，拼接输出即可。$x=1$ 时前一段为空，$x=n$ 时后一段为空，$n=1$ 时输出空行，均无需特判。

## 复杂度

时间复杂度 $O(n)$，空间复杂度 $O(n)$。

## 仓颉实现

```cangjie
import std.env.*
import std.convert.*

main() {
    let reader = getStdIn()
    let first = reader.readln().getOrThrow().split(" ", removeEmpty: true).map({ p: String => Int64.parse(p) })
    let n = first[0]
    let x = first[1]
    let s = reader.readln().getOrThrow()
    let xi = Int64(x)
    let ni = Int64(n)
    println(s[0..(xi - 1)] + s[xi..ni])
}
```
