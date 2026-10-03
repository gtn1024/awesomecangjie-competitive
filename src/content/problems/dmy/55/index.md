---
oj: dmy
pid: '55'
title: '[R10A] 比大小'
difficulty: 入门
tags:
  - 数学
timeLimit: 1s
memoryLimit: 512m
---

> 数据规模：$1 \le a, b, c, d \le 1000$。

## 思路

$b$、$d$ 均为正数，两边同乘 $b \times d$ 不改变大小关系，因此只需比较 $a \times d$ 与 $b \times c$。

复杂度：时间 $O(1)$，空间 $O(1)$。

## 仓颉实现

<details>
<summary>查看仓颉实现</summary>

```cangjie
import std.convert.*
import std.env.*

main() {
    let reader = getStdIn()
    let line = reader.readln().getOrThrow().split(" ", removeEmpty: true).map({ p => Int64.parse(p) })
    let a = line[0]
    let b = line[1]
    let c = line[2]
    let d = line[3]
    let l = a * d
    let r = b * c
    if (l > r) {
        println(">")
    } else if (l < r) {
        println("<")
    } else {
        println("=")
    }
}
```

</details>
