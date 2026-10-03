---
oj: dmy
pid: '174'
title: '[R29A]相同整数'
difficulty: 入门
tags:
  - 模拟
timeLimit: 1s
memoryLimit: 512m
---

> 数据规模：$1 \le T \le 100$，$1 \le a, b, c \le 10^9$。

## 思路

按题面固定顺序依次比较三对数 $(a,b)$、$(a,c)$、$(b,c)$，相等就输出对应的字符串。用一个布尔量记录本组是否输出过任何一行，若三对都不相等则补输出一行 `No`。属于直接模拟。

## 复杂度

时间 $O(T)$，空间 $O(1)$。

## 仓颉实现

<details>
<summary>查看仓颉实现</summary>

```cangjie
import std.env.*
import std.convert.*

main() {
    let reader = getStdIn()
    let t = Int64.parse(reader.readln().getOrThrow())
    for (_ in 0..t) {
        let line = reader.readln().getOrThrow().split(" ", removeEmpty: true).map({ p: String => Int64.parse(p) })
        let a = line[0]
        let b = line[1]
        let c = line[2]
        var any = false
        if (a == b) {
            println("a-b")
            any = true
        }
        if (a == c) {
            println("a-c")
            any = true
        }
        if (b == c) {
            println("b-c")
            any = true
        }
        if (!any) {
            println("No")
        }
    }
}
```

</details>
